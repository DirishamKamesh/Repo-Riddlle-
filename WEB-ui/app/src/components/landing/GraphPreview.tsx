import { GitCommit, ArrowRight, ShieldCheck, FileCode } from 'lucide-react';

export function GraphPreview() {
  return (
    <div className="w-full mt-12 relative rounded-xl border border-border bg-surface-primary/60 backdrop-blur-md overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-elevated/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-error/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald/60" />
          <span className="text-body-xs font-mono text-text-muted ml-2">demo-org / task-api • main</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
            <ShieldCheck className="w-3 h-3" /> VERIFIED IMPORTS
          </span>
        </div>
      </div>

      <div className="p-6 relative min-h-[180px] flex items-center justify-center bg-canvas-base/50">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #737F90 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Mock graph nodes */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border hover:border-accent-blue/50 transition-colors shadow-md">
            <div className="w-7 h-7 rounded bg-accent-blue/15 text-accent-blue flex items-center justify-center text-xs font-mono">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-body-xs font-semibold text-text-primary font-mono">server.ts</div>
              <div className="text-[10px] text-accent-blue font-mono uppercase tracking-wider">entry_point</div>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-text-muted shrink-0 hidden sm:block" />

          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border hover:border-accent-emerald/50 transition-colors shadow-md">
            <div className="w-7 h-7 rounded bg-accent-emerald/15 text-accent-emerald flex items-center justify-center text-xs font-mono">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-body-xs font-semibold text-text-primary font-mono">routes/tasks.ts</div>
              <div className="text-[10px] text-accent-emerald font-mono uppercase tracking-wider">route</div>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-text-muted shrink-0 hidden sm:block" />

          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border hover:border-accent-amber/50 transition-colors shadow-md">
            <div className="w-7 h-7 rounded bg-accent-amber/15 text-accent-amber flex items-center justify-center text-xs font-mono">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-body-xs font-semibold text-text-primary font-mono">models/task.ts</div>
              <div className="text-[10px] text-accent-amber font-mono uppercase tracking-wider">model</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-border bg-surface-primary/40 flex items-center justify-between text-[11px] text-text-muted">
        <span>3 files mapped • 2 verified imports</span>
        <span className="flex items-center gap-1 text-accent-amber">
          <GitCommit className="w-3.5 h-3.5" /> Mission 1: Trace Task Creation Flow
        </span>
      </div>
    </div>
  );
}
