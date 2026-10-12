import { useInvestigationStore } from '../../store/investigation-store';
import { useUIStore } from '../../store/ui-store';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  FileCode,
  ExternalLink,
  Pin,
  FileCheck,
  AlignLeft,
  Quote,
} from 'lucide-react';

export function FileDetailView() {
  const {
    selectedFilePath,
    selectedFileContent,
    addEvidence,
    evidence,
  } = useInvestigationStore();

  const { setSourceDrawerOpen } = useUIStore();

  if (!selectedFilePath || !selectedFileContent) {
    return (
      <div className="p-8 text-center text-text-muted text-body-sm flex flex-col items-center justify-center h-full">
        <FileCode className="w-10 h-10 mb-2 opacity-30" />
        <p>Select a file in the explorer or architecture graph to inspect details.</p>
      </div>
    );
  }

  const handlePinCitation = (citation: any) => {
    addEvidence({
      filePath: citation.file,
      lineStart: citation.lineStart,
      lineEnd: citation.lineEnd,
      snippet: citation.snippet,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {/* File Header Card */}
      <div className="rounded-xl border border-border bg-surface-elevated/40 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-text-muted">Target File</span>
            <h3 className="font-mono font-bold text-text-primary text-body-sm truncate mt-0.5">
              {selectedFileContent.path}
            </h3>
          </div>
          <Badge category={selectedFileContent.category} />
        </div>

        <div className="flex items-center gap-3 text-body-xs font-mono text-text-muted pt-2 border-t border-border/60">
          <span>{selectedFileContent.lineCount} lines</span>
          <span>•</span>
          <span className="capitalize">{selectedFileContent.language}</span>
          <span>•</span>
          <span className="text-accent-emerald flex items-center gap-1">
            <FileCheck className="w-3 h-3" /> Indexed
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-full mt-2"
          onClick={() => setSourceDrawerOpen(true)}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
          <span>Open Full Code Inspector</span>
        </Button>
      </div>

      {/* Summary */}
      {selectedFileContent.summary && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted uppercase">
            <AlignLeft className="w-3.5 h-3.5" />
            <span>AST Structural Summary</span>
          </div>
          <p className="text-body-xs text-text-secondary bg-surface-elevated/20 p-3 rounded-lg border border-border leading-relaxed">
            {selectedFileContent.summary}
          </p>
        </div>
      )}

      {/* Pre-detected citations in this file */}
      {selectedFileContent.citations && selectedFileContent.citations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted uppercase">
            <Quote className="w-3.5 h-3.5 text-accent-amber" />
            <span>Key Citations ({selectedFileContent.citations.length})</span>
          </div>

          <div className="space-y-2">
            {selectedFileContent.citations.map((c) => {
              const isAlreadyPinned = evidence.some(
                (ev) =>
                  ev.filePath === c.file &&
                  ev.lineStart === c.lineStart &&
                  ev.lineEnd === c.lineEnd
              );

              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-border bg-surface-elevated/40 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body-xs font-mono font-semibold text-accent-amber">
                      L{c.lineStart}-{c.lineEnd}: {c.reason}
                    </span>

                    <Button
                      variant={isAlreadyPinned ? 'secondary' : 'ghost'}
                      size="sm"
                      disabled={isAlreadyPinned}
                      onClick={() => handlePinCitation(c)}
                      className="text-[10px] !px-2 !py-0.5"
                    >
                      <Pin className="w-3 h-3 mr-1" />
                      <span>{isAlreadyPinned ? 'Pinned' : 'Pin'}</span>
                    </Button>
                  </div>

                  <pre className="text-[10px] font-mono text-text-muted bg-canvas-base/80 p-2 rounded border border-border/60 overflow-x-auto whitespace-pre-wrap">
                    {c.snippet}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
