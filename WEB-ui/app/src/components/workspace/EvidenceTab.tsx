import React from 'react';
import { Bookmark, Trash2, ArrowUpRight, FileCode, CheckCircle2 } from 'lucide-react';
import { useInvestigationStore } from '../../store/useInvestigationStore';

export const EvidenceTab: React.FC = () => {
  const { pinnedEvidence, removeEvidence, selectFile, openSourceViewer } = useInvestigationStore();

  if (pinnedEvidence.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[var(--text-muted)] select-none">
        <Bookmark className="w-8 h-8 mb-2 opacity-30 text-[#45D9CF]" />
        <p className="font-semibold text-[var(--text-primary)]">Evidence Locker is Empty</p>
        <p className="text-[11px] mt-1.5 max-w-xs leading-relaxed text-[var(--text-secondary)]">
          As you explore the architecture canvas and inspect source code, pin critical functions, security tokens, or workflow calls here to build your case.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-[#45D9CF]" />
          <span className="text-xs font-bold uppercase font-display text-[var(--text-primary)]">
            Verified Evidence ({pinnedEvidence.length})
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#43D8A8] bg-[#43D8A8]/10 px-2 py-0.5 rounded border border-[#43D8A8]/20">
          INVESTIGATION LOG
        </span>
      </div>

      {pinnedEvidence.map((item) => (
        <div
          key={item.id}
          className="p-3.5 rounded-xl border bg-[var(--surface-elevated)] space-y-2 text-xs shadow-xs transition-colors hover:border-[#45D9CF]/40"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <button
              onClick={() => {
                selectFile(item.filePath, item.line);
                openSourceViewer(item.line);
              }}
              className="flex items-center gap-1.5 text-[#7695FF] hover:underline font-semibold truncate max-w-[200px]"
            >
              <FileCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.filePath.split('/').pop()}</span>
              <span className="text-[var(--text-muted)]">:{item.line}</span>
            </button>

            <button
              onClick={() => removeEvidence(item.id)}
              title="Remove evidence"
              className="p-1 rounded text-[var(--text-muted)] hover:text-[#FF788B] hover:bg-[#FF788B]/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Snippet */}
          <div className="p-2 rounded bg-[var(--bg-main)] font-mono text-[11px] text-[#45D9CF] overflow-x-auto border" style={{ borderColor: 'var(--border-subtle)' }}>
            <code>{item.snippet}</code>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                selectFile(item.filePath, item.line);
                openSourceViewer(item.line);
              }}
              className="flex items-center gap-1 text-[11px] font-mono text-[#45D9CF] hover:underline cursor-pointer"
            >
              <span>Jump to Source</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
