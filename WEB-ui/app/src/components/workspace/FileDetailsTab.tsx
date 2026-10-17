import React from 'react';
import { 
  FileCode, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  Share2, 
  Code2, 
  BookmarkPlus, 
  Eye
} from 'lucide-react';
import { useInvestigationStore } from '../../store/useInvestigationStore';
import { CategoryBadge } from '../common/CategoryBadge';

export const FileDetailsTab: React.FC = () => {
  const { 
    selectedFileDetails, 
    isLoadingFileDetails, 
    openSourceViewer, 
    pinEvidence 
  } = useInvestigationStore();

  if (isLoadingFileDetails) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs text-[var(--text-muted)]">
        Loading AST and file inspection metrics...
      </div>
    );
  }

  if (!selectedFileDetails) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[var(--text-muted)]">
        <FileCode className="w-8 h-8 mb-2 opacity-40 text-[#7695FF]" />
        <p>No file selected.</p>
        <p className="text-[11px] mt-1">Select a node from the canvas or explorer to inspect AST details.</p>
      </div>
    );
  }

  const { name, path, category, lines, language, ast, blastRadius, citations } = selectedFileDetails;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 select-none">
      {/* File Header Card */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-2">
          <CategoryBadge category={category} />
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {language} · {lines} lines
          </span>
        </div>

        <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono truncate mb-1">
          {name}
        </h3>
        <p className="text-[11px] font-mono text-[var(--text-muted)] truncate mb-3">
          {path}
        </p>

        <button
          onClick={() => openSourceViewer()}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-[#7695FF] hover:bg-[#6082FF] transition-colors shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Full Source</span>
        </button>
      </div>

      {/* Blast Radius Section (Like Screenshot 1) */}
      {blastRadius && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF788B]" />
              <span>Blast Radius</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FF788B]/15 text-[#FF788B] border border-[#FF788B]/30">
              CRITICAL
            </span>
          </div>

          <div className="flex items-baseline justify-between text-xs mb-1.5">
            <span className="text-[var(--text-secondary)]">Downstream Impact</span>
            <span className="font-mono font-bold text-[var(--text-primary)]">
              {blastRadius.filesCount} files ({blastRadius.percentage}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#FF788B] to-[#F4C66E] rounded-full transition-all duration-300"
              style={{ width: `${blastRadius.percentage}%` }}
            />
          </div>

          <p className="text-[10px] text-[var(--text-muted)] mb-2">
            Changes to this module propagate up to 2 dependency levels deep.
          </p>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
              Affected Consumers:
            </span>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[11px] text-[var(--text-secondary)]">
              {blastRadius.affectedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF788B]/70" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AST Summary */}
      {ast && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] mb-2.5">
            <Code2 className="w-3.5 h-3.5 text-[#45D9CF]" />
            <span>AST Parsed Symbols</span>
          </div>

          {/* Classes */}
          {ast.classes && ast.classes.length > 0 && (
            <div className="mb-2.5">
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block mb-1">
                Classes ({ast.classes.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {ast.classes.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-hover)] text-[#F4C66E] border border-[#F4C66E]/20"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Functions */}
          {ast.functions && ast.functions.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block mb-1">
                Exported Functions ({ast.functions.length})
              </span>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {ast.functions.map((fn, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-hover)] text-[#45D9CF] border border-[#45D9CF]/20"
                  >
                    {fn}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citations & Evidence Highlights */}
      {citations && citations.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
            Notable Code Citations ({citations.length})
          </span>
          {citations.map((cite, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border bg-[var(--surface-elevated)]/60 text-xs space-y-1.5"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span>Line {cite.line} {cite.endLine ? `- ${cite.endLine}` : ''}</span>
                <button
                  onClick={() =>
                    pinEvidence({
                      filePath: path,
                      line: cite.line,
                      endLine: cite.endLine,
                      snippet: cite.text,
                      description: cite.description,
                    })
                  }
                  className="flex items-center gap-1 text-[#45D9CF] hover:underline"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  <span>Pin</span>
                </button>
              </div>
              <p className="text-[var(--text-secondary)] font-medium">
                {cite.description}
              </p>
              <pre className="p-1.5 rounded bg-[var(--bg-main)] font-mono text-[11px] text-[#7695FF] overflow-x-auto">
                {cite.text}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
