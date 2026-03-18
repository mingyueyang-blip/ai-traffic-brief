import type { BriefOutput } from '../../data/types'

interface AISummaryCardProps {
  brief: BriefOutput
}

export default function AISummaryCard({ brief }: AISummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
      {/* Summary */}
      <div>
        <p className="text-sm text-brand font-medium">{brief.headline}</p>
        <p className="mt-2 text-sm text-secondary">{brief.summary}</p>
      </div>

      {/* Key Signals */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
          Key Signals
        </h3>
        <ul className="space-y-1.5">
          {brief.keySignals.map((signal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-secondary">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-brand" />
              {signal}
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Checks */}
      {brief.suggestedChecks.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Suggested Checks
          </h3>
          <ul className="space-y-1">
            {brief.suggestedChecks.map((check, i) => (
              <li key={i} className="text-xs text-secondary">
                → {check}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
