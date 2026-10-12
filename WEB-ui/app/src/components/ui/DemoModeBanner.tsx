import { Sparkles, Info } from 'lucide-react';

interface DemoModeBannerProps {
  repoName?: string;
}

export function DemoModeBanner({ repoName = 'demo-org/task-api' }: DemoModeBannerProps) {
  return (
    <div className="bg-accent-blue/10 border-b border-accent-blue/20 px-4 py-2 text-body-xs flex items-center justify-between">
      <div className="flex items-center gap-2 text-accent-blue">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold">DEMO MODE:</span>
        <span className="text-text-secondary hidden sm:inline">
          Investigating pre-computed fixture repository
        </span>
        <span className="font-mono text-text-primary px-1.5 py-0.5 rounded bg-surface-elevated border border-border">
          {repoName}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-text-muted">
        <Info className="w-3 h-3" />
        <span className="hidden md:inline">Verified imports only • Read-only inspection</span>
      </div>
    </div>
  );
}
