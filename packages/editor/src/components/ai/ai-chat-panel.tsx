'use client'

import {
  Armchair,
  Bot,
  Compass,
  Layers,
  LayoutGrid,
  MessageCircleQuestion,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
  type KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '../../lib/utils'
import {
  abortActiveLoop,
  answerPendingQuestion,
  confirmOperationsFromUI,
  rejectOperationsFromUI,
  retryLastAgentRun,
  runAgentLoop,
} from './ai-agent-loop'
import { generateCatalogSummary } from './ai-catalog-resolver'
import { useAIChat } from './ai-chat-store'
import {
  confirmActiveProposal,
  rejectAllProposals,
  switchToProposal,
} from './ai-proposal-manager'
import type { ChatMessage } from './types'
import { MessageBubble } from './chat-ui/message-bubble'
import { StreamingIndicator } from './chat-ui/streaming-indicator'
import { OperationHistoryPanel } from './chat-ui/operation-cards'
import { ProposalTabs } from './chat-ui/proposal-cards'

// ============================================================================
// Chat Panel Component
// ============================================================================

export function AIChatPanel() {
  // Fine-grained selectors
  const messages = useAIChat((s) => s.messages)
  const isStreaming = useAIChat((s) => s.isStreaming)
  const isAIProcessing = useAIChat((s) => s.isAIProcessing)
  const error = useAIChat((s) => s.error)
  const proposals = useAIChat((s) => s.proposals)
  const activeProposalId = useAIChat((s) => s.activeProposalId)
  const pendingQuestion = useAIChat((s) => s.pendingQuestion)
  const operationLog = useAIChat((s) => s.operationLog)
  const addUserMessage = useAIChat((s) => s.addUserMessage)
  const clearChat = useAIChat((s) => s.clearChat)
  const clearError = useAIChat((s) => s.clearError)
  const undoOperation = useAIChat((s) => s.undoOperation)

  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Speech-to-Text Initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setHasSpeechSupport(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = navigator.language || 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
          }
        }
        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        setIsListening(false)
      }
    }
  }, [isListening])

  // Cache catalog summary (expensive to regenerate)
  const catalogSummaryRef = useRef<string | null>(null)
  if (!catalogSummaryRef.current) {
    catalogSummaryRef.current = generateCatalogSummary()
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // Keep focus on textarea after React re-renders
  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 0)
    return () => clearTimeout(timer)
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input])

  // Listen for prompt re-use from message bubble
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent).detail as string
      if (text) {
        setInput(text)
        textareaRef.current?.focus()
      }
    }
    window.addEventListener('ai-populate-input', handler)
    return () => window.removeEventListener('ai-populate-input', handler)
  }, [])

  // Listen for placement option selections (debounced to prevent double-fire)
  const lastOptionSentRef = useRef('')
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent).detail as string
      if (text && !isAIProcessing && text !== lastOptionSentRef.current) {
        lastOptionSentRef.current = text
        addUserMessage(text)
        runAgentLoop({
          userMessage: text,
          catalogSummary: catalogSummaryRef.current!,
        })
        setTimeout(() => {
          lastOptionSentRef.current = ''
        }, 2000)
      }
    }
    window.addEventListener('ai-select-option', handler)
    return () => window.removeEventListener('ai-select-option', handler)
  }, [addUserMessage, isAIProcessing])

  const handleRunPrompt = useCallback(
    (promptText: string) => {
      const trimmed = promptText.trim()
      if (!trimmed || isStreaming || isAIProcessing) return

      if (pendingQuestion) {
        setInput('')
        answerPendingQuestion(trimmed)
        textareaRef.current?.focus()
        return
      }

      setInput('')
      addUserMessage(trimmed)

      runAgentLoop({
        userMessage: trimmed,
        catalogSummary: catalogSummaryRef.current!,
      })

      textareaRef.current?.focus()
    },
    [isStreaming, isAIProcessing, pendingQuestion, addUserMessage],
  )

  const handleSend = useCallback(() => {
    handleRunPrompt(input)
  }, [handleRunPrompt, input])

  const handleStop = useCallback(() => {
    abortActiveLoop()
    useAIChat.setState({ isAIProcessing: false, isStreaming: false, streamingContent: '' })
    textareaRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      } else if (e.key === 'Escape') {
        if (isStreaming || isAIProcessing) {
          e.preventDefault()
          handleStop()
        }
      }
    },
    [handleSend, handleStop, isStreaming, isAIProcessing],
  )

  const handleProposalConfirm = useCallback(() => {
    const ops = confirmActiveProposal()
    if (ops) {
      const pendingMsg = [...messages].reverse().find(
        (m) => m.operationStatus === 'pending' && m.operations?.length,
      )
      if (pendingMsg) {
        confirmOperationsFromUI(pendingMsg.id, pendingMsg.operations!)
      }
    }
  }, [messages])

  const handleProposalReject = useCallback(() => {
    rejectAllProposals()
    const pendingMsg = [...messages].reverse().find(
      (m) => m.operationStatus === 'pending' && m.operations?.length,
    )
    if (pendingMsg) {
      rejectOperationsFromUI(pendingMsg.id)
    }
  }, [messages])

  const isBusy = isStreaming || (isAIProcessing && !pendingQuestion)

  return (
    <div className="flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Proposal Tabs (multi-proposal comparison mode) */}
      {proposals.length > 1 && (
        <ProposalTabs
          activeProposalId={activeProposalId}
          onConfirm={handleProposalConfirm}
          onReject={handleProposalReject}
          onSwitch={switchToProposal}
          proposals={proposals}
        />
      )}

      {/* Messages / Suggestions Area */}
      <div className="subtle-scrollbar flex-1 min-h-0 overflow-y-auto p-3">
        {messages.length === 0 && !isStreaming ? (
          <CategorizedEmptyState
            onEditPrompt={(text) => {
              setInput(text)
              textareaRef.current?.focus()
            }}
            onRunPrompt={handleRunPrompt}
          />
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            <MessageList messages={messages} />
            <StreamingIndicator messagesEndRef={messagesEndRef} />

            {/* Pending Question from AI */}
            {pendingQuestion && (
              <PendingQuestionCard
                onSuggestionClick={(suggestion) => {
                  answerPendingQuestion(suggestion)
                  textareaRef.current?.focus()
                }}
                question={pendingQuestion.question}
                suggestions={pendingQuestion.suggestions}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden border-destructive/30 border-t bg-destructive/10 px-3 py-2 shrink-0"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-barlow text-destructive text-xs">{error}</p>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  className="flex items-center gap-1 rounded border border-destructive/30 px-1.5 py-0.5 font-barlow text-[11px] text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    clearError()
                    retryLastAgentRun()
                  }}
                  type="button"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  className="text-destructive/60 hover:text-destructive"
                  onClick={clearError}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operation History */}
      {operationLog.length > 0 && (
        <OperationHistoryPanel logs={operationLog} onUndo={undoOperation} />
      )}

      {/* Quick Prompts Bar (when messages exist and AI is idle) */}
      {messages.length > 0 && !isBusy && (
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-border/40 border-t bg-muted/10 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Sparkles className="h-3 w-3 shrink-0 text-sidebar-primary" />
          {QUICK_CHIPS.map((chip) => (
            <button
              className="shrink-0 rounded-full border border-border/60 bg-card/90 px-2.5 py-1 font-barlow text-[11px] font-medium text-muted-foreground transition-all hover:border-sidebar-primary/50 hover:bg-sidebar-primary/10 hover:text-sidebar-primary active:scale-95 shadow-2xs"
              key={chip.label}
              onClick={() => handleRunPrompt(chip.prompt)}
              title={`Run: ${chip.prompt}`}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 border-border/40 border-t bg-background/95 p-3 backdrop-blur-md">
        <div className="relative flex flex-col rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-2xs transition-all focus-within:border-sidebar-primary/60 focus-within:ring-2 focus-within:ring-sidebar-primary/15">
          <textarea
            ref={textareaRef}
            className="w-full resize-none bg-transparent px-3.5 pt-2.5 pb-1 font-barlow text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/50 max-h-[140px] min-h-[38px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            disabled={isBusy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingQuestion ? 'Answer AI question...' : 'Ask AI to add, furnish, or layout...'}
            rows={1}
            value={input}
          />

          <div className="flex items-center justify-between px-2.5 pb-2 pt-1 select-none">
            {/* Left controls: Mic and shortcut hint */}
            <div className="flex items-center gap-1.5">
              {hasSpeechSupport && (
                <button
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isListening
                      ? 'text-red-500 bg-red-500/10 animate-pulse'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40',
                  )}
                  disabled={isBusy}
                  onClick={toggleListening}
                  title={isListening ? 'Stop listening' : 'Dictate with microphone'}
                  type="button"
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
              )}
              <span className="font-barlow text-[10px] text-muted-foreground/40">
                {isBusy ? 'Esc to cancel' : 'Enter ↵'}
              </span>
            </div>

            {/* Right controls: Send or Stop Button */}
            <div className="flex items-center gap-1.5">
              {isBusy ? (
                <button
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-destructive text-white shadow-xs transition-all hover:bg-destructive/90 active:scale-95"
                  onClick={handleStop}
                  title="Stop generation (Esc)"
                  type="button"
                >
                  <Square className="h-3 w-3 fill-current" />
                </button>
              ) : (
                <button
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-all',
                    input.trim()
                      ? 'bg-sidebar-primary text-white shadow-xs hover:bg-sidebar-primary/90 hover:scale-105 active:scale-95'
                      : 'bg-muted/40 text-muted-foreground/30 cursor-not-allowed',
                  )}
                  disabled={!input.trim()}
                  onClick={handleSend}
                  title="Send message (Enter)"
                  type="button"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="mt-1.5 flex items-center justify-end px-1">
            <button
              className="flex items-center gap-1 font-barlow text-[10px] text-muted-foreground/50 transition-colors hover:text-destructive"
              onClick={clearChat}
              type="button"
            >
              <Trash2 className="h-3 w-3" />
              Clear conversation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MessageList
// ============================================================================

const MessageList = memo(function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </>
  )
})

// ============================================================================
// Quick Chips & Categorized Empty State
// ============================================================================

const QUICK_CHIPS = [
  { label: '🛋️ Living room', prompt: 'Furnish the living room with a sofa, coffee table, and media cabinet' },
  { label: '🛏️ Bedroom', prompt: 'Furnish the bedroom with a queen bed and nightstands' },
  { label: '🚪 Doors & Windows', prompt: 'Add an interior door and window to the main walls' },
  { label: '🍽️ Dining set', prompt: 'Add a 4-chair modern dining table set' },
  { label: '📐 Check clearance', prompt: 'Check spatial clearances and optimize walkways' },
]

const CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'plans', label: 'Plans', icon: Layers },
  { id: 'furniture', label: 'Furniture', icon: Armchair },
  { id: 'optimize', label: 'Optimize', icon: Compass },
]

const CATEGORY_PROMPTS: Record<
  string,
  { title: string; prompt: string; desc: string; icon: string }[]
> = {
  plans: [
    {
      title: 'One-Bedroom Apartment',
      prompt: 'Create a one-bedroom apartment floor plan with living room, bedroom, and kitchen',
      desc: 'Partitions rooms with walls and doorways',
      icon: '🏢',
    },
    {
      title: 'Rectangular 2-Bed House',
      prompt: 'Build a rectangular two-bedroom house plan with perimeter walls',
      desc: 'Balanced dual-bedroom architectural layout',
      icon: '🏡',
    },
    {
      title: 'Doors & Windows',
      prompt: 'Add an entrance door and perimeter windows to the walls',
      desc: 'Standard openings on exterior/interior walls',
      icon: '🚪',
    },
  ],
  furniture: [
    {
      title: 'Modern Living Room',
      prompt: 'Furnish the living room with a sofa, coffee table, and media cabinet',
      desc: 'Conversation seating facing the focal wall',
      icon: '🛋️',
    },
    {
      title: 'Master Bedroom Suite',
      prompt: 'Set up a master bedroom with a queen bed, two nightstands, and a wardrobe',
      desc: 'Comfortable bedroom layout with clearance',
      icon: '🛏️',
    },
    {
      title: 'Kitchen & Dining Area',
      prompt: 'Add kitchen base cabinets and a 4-chair dining table set',
      desc: 'Standard kitchen setup and dining arrangement',
      icon: '🍽️',
    },
  ],
  optimize: [
    {
      title: 'Walking Clearance',
      prompt: 'Check walking clearances and adjust furniture to leave clear paths',
      desc: 'Fixes walkway bottlenecks and collisions',
      icon: '📐',
    },
    {
      title: 'Rearrange Furniture',
      prompt: 'Rearrange the furniture for optimal light and spatial flow',
      desc: 'Opens up natural light paths and movement',
      icon: '✨',
    },
  ],
}

function CategorizedEmptyState({
  onRunPrompt,
  onEditPrompt,
}: {
  onRunPrompt: (text: string) => void
  onEditPrompt: (text: string) => void
}) {
  const [activeTab, setActiveTab] = useState('all')

  const items =
    activeTab === 'all'
      ? Object.values(CATEGORY_PROMPTS).flat()
      : CATEGORY_PROMPTS[activeTab] || []

  return (
    <div className="flex flex-col items-center justify-center px-1 py-2">
      {/* Compact Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sidebar-primary/15 ring-1 ring-sidebar-primary/25">
          <Bot className="h-4 w-4 text-sidebar-primary" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <h3 className="font-barlow font-semibold text-xs text-foreground">AI Architect</h3>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          </div>
          <p className="font-barlow text-[10px] text-muted-foreground">Click any prompt to run instantly</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-2.5 flex w-full justify-center gap-1 rounded-lg border border-border/40 bg-accent/20 p-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = activeTab === cat.id
          return (
            <button
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-0.5 font-barlow text-[10px] font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
              )}
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              type="button"
            >
              <Icon className="h-2.5 w-2.5" />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Prompt Cards (Compact & Click to Execute) */}
      <div className="mt-2 grid w-full grid-cols-1 gap-1.5">
        {items.slice(0, 4).map((item) => (
          <div
            className="group flex items-center justify-between rounded-lg border border-border/40 bg-accent/20 p-2 text-left transition-all hover:border-sidebar-primary/50 hover:bg-accent/40 hover:shadow-xs"
            key={item.title}
          >
            <button
              className="flex flex-1 items-center gap-2 overflow-hidden text-left"
              onClick={() => onRunPrompt(item.prompt)}
              title="Click to run this design action"
              type="button"
            >
              <span className="text-sm shrink-0">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="font-barlow text-xs font-medium text-foreground group-hover:text-sidebar-primary transition-colors block truncate">
                  {item.title}
                </span>
                <span className="font-barlow text-[10px] text-muted-foreground/80 block truncate">
                  {item.desc}
                </span>
              </div>
            </button>

            {/* Actions: Run / Edit */}
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              <button
                className="rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
                onClick={() => onEditPrompt(item.prompt)}
                title="Edit prompt in input box"
                type="button"
              >
                <Sparkles className="h-3 w-3" />
              </button>
              <button
                className="flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-primary text-white shadow-xs transition-transform active:scale-95 group-hover:bg-sidebar-primary/90"
                onClick={() => onRunPrompt(item.prompt)}
                title="Execute directly"
                type="button"
              >
                <Send className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Pending Question Card
// ============================================================================

function PendingQuestionCard({
  question,
  suggestions,
  onSuggestionClick,
}: {
  question: string
  suggestions?: string[]
  onSuggestionClick: (suggestion: string) => void
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5 w-full"
      initial={{ opacity: 0, y: 8 }}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs mt-0.5">
        <MessageCircleQuestion className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-xs border border-amber-500/35 bg-amber-500/10 dark:bg-amber-500/5 backdrop-blur-md px-3.5 py-3 shadow-2xs">
        <p className="font-barlow text-[13px] font-medium text-foreground">{question}</p>
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                className="rounded-xl border border-amber-500/35 bg-card/80 px-2.5 py-1 font-barlow text-xs font-medium text-foreground transition-all hover:bg-amber-500/20 hover:border-amber-500/60 active:scale-95 shadow-2xs"
                key={s}
                onClick={() => onSuggestionClick(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
