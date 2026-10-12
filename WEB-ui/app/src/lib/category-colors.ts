import { FileCategory } from '../types';

export interface CategoryColorDef {
  text: string;
  bg: string;
  border: string;
  solid: string;
  label: string;
}

export const CATEGORY_COLORS: Record<FileCategory, CategoryColorDef> = {
  entry_point: {
    text: 'text-accent-blue',
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue/30',
    solid: '#5B8CFF',
    label: 'Entry Point',
  },
  route: {
    text: 'text-accent-emerald',
    bg: 'bg-accent-emerald/10',
    border: 'border-accent-emerald/30',
    solid: '#39D6A0',
    label: 'Route',
  },
  model: {
    text: 'text-accent-amber',
    bg: 'bg-accent-amber/10',
    border: 'border-accent-amber/30',
    solid: '#F4BD58',
    label: 'Model / Schema',
  },
  component: {
    text: 'text-accent-violet',
    bg: 'bg-accent-violet/10',
    border: 'border-accent-violet/30',
    solid: '#A78BFA',
    label: 'Component',
  },
  config: {
    text: 'text-accent-slate',
    bg: 'bg-accent-slate/10',
    border: 'border-accent-slate/30',
    solid: '#8190A5',
    label: 'Config',
  },
  test: {
    text: 'text-accent-teal',
    bg: 'bg-accent-teal/10',
    border: 'border-accent-teal/30',
    solid: '#43C9D9',
    label: 'Test',
  },
  utility: {
    text: 'text-text-secondary',
    bg: 'bg-text-secondary/10',
    border: 'border-text-secondary/30',
    solid: '#A2ADBD',
    label: 'Utility',
  },
  unknown: {
    text: 'text-text-muted',
    bg: 'bg-text-muted/10',
    border: 'border-text-muted/30',
    solid: '#737F90',
    label: 'Other',
  },
};

export function getCategoryBadgeClasses(category: FileCategory): string {
  const def = CATEGORY_COLORS[category] || CATEGORY_COLORS.unknown;
  return `inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${def.text} ${def.bg} border ${def.border}`;
}
