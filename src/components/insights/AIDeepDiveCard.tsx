import { useState, useEffect, useRef } from 'react'

interface AIDeepDiveCardProps {
  markdown: string
  /** Change this key to retrigger the typewriter animation */
  animationKey: string
}

/** Convert a subset of markdown to simple HTML (headers, bold, lists, paragraphs) */
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h4 class="mt-4 mb-1 text-sm font-semibold text-primary">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="mt-5 mb-2 text-base font-bold text-primary">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm text-secondary leading-relaxed">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm text-secondary leading-relaxed">$1</li>')
    .replace(/\n\n/g, '<br/>')
}

export default function AIDeepDiveCard({ markdown, animationKey }: AIDeepDiveCardProps) {
  const [displayedLen, setDisplayedLen] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset animation when key changes
  useEffect(() => {
    setDisplayedLen(0)
    setDone(false)

    // Typewriter: reveal chars over ~600ms
    const totalChars = markdown.length
    const charsPerTick = Math.max(1, Math.ceil(totalChars / 30)) // ~30 ticks at 20ms = 600ms
    intervalRef.current = setInterval(() => {
      setDisplayedLen(prev => {
        const next = prev + charsPerTick
        if (next >= totalChars) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setDone(true)
          return totalChars
        }
        return next
      })
    }, 20)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [animationKey, markdown])

  const visibleText = markdown.slice(0, displayedLen)
  const html = renderMarkdown(visibleText)

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand/30 bg-surface p-6">
      {/* Glow effect — subtle brand-green ambient */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.07]"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #A3B54A 0%, transparent 60%)',
        }}
      />

      {/* Header */}
      <div className="relative mb-4 flex items-center gap-2">
        <span className="text-base">✨</span>
        <h3 className="text-sm font-bold text-primary">AI Deep Dive</h3>
        {!done && (
          <span className="ml-auto inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
        )}
      </div>

      {/* Content */}
      <div
        className="relative text-sm leading-relaxed text-secondary"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Typing cursor */}
      {!done && (
        <span className="inline-block h-4 w-0.5 animate-pulse bg-brand ml-0.5 align-text-bottom" />
      )}
    </div>
  )
}
