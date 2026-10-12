import { Search, X } from 'lucide-react';

interface FileSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FileSearch({ value, onChange }: FileSearchProps) {
  return (
    <div className="relative p-2.5 border-b border-border bg-surface-primary">
      <Search className="w-3.5 h-3.5 text-text-muted absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter files by name or path..."
        className="w-full pl-8 pr-7 py-1.5 rounded-md bg-surface-elevated border border-border text-body-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 font-mono"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
