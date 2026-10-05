'use client'

import { type ReactNode, useMemo } from 'react'

/**
 * Lightweight Markdown renderer — zero dependencies.
 * Supports: heading, bold, italic, inline code, code block,
 *           unordered list, ordered list, paragraph, line break.
 */
export function AIMarkdown({ content }: { content: string }) {
  const elements = useMemo(() => parseMarkdown(content), [content])
  return <div className="space-y-2 text-[13px] leading-relaxed text-foreground/90 font-barlow break-words">{elements}</div>
}

// ============================================================================
// Parser
// ============================================================================

function parseMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n')
  const elements: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Code block ```
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = []
      i++ // skip opening ```
      while (i < lines.length && !lines[i]!.trim().startsWith('```')) {
        codeLines.push(lines[i]!)
        i++
      }
      i++ // skip closing ```
      elements.push(
        <pre
          key={elements.length}
          className="overflow-x-auto rounded-lg bg-black/40 border border-border/40 p-2.5 font-mono text-xs leading-relaxed text-white/90 my-1"
        >
          {codeLines.join('\n')}
        </pre>,
      )
      continue
    }

    // Heading ### ## #
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1]!.length
      const text = headingMatch[2]!
      const Tag = level <= 2 ? 'h3' : 'h4'
      const className =
        level <= 2
          ? 'font-semibold text-sm text-foreground pt-1'
          : 'font-medium text-[13px] text-foreground/90 pt-0.5'
      elements.push(
        <Tag key={elements.length} className={className}>
          {renderInline(text)}
        </Tag>,
      )
      i++
      continue
    }

    // Unordered list
    if (/^\s*[-*]\s/.test(line)) {
      const listItems: ReactNode[] = []
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i]!)) {
        const itemText = lines[i]!.replace(/^\s*[-*]\s+/, '')
        listItems.push(
          <li key={listItems.length} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sidebar-primary/70" />
            <span className="flex-1 min-w-0">{renderInline(itemText)}</span>
          </li>,
        )
        i++
      }
      elements.push(
        <ul key={elements.length} className="space-y-1.5 my-1 pl-1">
          {listItems}
        </ul>,
      )
      continue
    }

    // Ordered list
    if (/^\s*\d+[.)]\s/.test(line)) {
      const listItems: ReactNode[] = []
      let num = 1
      while (i < lines.length && /^\s*\d+[.)]\s/.test(lines[i]!)) {
        const itemText = lines[i]!.replace(/^\s*\d+[.)]\s+/, '')
        listItems.push(
          <li key={listItems.length} className="flex items-start gap-2">
            <span className="w-4 shrink-0 text-right font-mono text-[11px] font-semibold text-sidebar-primary/70 mt-0.5">{num}.</span>
            <span className="flex-1 min-w-0">{renderInline(itemText)}</span>
          </li>,
        )
        num++
        i++
      }
      elements.push(
        <ol key={elements.length} className="space-y-1.5 my-1 pl-1">
          {listItems}
        </ol>,
      )
      continue
    }

    // Regular paragraph (merge consecutive non-special lines)
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !lines[i]!.trim().startsWith('```') &&
      !lines[i]!.match(/^#{1,4}\s/) &&
      !lines[i]!.match(/^\s*[-*]\s/) &&
      !lines[i]!.match(/^\s*\d+[.)]\s/)
    ) {
      paraLines.push(lines[i]!)
      i++
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={elements.length} className="leading-relaxed">
          {renderInlineMultiline(paraLines)}
        </p>,
      )
    }
  }

  return elements
}

// ============================================================================
// Inline Rendering
// ============================================================================

/** Render multiline paragraph (joining natural lines with space unless explicit break) */
function renderInlineMultiline(lines: string[]): ReactNode[] {
  const result: ReactNode[] = []
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]!
    const hasExplicitBreak = rawLine.endsWith('  ') || rawLine.endsWith('\\')
    const cleanLine = hasExplicitBreak ? rawLine.replace(/(\s\s|\\)$/, '') : rawLine

    if (i > 0) {
      if (hasExplicitBreak) {
        result.push(<br key={`br-${i}`} />)
      } else {
        result.push(' ')
      }
    }
    result.push(...renderInlineFragments(cleanLine, `line-${i}`))
  }
  return result
}

/** Render inline markdown (bold, italic, code) */
function renderInline(text: string): ReactNode {
  const fragments = renderInlineFragments(text, 'r')
  return fragments.length === 1 ? fragments[0] : <>{fragments}</>
}

function renderInlineFragments(text: string, keyPrefix: string): ReactNode[] {
  // Regex to match **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let idx = 0

  while ((match = regex.exec(text)) !== null) {
    // Prefix text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <strong key={`${keyPrefix}-b${idx}`} className="font-semibold text-foreground">
          {match[2]}
        </strong>,
      )
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={`${keyPrefix}-i${idx}`} className="italic text-foreground/80">
          {match[4]}
        </em>,
      )
    } else if (match[5]) {
      // `code`
      parts.push(
        <code
          key={`${keyPrefix}-c${idx}`}
          className="rounded bg-black/20 px-1 py-0.5 font-mono text-[11px] text-sidebar-primary"
        >
          {match[6]}
        </code>,
      )
    }

    lastIndex = match.index + match[0].length
    idx++
  }

  // Trailing text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
