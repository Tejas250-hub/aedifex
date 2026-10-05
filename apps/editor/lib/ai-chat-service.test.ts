import { expect, test } from 'bun:test'
import {
  AIProviderError,
  computeRetryDelayMs,
  isRetryableError,
  withRetries,
} from '../app/api/ai/chat-service'

function rateLimitError(retryAfterSeconds?: number): AIProviderError {
  const err = new AIProviderError('rate limited', 429)
  if (retryAfterSeconds !== undefined) {
    ;(err as AIProviderError & { retryAfterSeconds?: number }).retryAfterSeconds = retryAfterSeconds
  }
  return err
}

test('isRetryableError: only transient upstream failures retry', () => {
  expect(isRetryableError(new AIProviderError('rate limited', 429))).toBe(true)
  expect(isRetryableError(new AIProviderError('bad gateway', 502))).toBe(true)
  expect(isRetryableError(new AIProviderError('timeout', 504))).toBe(true)
  // No status = network/timeout error before a response arrived
  expect(isRetryableError(new AIProviderError('fetch failed'))).toBe(true)
  // Auth and request errors are permanent — retrying cannot help
  expect(isRetryableError(new AIProviderError('unauthorized', 401))).toBe(false)
  expect(isRetryableError(new AIProviderError('bad request', 400))).toBe(false)
  expect(isRetryableError(new Error('not a provider error'))).toBe(false)
})

test('computeRetryDelayMs: exponential backoff capped at 8s', () => {
  expect(computeRetryDelayMs(rateLimitError(), 0)).toBe(1_000)
  expect(computeRetryDelayMs(rateLimitError(), 1)).toBe(2_000)
  expect(computeRetryDelayMs(rateLimitError(), 2)).toBe(4_000)
  expect(computeRetryDelayMs(rateLimitError(), 10)).toBe(8_000)
})

test('computeRetryDelayMs: provider Retry-After wins over backoff', () => {
  expect(computeRetryDelayMs(rateLimitError(5), 0)).toBe(5_000)
  // Header larger than the cap clamps to 8s so one bad header cannot stall the route
  expect(computeRetryDelayMs(rateLimitError(60), 0)).toBe(8_000)
})

test('withRetries: recovers when a retryable failure is followed by success', async () => {
  const controller = new AbortController()
  let calls = 0
  // retryAfterSeconds of 0.02 keeps the test fast — real headers are whole seconds
  const result = await withRetries(async () => {
    calls++
    if (calls < 3) throw rateLimitError(0.02)
    return 'ok'
  }, controller.signal)
  expect(result).toBe('ok')
  expect(calls).toBe(3)
})

test('withRetries: permanent errors fail fast without retrying', async () => {
  const controller = new AbortController()
  let calls = 0
  expect(
    withRetries(async () => {
      calls++
      throw new AIProviderError('unauthorized', 401)
    }, controller.signal),
  ).rejects.toThrow('unauthorized')
  await new Promise((resolve) => setTimeout(resolve, 20))
  expect(calls).toBe(1)
})

test('withRetries: throws the last upstream error after exhausting attempts', async () => {
  const controller = new AbortController()
  let calls = 0
  expect(
    withRetries(async () => {
      calls++
      throw rateLimitError(0.02)
    }, controller.signal),
  ).rejects.toBeInstanceOf(AIProviderError)
  await new Promise((resolve) => setTimeout(resolve, 120))
  // default AI_MAX_RETRIES = 2 → initial attempt + 2 retries
  expect(calls).toBe(3)
})
