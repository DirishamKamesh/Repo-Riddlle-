import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Info, Network, GitFork } from 'lucide-react';
import { FileCategory } from '../../types';
import { CATEGORY_COLORS } from '../../lib/category-colors';

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetLayout: () => void;
  onToggleLegend: () => void;
  isLegendOpen: boolean;
  layoutMode: 'graph' | 'tree';
  onToggleLayoutMode: (mode: 'graph' | 'tree') => void;
  selectedCategory: FileCategory | null;
  onSelectCategory: (category: FileCategory | null) => void;
}

const CATEGORIES: FileCategory[] = [
  'entry_point',
  'route',
  'model',
  'config',
];

export function GraphToolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetLayout,
  onToggleLegend,
  isLegendOpen,
  layoutMode,
  onToggleLayoutMode,
  selectedCategory,
  onSelectCategory,
}: GraphToolbarProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Graph / Tree Segmented Toggle */}
        <div className="flex items-center p-0.5 rounded-xl bg-surface-primary/95 backdrop-blur-md border border-border shadow-lg">
          <button
            onClick={() => onToggleLayoutMode('graph')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-body-xs font-mono transition-colors ${
              layoutMode === 'graph'
                ? 'bg-accent-blue/15 text-accent-blue font-bold border border-accent-blue/30 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Graph</span>
          </button>

          <button
            onClick={() => onToggleLayoutMode('tree')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-body-xs font-mono transition-colors ${
              layoutMode === 'tree'
                ? 'bg-accent-blue/15 text-accent-blue font-bold border border-accent-blue/30 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Tree</span>
          </button>
        </div>

        {/* Category Pills in Toolbar */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-surface-primary/90 backdrop-blur-md border border-border shadow-lg">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              selectedCategory === null
                ? 'bg-surface-elevated text-text-primary font-bold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const def = CATEGORY_COLORS[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                  isSelected
                    ? `${def.bg} ${def.text} ${def.border} font-bold`
                    : 'text-text-muted border-transparent hover:text-text-secondary'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: def.solid }}
                />
                <span>{def.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right controls: Zoom, Fit, Reset, Legend */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-primary/90 backdrop-blur-md border border-border shadow-lg pointer-events-auto">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onFitView}
          title="Fit to Screen"
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-border my-auto mx-0.5" />

        <button
          onClick={onResetLayout}
          title="Reset Layout"
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleLegend}
          title="Toggle Legend"
          className={`p-1.5 rounded-lg transition-colors ${
            isLegendOpen
              ? 'text-accent-blue bg-accent-blue/15'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
          }`}
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
