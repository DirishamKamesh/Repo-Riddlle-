import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CATEGORY_COLORS } from '../../lib/category-colors';
import { FileCategory } from '../../types';
import { FileCode, FileCheck } from 'lucide-react';

export interface FileNodeData {
  label: string;
  filePath: string;
  category: FileCategory;
  summary: string | null;
  isSelected?: boolean;
}

export const FileNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as FileNodeData;
  const def = CATEGORY_COLORS[nodeData.category] || CATEGORY_COLORS.unknown;

  return (
    <div
      className={`relative min-w-[200px] max-w-[240px] rounded-xl border bg-surface-elevated/95 backdrop-blur-md p-3 transition-all duration-200 shadow-lg ${
        selected
          ? 'border-accent-blue ring-2 ring-accent-blue/40 shadow-accent-blue/10 scale-105'
          : 'border-border hover:border-text-muted/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-accent-blue !border-surface-elevated"
      />

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs"
            style={{
              backgroundColor: `${def.solid}20`,
              color: def.solid,
            }}
          >
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <div className="truncate font-mono font-semibold text-text-primary text-body-xs">
            {nodeData.label}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/80">
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold tracking-wider uppercase"
          style={{
            color: def.solid,
            backgroundColor: `${def.solid}15`,
            borderColor: `${def.solid}30`,
          }}
        >
          {nodeData.category.replace('_', ' ')}
        </span>

        <span className="flex items-center gap-1 text-[10px] text-accent-emerald font-mono">
          <FileCheck className="w-3 h-3" />
          <span>VERIFIED</span>
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-accent-emerald !border-surface-elevated"
      />
    </div>
  );
});

FileNode.displayName = 'FileNode';
