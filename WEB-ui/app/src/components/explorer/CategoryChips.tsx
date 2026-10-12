import { FileCategory } from '../../types';
import { CATEGORY_COLORS } from '../../lib/category-colors';

interface CategoryChipsProps {
  selectedCategory: FileCategory | null;
  onSelectCategory: (category: FileCategory | null) => void;
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

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 no-scrollbar border-b border-border bg-surface-primary/50">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-2 py-0.5 rounded text-[11px] font-mono shrink-0 transition-colors ${
          selectedCategory === null
            ? 'bg-surface-hover text-text-primary border border-text-muted/40 font-semibold'
            : 'text-text-muted hover:text-text-secondary border border-transparent'
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
            className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 transition-colors border flex items-center gap-1 ${
              isSelected
                ? `${def.bg} ${def.text} ${def.border} font-bold ring-1 ring-accent-blue/30`
                : 'text-text-muted border-transparent hover:bg-surface-elevated hover:text-text-secondary'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: def.solid }}
            />
            {def.label}
          </button>
        );
      })}
    </div>
  );
}
