'use client'

import { Bot, Check, Copy, RotateCcw } from 'lucide-react'
import { AIMarkdown } from '../ai-markdown'
import { memo, useState } from 'react'
import { cn } from '../../../lib/utils'
import { useAIChat } from '../ai-chat-store'
import type { ChatMessage } from '../types'
import { BeforeAfterComparison, OperationSummary } from './operation-cards'
import { PlacementProposalCards } from './proposal-cards'

// ============================================================================
// Message Bubble
// ============================================================================

export const MessageBubble = memo(function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const hasContent = message.content.trim().length > 0
  const hasOperations = message.operations && message.operations.length > 0
  const hasProposal = message.toolCalls?.some((tc) => tc.tool === 'propose_placement')
  const askUserCall = message.toolCalls?.find((tc) => tc.tool === 'ask_user') as
    | { tool: 'ask_user'; question: string; suggestions?: string[] }
    | undefined
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!message.content) return
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReuse = () => {
    if (!message.content) return
    window.dispatchEvent(new CustomEvent('ai-populate-input', { detail: message.content }))
  }

  // Format timestamp if available
  const timeString = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null
  // Only show ask_user history card when the question has been answered
  // (pendingQuestion is null). While pending, PendingQuestionCard handles it.
  const pendingQuestion = useAIChat((s) => s.pendingQuestion)
  const showAskUserHistory = askUserCall && !pendingQuestion
  const hasScreenshots = message.screenshotBefore && message.screenshotAfter

  // Skip rendering truly empty assistant bubbles (no content, no tool calls, nothing)
  if (!isUser && !hasContent && !hasOperations && !hasProposal && !showAskUserHistory && !hasScreenshots) {
    return null
  }

  return (
    <div className={cn('flex w-full gap-2.5 group/msg', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/25 shadow-xs mt-0.5">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          'font-barlow text-[13px] leading-relaxed transition-all',
          isUser
            ? 'max-w-[85%] rounded-2xl rounded-tr-xs bg-sidebar-primary text-white shadow-xs px-3.5 py-2.5 font-medium'
            : 'flex-1 min-w-0 rounded-2xl rounded-tl-xs border border-border/60 bg-card/80 dark:bg-card/40 backdrop-blur-md px-3.5 py-3 shadow-2xs',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : hasContent ? (
          <AIMarkdown content={message.content} />
        ) : null}

        {/* ask_user question preserved in message history (read-only, already answered) */}
        {showAskUserHistory && (
          <div className={cn('rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-foreground/90', hasContent && 'mt-2.5')}>
            <p className="font-barlow text-xs font-medium">{askUserCall.question}</p>
            {askUserCall.suggestions && askUserCall.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {askUserCall.suggestions.map((s) => (
                  <span
                    className="rounded-lg border border-border/40 bg-background/60 px-2 py-0.5 font-barlow text-[11px] text-muted-foreground shadow-2xs"
                    key={s}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Placement proposal options — hide after user selects one */}
        {hasProposal &&
          message.operationStatus !== 'confirmed' &&
          message.operationStatus !== 'rejected' && (
          <div className="mt-2.5">
            <PlacementProposalCards
              message={message}
              onSelectOption={(option) => {
                const pos = option.position
                const text = `Apply placement option "${option.id}: ${option.label}" using a single add_item call: catalogSlug="${option.catalogSlug}", position=[${pos[0]}, ${pos[1]}, ${pos[2]}], rotationY=${option.rotationY}. Do NOT remove, move, or modify any existing items in the scene — only add this one item.`
                window.dispatchEvent(new CustomEvent('ai-select-option', { detail: text }))
              }}
            />
          </div>
        )}

        {/* Operation summary */}
        {message.operations && message.operations.length > 0 && (
          <div className="mt-2.5 border-border/40 border-t pt-2">
            <OperationSummary
              messageId={message.id}
              operations={message.operations}
              status={message.operationStatus}
            />
          </div>
        )}

        {/* Before/After thumbnails with click-to-enlarge */}
        {message.screenshotBefore && message.screenshotAfter && (
          <div className="mt-2.5">
            <BeforeAfterComparison
              after={message.screenshotAfter}
              before={message.screenshotBefore}
            />
          </div>
        )}

        {/* Footer with timestamp and action buttons */}
        <div
          className={cn(
            'mt-2 flex items-center pt-1 text-[11px] select-none',
            isUser ? 'justify-between text-white/75 gap-2' : 'justify-between text-muted-foreground/70',
          )}
        >
          {isUser ? (
            <>
              <button
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-white/70 hover:bg-white/15 hover:text-white transition-all active:scale-95"
                onClick={handleReuse}
                title="Edit / Re-use prompt"
                type="button"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Edit</span>
              </button>
              {timeString && <span className="font-mono text-[10px] text-white/60">{timeString}</span>}
            </>
          ) : (
            <>
              <button
                className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] text-muted-foreground transition-all hover:bg-accent/40 hover:text-foreground active:scale-95"
                onClick={handleCopy}
                title="Copy response"
                type="button"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 opacity-70" />
                )}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {timeString && <span className="font-mono text-[10px] text-muted-foreground/50">{timeString}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  )
})
