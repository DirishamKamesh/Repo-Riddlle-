import { Evidence } from '../../types';
import { FileCode, Trash2 } from 'lucide-react';

interface EvidenceCardProps {
  evidence: Evidence;
  onRemove: (id: string) => void;
  onViewSource?: (filePath: string, line: number) => void;
}

export function EvidenceCard({
  evidence,
  onRemove,
  onViewSource,
}: EvidenceCardProps) {
  return (
    <div className="rounded-lg border border-accent-amber/30 bg-accent-amber/5 p-2.5 transition-all">
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={() => onViewSource?.(evidence.filePath, evidence.lineStart)}
          className="flex items-center gap-1.5 text-body-xs font-mono font-semibold text-accent-amber hover:underline text-left truncate"
        >
          <FileCode className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{evidence.filePath}</span>
          <span className="text-[10px] text-text-muted">
            L{evidence.lineStart}-{evidence.lineEnd}
          </span>
        </button>

        <button
          onClick={() => onRemove(evidence.id)}
          className="text-text-muted hover:text-accent-error p-1 rounded transition-colors"
          title="Remove evidence"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <pre className="text-[11px] font-mono text-text-secondary bg-surface-elevated/80 p-2 rounded border border-border/60 overflow-x-auto whitespace-pre-wrap">
        {evidence.snippet}
      </pre>
    </div>
  );
}
