import { useUIStore } from '../../store/ui-store';
import { MissionView } from './MissionView';
import { FileDetailView } from './FileDetailView';
import { Target, FileText } from 'lucide-react';

export function InspectorPanel() {
  const { inspectorTab, setInspectorTab } = useUIStore();

  return (
    <div className="h-full flex flex-col bg-surface-primary border-l border-border overflow-hidden select-none">
      {/* Tab Switcher Header */}
      <div className="px-3 py-2 border-b border-border bg-surface-elevated/70 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-surface-primary border border-border">
          <button
            onClick={() => setInspectorTab('mission')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono transition-colors ${
              inspectorTab === 'mission'
                ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30 font-bold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Missions</span>
          </button>

          <button
            onClick={() => setInspectorTab('file')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono transition-colors ${
              inspectorTab === 'file'
                ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30 font-bold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>File Details</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-text-muted uppercase">
          Forensic Panel
        </span>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {inspectorTab === 'mission' ? <MissionView /> : <FileDetailView />}
      </div>
    </div>
  );
}
