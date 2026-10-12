import { CATEGORY_COLORS } from '../../lib/category-colors';
import { FileCategory } from '../../types';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';

interface GraphLegendProps {
  onClose: () => void;
}

const CATEGORIES: FileCategory[] = [
  'entry_point',
  'route',
  'model',
  'component',
  'utility',
  'test',
  'config',
];

export function GraphLegend({ onClose }: GraphLegendProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 w-72 rounded-xl bg-surface-primary/95 backdrop-blur-md border border-border p-4 shadow-xl select-none">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
        <span className="font-semibold text-text-primary text-body-xs font-mono uppercase tracking-wider">
          Graph Legend
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-[11px] font-mono text-text-muted uppercase">
          Node Categories
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => {
            const def = CATEGORY_COLORS[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: def.solid }}
                />
                <span className="truncate">{def.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-border space-y-1.5">
        <div className="text-[11px] font-mono text-text-muted uppercase">
          Edge Semantics
        </div>
        <div className="flex items-center gap-2 text-[11px] text-accent-emerald font-mono">
          <div className="w-6 h-0.5 bg-accent-emerald shrink-0" />
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Verified Static Import
          </span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed mt-1">
          RepoRiddle only renders verified AST static imports to guarantee accuracy.
        </p>
      </div>
    </div>
  );
}
