import { MissionFeedback as IMissionFeedback } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface MissionFeedbackProps {
  feedback: IMissionFeedback;
  onReset: () => void;
  onNextMission?: () => void;
}

export function MissionFeedback({
  feedback,
  onReset,
  onNextMission,
}: MissionFeedbackProps) {
  const { correct, partial, feedback: text, explanation, citations } = feedback;

  const statusType = correct ? 'pass' : partial ? 'partial' : 'fail';

  const statusConfig = {
    pass: {
      icon: <CheckCircle2 className="w-5 h-5 text-accent-emerald" />,
      border: 'border-accent-emerald/40',
      bg: 'bg-accent-emerald/10',
      title: 'Mission Solved',
      titleColor: 'text-accent-emerald',
    },
    partial: {
      icon: <AlertTriangle className="w-5 h-5 text-accent-amber" />,
      border: 'border-accent-amber/40',
      bg: 'bg-accent-amber/10',
      title: 'Partial Assessment',
      titleColor: 'text-accent-amber',
    },
    fail: {
      icon: <XCircle className="w-5 h-5 text-accent-error" />,
      border: 'border-accent-error/40',
      bg: 'bg-accent-error/10',
      title: 'Needs Re-examination',
      titleColor: 'text-accent-error',
    },
  }[statusType];

  return (
    <div
      className={`rounded-xl border p-4 ${statusConfig.border} ${statusConfig.bg} space-y-3 transition-all`}
    >
      <div className="flex items-center gap-2.5">
        {statusConfig.icon}
        <h4 className={`font-semibold font-mono text-sm ${statusConfig.titleColor}`}>
          {statusConfig.title}
        </h4>
      </div>

      <p className="text-body-sm text-text-primary leading-relaxed font-medium">
        {text}
      </p>

      {explanation && (
        <p className="text-body-xs text-text-secondary leading-relaxed bg-surface-elevated/70 p-2.5 rounded-lg border border-border/60">
          {explanation}
        </p>
      )}

      {citations && citations.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono text-text-muted uppercase">
            Architectural Citations
          </div>
          {citations.map((c) => (
            <div
              key={c.id}
              className="p-2 rounded bg-surface-elevated border border-border text-[11px] font-mono text-text-secondary"
            >
              <div className="text-accent-amber font-semibold">
                {c.file}:{c.lineStart}-{c.lineEnd}
              </div>
              <pre className="text-[10px] text-text-muted mt-1 whitespace-pre-wrap">
                {c.snippet}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-attempt
        </Button>

        {correct && onNextMission && (
          <Button variant="primary" size="sm" onClick={onNextMission}>
            Next Mission
          </Button>
        )}
      </div>
    </div>
  );
}
