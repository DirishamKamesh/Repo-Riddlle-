import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

export type StageState = 'pending' | 'in_progress' | 'completed' | 'failed';

interface AnalysisStageProps {
  number: number;
  label: string;
  detail: string;
  state: StageState;
}

export function AnalysisStage({ number, label, detail, state }: AnalysisStageProps) {
  const icon = {
    pending: <Circle className="w-4 h-4 text-text-muted" />,
    in_progress: <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />,
    completed: <CheckCircle2 className="w-4 h-4 text-accent-emerald" />,
    failed: <AlertCircle className="w-4 h-4 text-accent-error" />,
  }[state];

  const stateClasses = {
    pending: 'text-text-muted border-border bg-surface-primary/40',
    in_progress:
      'text-text-primary border-accent-blue/40 bg-accent-blue/5 shadow-sm',
    completed: 'text-text-primary border-border bg-surface-elevated/40',
    failed: 'text-accent-error border-accent-error/40 bg-accent-error/5',
  }[state];

  return (
    <div
      className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${stateClasses}`}
    >
      <div className="w-6 h-6 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-body-sm font-mono truncate">
            {number}. {label}
          </span>
          <span className="text-[11px] font-mono text-text-muted uppercase">
            {state.replace('_', ' ')}
          </span>
        </div>
        <p className="text-body-xs text-text-secondary truncate mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
