// ============================================================================
// ChatProvider contract — the seam for swapping AI vendors.
//
// The rest of the app speaks OpenAI wire format (chat completions + SSE
// chunk deltas), so a provider's job is only: given normalized request
// params, produce an OpenAI-shaped stream or completion. Everything else
// (model fallback, retries, timeouts) lives in the chat service, not in
// adapters, so every vendor benefits from them equally.
// ============================================================================

import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'
import type { Stream } from 'openai/streaming'

export interface ChatRequestParams {
  /** Ordered routing list: primary model first, fallbacks after */
  models: string[]
  maxTokens: number
  messages: ChatCompletionMessageParam[]
  tools?: ChatCompletionTool[]
  /** Emit a final usage chunk (stream_options.include_usage) */
  includeUsage: boolean
}

export interface ChatProvider {
  /** Start a streaming chat completion. Throws before any chunk is emitted
   * on transport/auth/model errors; once returned, the stream owns errors. */
  createChatStream(
    params: ChatRequestParams,
    signal: AbortSignal,
  ): Promise<Stream<ChatCompletionChunk>>

  /** Non-streaming chat completion (summarization path). */
  createChatCompletion(params: ChatRequestParams, signal: AbortSignal): Promise<ChatCompletion>
}
