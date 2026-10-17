import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  X, 
  Copy, 
  Check, 
  BookmarkPlus, 
  FileCode, 
  Code2, 
  Maximize2, 
  Minimize2 
} from 'lucide-react';
import { useInvestigationStore } from '../../store/useInvestigationStore';
import { useThemeStore } from '../../store/useThemeStore';
import { CategoryBadge } from '../common/CategoryBadge';

export const SourceViewerDrawer: React.FC = () => {
  const {
    isSourceViewerOpen,
    closeSourceViewer,
    selectedFileDetails,
    sourceViewerTargetLine,
    pinEvidence,
  } = useInvestigationStore();

  const { theme } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSourceViewerOpen || !selectedFileDetails) {
    return null;
  }

  const { name, path, content, category, language, lines } = selectedFileDetails;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // non-fatal
    }
  };

  const handlePinWholeFileOrLine = () => {
    pinEvidence({
      filePath: path,
      line: sourceViewerTargetLine || 1,
      snippet: content.split('\n')[sourceViewerTargetLine ? sourceViewerTargetLine - 1 : 0] || content.slice(0, 80),
      description: `Investigated snippet from ${name}`,
    });
  };

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';
  const monacoLanguage = language.toLowerCase() === 'typescript' ? 'typescript' : 'javascript';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs select-none">
      <div
        className={`h-full flex flex-col border-l shadow-2xl transition-all duration-200 ${
          isExpanded ? 'w-full' : 'w-full max-w-4xl'
        }`}
        style={{
          backgroundColor: 'var(--panel-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Drawer Header */}
        <div
          className="h-14 border-b flex items-center justify-between px-4 sm:px-6 shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileCode className="w-4 h-4 text-[#7695FF] shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)] truncate">
                {name}
              </span>
              <CategoryBadge category={category} />
              <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:inline">
                ({lines} lines)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#43D8A8]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Pin as Evidence */}
            <button
              onClick={handlePinWholeFileOrLine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#080D18] bg-gradient-to-r from-[#45D9CF] to-[#43D8A8] hover:opacity-90 transition-opacity"
              title="Pin selected snippet to Evidence Locker"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pin Citation</span>
            </button>

            {/* Expand / Minimize */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors hidden sm:block"
              title={isExpanded ? 'Restore width' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={closeSourceViewer}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              title="Close editor (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Path breadcrumb bar */}
        <div
          className="px-4 py-1.5 border-b text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between shrink-0 bg-[var(--surface-elevated)]"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <span className="truncate">{path}</span>
          {sourceViewerTargetLine && (
            <span className="text-[#F4C66E] font-semibold shrink-0">
              Focusing Line {sourceViewerTargetLine}
            </span>
          )}
        </div>

        {/* Editor Body */}
        <div className="flex-1 w-full h-full min-h-0 relative">
          <Editor
            height="100%"
            language={monacoLanguage}
            value={content}
            theme={monacoTheme}
            options={{
              readOnly: true,
              minimap: { enabled: lines > 80 },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              renderLineHighlight: 'all',
              lineHeight: 21,
            }}
            loading={
              <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)] font-mono">
                Initializing code engine...
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
