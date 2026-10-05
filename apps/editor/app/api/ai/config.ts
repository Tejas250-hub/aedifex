// ============================================================================
// AI API Configuration
// All AI-related environment variables centralized here.
// ============================================================================

import OpenAI from 'openai'

/** LLM API key (required) */
export const AI_API_KEY = process.env.AI_API_KEY ?? ''

/** LLM API base URL — supports OpenAI, OpenRouter, and any OpenAI-compatible endpoint */
export const AI_BASE_URL = process.env.AI_BASE_URL ?? 'https://api.openai.com/v1'

/** Primary model for chat (tool-use capable) */
export const AI_CHAT_MODEL = process.env.AI_CHAT_MODEL ?? 'gpt-4o'

/** Lightweight model for summarization */
export const AI_SUMMARIZE_MODEL = process.env.AI_SUMMARIZE_MODEL ?? 'gpt-4o-mini'

/**
 * Fallback models (comma-separated), tried in order when the primary model's
 * provider fails (429/5xx). OpenRouter routes across the list automatically;
 * on other base URLs the primary model is used alone.
 */
export const AI_CHAT_FALLBACK_MODELS = parseModelList(process.env.AI_CHAT_FALLBACK_MODELS)
export const AI_SUMMARIZE_FALLBACK_MODELS = parseModelList(process.env.AI_SUMMARIZE_FALLBACK_MODELS)

/** Max output tokens per request */
export const AI_CHAT_MAX_TOKENS = Number(process.env.AI_CHAT_MAX_TOKENS ?? 4096)
export const AI_SUMMARIZE_MAX_TOKENS = Number(process.env.AI_SUMMARIZE_MAX_TOKENS ?? 4096)

/**
 * Server-side retry attempts for transient upstream failures (429/5xx/network),
 * with backoff that honors the provider's Retry-After header.
 */
export const AI_MAX_RETRIES = Number(process.env.AI_MAX_RETRIES ?? 2)

/** Per-request timeout in ms (time to first byte for streams) */
export const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 120_000)

/**
 * Request token usage in the final SSE chunk (stream_options.include_usage).
 * Needed for the agent loop's token budget; disable only for endpoints that
 * reject the stream_options parameter.
 */
export const AI_STREAM_INCLUDE_USAGE = process.env.AI_STREAM_INCLUDE_USAGE !== 'false'

/** Provider implementation used by the chat service ('openai-compatible' default) */
export const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai-compatible'

function parseModelList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

/** Factory function — creates a pre-configured OpenAI client. Retries are
 * handled by the chat service (Retry-After aware), so the SDK retries stay off. */
export function createAIClient(): OpenAI {
  return new OpenAI({
    apiKey: AI_API_KEY,
    baseURL: AI_BASE_URL,
    maxRetries: 0,
    timeout: AI_TIMEOUT_MS,
  })
}

/** OpenRouter accepts a `models` array for automatic cross-model fallback */
export function supportsModelRouting(): boolean {
  return AI_BASE_URL.includes('openrouter.ai')
}
