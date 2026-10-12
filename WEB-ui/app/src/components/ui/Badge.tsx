import { FileCategory } from '../../types';
import { getCategoryBadgeClasses, CATEGORY_COLORS } from '../../lib/category-colors';

interface BadgeProps {
  category: FileCategory;
  className?: string;
  showIconDot?: boolean;
}

export function Badge({ category, className = '', showIconDot = true }: BadgeProps) {
  const def = CATEGORY_COLORS[category] || CATEGORY_COLORS.unknown;
  const classes = getCategoryBadgeClasses(category);

  return (
    <span className={`${classes} ${className}`}>
      {showIconDot && (
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
          style={{ backgroundColor: def.solid }}
        />
      )}
      {def.label}
    </span>
  );
}
