// ============================================================================
// AI Chat Service
//
// Single entry point for backend LLM calls. Owns everything vendor-agnostic:
//   - provider resolution (AI_PROVIDER → adapter registry)
//   - model routing lists (primary + fallbacks)
//   - retry with exponential backoff, honoring Retry-After
//
// Layering:  route handler → chat service → provider adapter → vendor API
// The frontend chat pipeline is untouched by this layer.
// ============================================================================

import type { APIError } from 'openai'
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'
import type { Stream } from 'openai/streaming'
import {
  AI_CHAT_FALLBACK_MODELS,
  AI_CHAT_MAX_TOKENS,
  AI_CHAT_MODEL,
  AI_MAX_RETRIES,
  AI_PROVIDER,
  AI_STREAM_INCLUDE_USAGE,
  AI_SUMMARIZE_FALLBACK_MODELS,
  AI_SUMMARIZE_MAX_TOKENS,
  AI_SUMMARIZE_MODEL,
} from './config'
import { openAICompatibleProvider } from './providers/openai-compatible'
import type { ChatProvider, ChatRequestParams } from './providers/types'

// ============================================================================
// Provider registry
// ============================================================================

const PROVIDERS: Record<string, ChatProvider> = {
  'openai-compatible': openAICompatibleProvider,
}

function resolveProvider(): ChatProvider {
  const provider = PROVIDERS[AI_PROVIDER]
  if (!provider) {
    throw new Error(
      `Unknown AI_PROVIDER "${AI_PROVIDER}". Available: ${Object.keys(PROVIDERS).join(', ')}.`,
    )
  }
  return provider
}

// ============================================================================
// Normalized error
// ============================================================================

/** Upstream status carried through so routes can map to HTTP codes unchanged. */
export class AIProviderError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AIProviderError'
    this.status = status
  }
}

function toProviderError(err: unknown): AIProviderError {
  if (err instanceof AIProviderError) return err
  const apiErr = err as APIError & { headers?: Record<string, string | string[]> }
  if (apiErr?.status) {
    return new AIProviderError(apiErr.message ?? 'Upstream AI API error', apiErr.status)
  }
  return new AIProviderError(err instanceof Error ? err.message : 'Upstream AI API error')
}

// ============================================================================
// Retry with backoff
// ============================================================================

/** Statuses worth retrying: rate limits, transient server errors, timeouts. */
const RETRYABLE_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529])

export function isRetryableError(err: unknown): boolean {
  if (!(err instanceof AIProviderError)) return false
  if (err.status === undefined) return true // network error / timeout
  return RETRYABLE_STATUSES.has(err.status)
}

const BASE_RETRY_DELAY_MS = 1_000
const MAX_RETRY_DELAY_MS = 8_000

/**
 * Backoff for one retry: the provider's Retry-After header (seconds) when
 * present, otherwise exponential 1s → 2s → 4s … capped at 8s.
 */
export function computeRetryDelayMs(err: AIProviderError, attempt: number): number {
  const retryAfter = extractRetryAfterSeconds(err)
  if (retryAfter !== null) {
    return Math.min(retryAfter * 1_000, MAX_RETRY_DELAY_MS)
  }
  return Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS)
}

function extractRetryAfterSeconds(err: AIProviderError): number | null {
  const retryAfter = (err as AIProviderError & { retryAfterSeconds?: number }).retryAfterSeconds
  if (typeof retryAfter === 'number' && retryAfter > 0) return retryAfter
  return null
}

/** Retain the Retry-After hint when normalizing rate-limit errors. */
function preserveRetryAfter(target: AIProviderError, source: unknown): AIProviderError {
  const headers = (source as { headers?: Record<string, string | string[]> })?.headers
  const raw = headers?.['retry-after']
  const value = Array.isArray(raw) ? raw[0] : raw
  const seconds = value ? Number(value) : Number.NaN
  if (!Number.isNaN(seconds) && seconds > 0) {
    ;(target as AIProviderError & { retryAfterSeconds?: number }).retryAfterSeconds = seconds
  }
  return target
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(timer)
      reject(new DOMException('Aborted while waiting to retry', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/** Retry policy wrapper — exported for tests. Runs `fn` with the configured
 * number of attempts; only retryable upstream failures trigger another try. */
export async function withRetries<T>(fn: () => Promise<T>, signal: AbortSignal): Promise<T> {
  let lastError: AIProviderError | null = null

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError' || signal.aborted) throw err

      const providerError = preserveRetryAfter(toProviderError(err), err)
      lastError = providerError

      const canRetry = attempt < AI_MAX_RETRIES && isRetryableError(providerError)
      if (!canRetry) throw providerError

      console.warn(
        `[AI] Upstream attempt ${attempt + 1} failed (${providerError.status ?? 'network'}), retrying…`,
      )
      await sleep(computeRetryDelayMs(providerError, attempt), signal)
    }
  }

  throw lastError ?? new AIProviderError('Upstream AI API failed')
}

// ============================================================================
// Public service API
// ============================================================================

export async function streamChatCompletion(
  params: {
    messages: ChatCompletionMessageParam[]
    tools?: ChatCompletionTool[]
  },
  signal: AbortSignal,
): Promise<Stream<ChatCompletionChunk>> {
  const request: ChatRequestParams = {
    models: [AI_CHAT_MODEL, ...AI_CHAT_FALLBACK_MODELS],
    maxTokens: AI_CHAT_MAX_TOKENS,
    messages: params.messages,
    tools: params.tools,
    includeUsage: AI_STREAM_INCLUDE_USAGE,
  }

  const provider = resolveProvider()
  return withRetries(() => provider.createChatStream(request, signal), signal)
}

export async function createChatCompletion(
  params: {
    messages: ChatCompletionMessageParam[]
  },
  signal: AbortSignal,
): Promise<ChatCompletion> {
  const request: ChatRequestParams = {
    models: [AI_SUMMARIZE_MODEL, ...AI_SUMMARIZE_FALLBACK_MODELS],
    maxTokens: AI_SUMMARIZE_MAX_TOKENS,
    messages: params.messages,
    includeUsage: false,
  }

  const provider = resolveProvider()
  return withRetries(() => provider.createChatCompletion(request, signal), signal)
}
