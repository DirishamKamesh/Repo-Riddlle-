import { AnalysisStage, StageState } from './AnalysisStage';

export interface StageInfo {
  number: number;
  label: string;
  detail: string;
  state: StageState;
}

interface AnalysisProgressProps {
  stages: StageInfo[];
  overallProgress: number;
}

export function AnalysisProgress({ stages, overallProgress }: AnalysisProgressProps) {
  return (
    <div className="w-full space-y-4">
      {/* Overall progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-body-xs font-mono">
          <span className="text-text-secondary">Progress</span>
          <span className="text-accent-blue font-bold">{overallProgress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border">
          <div
            className="h-full bg-accent-blue transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stage list */}
      <div className="space-y-2 mt-4">
        {stages.map((stage) => (
          <AnalysisStage key={stage.number} {...stage} />
        ))}
      </div>
    </div>
  );
}
