import React from 'react';
import { X, Layers, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { CATEGORY_CONFIG } from '../common/CategoryBadge';
import { FileCategory } from '../../types';

interface GraphLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories: FileCategory[] = ['entry', 'route', 'model', 'component', 'utility', 'config'];

  return (
    <div
      className="absolute bottom-14 right-4 z-30 w-80 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all select-none"
      style={{
        backgroundColor: 'var(--panel-primary)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#7695FF]" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">
            Canvas Legend & Taxonomy
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Node Categories */}
      <div className="space-y-2 mb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
          File Node Categories
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {categories.map((cat) => {
            const conf = CATEGORY_CONFIG[cat];
            return (
              <div key={cat} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                <span className="text-xs text-[var(--text-secondary)] capitalize">{conf.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edge Relationships */}
      <div className="space-y-2 mb-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
          Edge Connections
        </span>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#7695FF] inline-block" />
            <span className="text-[var(--text-secondary)]">Import Dependency (Static import)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#45D9CF] border-b border-dashed border-[#45D9CF] inline-block" />
            <span className="text-[var(--text-secondary)]">Workflow Execution (Runtime call)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#43D8A8] inline-block shadow-xs" />
            <span className="text-[var(--text-secondary)]">Verified Investigation Trail</span>
          </div>
        </div>
      </div>

      {/* Tactical Interaction Hint */}
      <div className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border text-[11px] text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="flex items-center gap-1.5 font-medium text-[var(--text-primary)] mb-1">
          <Activity className="w-3.5 h-3.5 text-[#45D9CF]" />
          <span>Interactive Tracing</span>
        </p>
        <p className="text-[10px] leading-relaxed">
          Select any node to highlight all upstream importers and downstream dependencies. Click edges in Workflow mode to inspect verified code snippets.
        </p>
      </div>
    </div>
  );
};
