import { CATEGORY_COLORS } from '../../lib/category-colors';
import { FileCategory } from '../../types';
import { ShieldCheck, X, Workflow, Layers } from 'lucide-react';

interface GraphLegendProps {
  onClose: () => void;
  graphViewMode?: 'dependency' | 'workflow';
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

const WORKFLOW_RELATIONS = [
  { name: 'boots', color: '#00F0FF', label: 'Server Bootstrap' },
  { name: 'mounts_router', color: '#38BDF8', label: 'Route Mounting' },
  { name: 'applies_middleware', color: '#F59E0B', label: 'Middleware Guard' },
  { name: 'invokes_handler', color: '#A855F7', label: 'Handler Dispatch' },
  { name: 'accesses_model', color: '#39D6A0', label: 'Model/Store Access' },
  { name: 'renders_component', color: '#EC4899', label: 'Component Render' },
];

export function GraphLegend({ onClose, graphViewMode = 'dependency' }: GraphLegendProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 w-80 rounded-xl bg-surface-primary/95 backdrop-blur-md border border-border p-4 shadow-xl select-none">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
        <span className="flex items-center gap-1.5 font-semibold text-text-primary text-body-xs font-mono uppercase tracking-wider">
          {graphViewMode === 'workflow' ? (
            <>
              <Workflow className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Workflow Legend</span>
            </>
          ) : (
            <>
              <Layers className="w-3.5 h-3.5 text-accent-blue" />
              <span>Dependency Legend</span>
            </>
          )}
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {graphViewMode === 'workflow' ? (
        <div className="space-y-3">
          <div className="text-[11px] font-mono text-text-muted uppercase">
            Execution Pathways
          </div>
          <div className="space-y-2">
            {WORKFLOW_RELATIONS.map((rel) => (
              <div key={rel.name} className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-1 rounded shrink-0"
                    style={{ backgroundColor: rel.color }}
                  />
                  <span className="text-text-primary">{rel.name}</span>
                </div>
                <span className="text-text-muted text-[10px]">{rel.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed pt-2 border-t border-border">
            Every workflow edge includes verified call-site line numbers and source code evidence.
          </p>
        </div>
      ) : (
        <>
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

          <div className="pt-2 border-t border-border space-y-2">
            <div className="text-[11px] font-mono text-text-muted uppercase">
              Edge Semantics
            </div>
            <div className="flex items-center gap-2 text-[11px] text-accent-emerald font-mono">
              <div className="w-5 h-0.5 bg-accent-emerald shrink-0" />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Runtime Import
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-accent-blue/80 font-mono">
              <div className="w-5 h-0.5 border-t border-dashed border-accent-blue shrink-0" />
              <span>Type-Only Import</span>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed mt-1">
              RepoRiddle only renders verified AST static imports to guarantee accuracy.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
