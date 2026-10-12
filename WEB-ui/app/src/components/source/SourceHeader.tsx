import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FileCategory } from '../../types';
import { X, Copy, Check, Pin } from 'lucide-react';
import { useState } from 'react';

interface SourceHeaderProps {
  filePath: string;
  category: FileCategory;
  lineCount: number;
  onClose: () => void;
  onPinCurrentSelection?: () => void;
}

export function SourceHeader({
  filePath,
  category,
  lineCount,
  onClose,
  onPinCurrentSelection,
}: SourceHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(filePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-2.5 border-b border-border bg-surface-elevated/90 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Badge category={category} />
        <span className="font-mono text-body-sm font-semibold text-text-primary truncate">
          {filePath}
        </span>
        <span className="text-[11px] font-mono text-text-muted hidden sm:inline">
          ({lineCount} lines)
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onPinCurrentSelection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPinCurrentSelection}
            className="text-accent-amber hover:bg-accent-amber/10 border border-accent-amber/20 text-body-xs"
          >
            <Pin className="w-3.5 h-3.5 mr-1" />
            <span>Pin Selection</span>
          </Button>
        )}

        <button
          onClick={handleCopyPath}
          title="Copy file path"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-accent-emerald" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={onClose}
          title="Close Inspector"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
