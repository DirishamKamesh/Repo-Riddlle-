import { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useInvestigationStore } from '../../store/investigation-store';
import { useUIStore } from '../../store/ui-store';
import { SourceHeader } from './SourceHeader';
import { Pin } from 'lucide-react';

export function SourceDrawer() {
  const {
    selectedFilePath,
    selectedFileContent,
    addEvidence,
  } = useInvestigationStore();

  const { isSourceDrawerOpen, setSourceDrawerOpen } = useUIStore();
  const editorRef = useRef<any>(null);
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);

  if (!isSourceDrawerOpen || !selectedFilePath || !selectedFileContent) {
    return null;
  }

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Track user selection for pinning
    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      if (!selection.isEmpty()) {
        const model = editor.getModel();
        if (model) {
          const text = model.getValueInRange(selection);
          setSelectedRange({
            start: selection.startLineNumber,
            end: selection.endLineNumber,
            text,
          });
        }
      } else {
        setSelectedRange(null);
      }
    });

    // Decorate citations with amber highlights
    if (selectedFileContent.citations && selectedFileContent.citations.length > 0) {
      const decorations = selectedFileContent.citations.map((c) => ({
        range: new monaco.Range(c.lineStart, 1, c.lineEnd, 1),
        options: {
          isWholeLine: true,
          className: 'citation-line-highlight',
          glyphMarginClassName: 'citation-glyph',
          hoverMessage: { value: `**Citation:** ${c.reason}` },
        },
      }));
      editor.createDecorationsCollection(decorations);
    }
  };

  const handlePinSelection = () => {
    if (!selectedRange) return;
    addEvidence({
      filePath: selectedFilePath,
      lineStart: selectedRange.start,
      lineEnd: selectedRange.end,
      snippet: selectedRange.text,
    });
    setSelectedRange(null);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[650px] lg:w-[780px] bg-canvas-base border-l border-border shadow-2xl flex flex-col animate-slide-in">
      <SourceHeader
        filePath={selectedFilePath}
        category={selectedFileContent.category}
        lineCount={selectedFileContent.lineCount}
        onClose={() => setSourceDrawerOpen(false)}
        onPinCurrentSelection={selectedRange ? handlePinSelection : undefined}
      />

      {/* Floating pin button when user selects lines in Monaco */}
      {selectedRange && (
        <div className="bg-surface-elevated border-b border-accent-amber/30 px-4 py-2 flex items-center justify-between text-body-xs bg-accent-amber/10">
          <span className="font-mono text-accent-amber">
            Selected L{selectedRange.start} - L{selectedRange.end}
          </span>
          <button
            onClick={handlePinSelection}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-accent-amber text-canvas-base font-semibold font-mono text-[11px] hover:bg-accent-amber/90 transition-colors shadow-sm"
          >
            <Pin className="w-3 h-3" />
            <span>Pin as Mission Evidence</span>
          </button>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={selectedFileContent.language || 'typescript'}
          value={selectedFileContent.content || '// Empty file content'}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: true },
            fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            glyphMargin: true,
            folding: true,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1.5 border-t border-border bg-surface-primary flex items-center justify-between text-[11px] font-mono text-text-muted">
        <span>READ ONLY • AST VERIFIED</span>
        <span>{selectedFileContent.language.toUpperCase()}</span>
      </div>
    </div>
  );
}
