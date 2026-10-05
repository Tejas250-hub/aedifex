'use client'

import { Bot, Loader2 } from 'lucide-react'
import { AIMarkdown } from '../ai-markdown'
import { memo, useEffect, useRef } from 'react'
import { useAIChat } from '../ai-chat-store'

// ============================================================================
// StreamingIndicator — subscribes only to streamingContent + isStreaming
// High-frequency streaming updates (dozens/sec) are isolated here so the rest
// of the panel does not re-render on every incoming chunk.
// ============================================================================

export const StreamingIndicator = memo(function StreamingIndicator({
  messagesEndRef,
}: {
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}) {
  const isStreaming = useAIChat((s) => s.isStreaming)
  const isAIProcessing = useAIChat((s) => s.isAIProcessing)
  const pendingQuestion = useAIChat((s) => s.pendingQuestion)
  const streamingContent = useAIChat((s) => s.streamingContent)
  const iterationCount = useAIChat((s) => s.iterationCount)

  const isVisible = (isStreaming || isAIProcessing) && !pendingQuestion

  // Scroll to bottom whenever streaming content updates (throttled via rAF)
  const scrollRafRef = useRef(0)
  useEffect(() => {
    if (!isVisible) return
    if (scrollRafRef.current) return // already scheduled
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [streamingContent, isVisible, messagesEndRef])

  if (!isVisible) return null

  const getStatusText = () => {
    if (streamingContent) return null
    if (isStreaming) {
      return iterationCount > 1
        ? `Iteration ${iterationCount} — Generating response...`
        : 'Analyzing scene & designing...'
    }
    return iterationCount > 1
      ? `Iteration ${iterationCount} — Executing 3D scene mutations...`
      : 'Thinking & preparing actions...'
  }

  const statusText = getStatusText()

  return (
    <div className="flex w-full gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30 ring-2 ring-sidebar-primary/25 shadow-xs mt-0.5">
        <Bot className="h-4 w-4 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-xs border border-border/60 bg-card/80 dark:bg-card/40 backdrop-blur-md px-3.5 py-3 font-barlow text-[13px] shadow-2xs">
        {streamingContent ? (
          <AIMarkdown content={streamingContent} />
        ) : (
          <div className="flex items-center gap-2 py-0.5 text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-sidebar-primary" />
            <span className="text-xs font-medium">{statusText}</span>
            <span className="flex gap-1 ml-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-bounce" />
            </span>
          </div>
        )}
      </div>
    </div>
  )
})
