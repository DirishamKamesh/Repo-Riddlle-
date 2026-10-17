import React from 'react';
import { FileCategory } from '../../types';

interface CategoryBadgeProps {
  category?: FileCategory;
  className?: string;
  dotOnly?: boolean;
}

export const CATEGORY_CONFIG: Record<FileCategory, { label: string; bg: string; text: string; border: string; dot: string }> = {
  entry: {
    label: 'Entry',
    bg: 'bg-blue-500/10 dark:bg-[#7695FF]/15',
    text: 'text-blue-700 dark:text-[#7695FF]',
    border: 'border-blue-500/20 dark:border-[#7695FF]/30',
    dot: 'bg-blue-600 dark:bg-[#7695FF]',
  },
  route: {
    label: 'Route',
    bg: 'bg-emerald-500/10 dark:bg-[#43D8A8]/15',
    text: 'text-emerald-700 dark:text-[#43D8A8]',
    border: 'border-emerald-500/20 dark:border-[#43D8A8]/30',
    dot: 'bg-emerald-600 dark:bg-[#43D8A8]',
  },
  model: {
    label: 'Model',
    bg: 'bg-amber-500/10 dark:bg-[#F4C66E]/15',
    text: 'text-amber-800 dark:text-[#F4C66E]',
    border: 'border-amber-500/20 dark:border-[#F4C66E]/30',
    dot: 'bg-amber-600 dark:bg-[#F4C66E]',
  },
  component: {
    label: 'Component',
    bg: 'bg-purple-500/10 dark:bg-[#B49AFF]/15',
    text: 'text-purple-700 dark:text-[#B49AFF]',
    border: 'border-purple-500/20 dark:border-[#B49AFF]/30',
    dot: 'bg-purple-600 dark:bg-[#B49AFF]',
  },
  test: {
    label: 'Test',
    bg: 'bg-cyan-500/10 dark:bg-[#45D9CF]/15',
    text: 'text-cyan-800 dark:text-[#45D9CF]',
    border: 'border-cyan-500/20 dark:border-[#45D9CF]/30',
    dot: 'bg-cyan-600 dark:bg-[#45D9CF]',
  },
  config: {
    label: 'Config',
    bg: 'bg-slate-500/10 dark:bg-slate-400/15',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/20 dark:border-slate-400/30',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },
  utility: {
    label: 'Utility',
    bg: 'bg-gray-500/10 dark:bg-gray-400/15',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-500/20 dark:border-gray-400/30',
    dot: 'bg-gray-500 dark:bg-gray-400',
  },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category = 'utility', className = '', dotOnly = false }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.utility;

  if (dotOnly) {
    return <span className={`inline-block w-2 h-2 rounded-full ${config.dot} ${className}`} title={config.label} />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
