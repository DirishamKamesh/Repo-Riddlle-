import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DemoModeBanner } from '../components/ui/DemoModeBanner';
import { FileExplorer } from '../components/explorer/FileExplorer';
import { CodebaseGraph } from '../components/graph/CodebaseGraph';
import { InspectorPanel } from '../components/inspector/InspectorPanel';
import { SourceDrawer } from '../components/source/SourceDrawer';
import { MobileNav } from '../components/layout/MobileNav';
import { useInvestigationStore } from '../store/investigation-store';
import { useUIStore } from '../store/ui-store';
import {
  ShieldCheck,
  Terminal,
  Target,
  PanelRightClose,
  PanelRightOpen,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Radio,
} from 'lucide-react';

export function InvestigationPage() {
  const { id } = useParams<{ id: string }>();
  const {
    loadRepository,
    repository,
    graphData,
    missions,
    activeMissionId,
    isLoading,
    error,
  } = useInvestigationStore();
  const { activeMobileTab } = useUIStore();
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);

  useEffect(() => {
    loadRepository(id);
  }, [id, loadRepository]);

  const isDemo = !id || id === 'demo' || id === 'demo-task-api' || repository?.id === 'repo_demo_1';
  const activeMissionIndex = missions.findIndex((m) => m.id === activeMissionId);
  const missionNumber = activeMissionIndex >= 0 ? activeMissionIndex + 1 : 1;

  if (isLoading && !repository) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-surface-primary">
          <div className="p-8 max-w-md w-full text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue mb-2">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-heading-md font-semibold text-text-primary">
              Loading Forensic Investigation
            </h2>
            <p className="text-body-sm text-text-secondary">
              Hydrating repository AST, verified import topology, and engineering missions...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error && !repository) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-surface-primary p-4">
          <div className="p-8 max-w-lg w-full bg-surface-card border border-accent-rose/30 rounded-2xl shadow-2xl text-center space-y-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-heading-md font-semibold text-text-primary">
                Investigation Unavailable
              </h2>
              <p className="text-body-sm text-text-secondary mt-2">
                {error}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated text-text-primary hover:bg-surface-hover border border-border text-body-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Search
              </Link>
              <button
                onClick={() => loadRepository(id)}
                className="px-4 py-2 rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 text-body-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Banner */}
        {isDemo ? (
          <DemoModeBanner repoName={repository?.fullName || 'demo-org/task-api'} />
        ) : (
          <div className="bg-accent-emerald/10 border-b border-accent-emerald/20 px-4 py-1.5 text-body-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent-emerald">
              <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Live Investigation:</span>
              <span className="font-mono text-text-primary px-1.5 py-0.5 rounded bg-surface-elevated border border-border">
                {repository?.fullName || id}
              </span>
              <span className="text-text-muted hidden sm:inline">• GitHub Ingestion Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted font-mono text-[10px]">
              <span className="hidden md:inline">AST & Graph Synchronized</span>
            </div>
          </div>
        )}

        {/* 44px Command & Context Strip (Stitch design match) */}
        <div className="h-11 bg-surface-primary border-b border-border px-4 flex items-center justify-between flex-shrink-0 select-none">
          {/* Left: Repository & AST Context */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 font-mono text-body-xs truncate">
              <Terminal className="w-3.5 h-3.5 text-accent-blue shrink-0" />
              <span className="text-text-primary font-semibold truncate">
                {repository?.fullName || 'demo-org/task-api'}
              </span>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary hidden sm:inline">
                {repository?.defaultBranch || 'main'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted text-[10px] hidden md:inline">
                {repository?.commitSha ? repository.commitSha.substring(0, 7) : '9a4b2c'}
              </span>
            </div>

            <div className="h-3 w-[1px] bg-border hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-accent-emerald border border-accent-emerald/20 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>
                AST Verified (
                {graphData
                  ? `${graphData.nodeCount} files • ${graphData.edgeCount} verified imports`
                  : '14 files • 9 verified imports'}
                )
              </span>
            </div>
          </div>

          {/* Right: Mission Progress Tracker & Inspector Toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-accent-amber font-semibold tracking-wider flex items-center gap-1">
                <Target className="w-3 h-3" />
                Mission {missionNumber.toString().padStart(2, '0')} / {missions.length.toString().padStart(2, '0')}
              </span>

              {/* Segmented tracker dots */}
              <div className="flex items-center gap-1">
                {missions.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeMissionIndex
                        ? 'w-5 bg-accent-amber'
                        : m.status === 'completed'
                          ? 'w-3 bg-accent-emerald'
                          : 'w-3 bg-surface-hover'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Toggle right inspector in tablet / desktop */}
            <button
              onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
              className="hidden md:flex items-center gap-1 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors border border-border"
              title={isInspectorCollapsed ? 'Expand Forensic Panel' : 'Collapse Forensic Panel'}
            >
              {isInspectorCollapsed ? (
                <PanelRightOpen className="w-4 h-4 text-accent-blue" />
              ) : (
                <PanelRightClose className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 3-Panel Desktop Layout / Mobile Tabbed Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Panel: File Explorer */}
          <div
            className={`w-full md:w-56 lg:w-64 xl:w-72 shrink-0 h-full ${
              activeMobileTab === 'files' ? 'block' : 'hidden md:block'
            }`}
          >
            <FileExplorer />
          </div>

          {/* Center Panel: Architecture Graph */}
          <div
            className={`flex-1 h-full min-w-0 ${
              activeMobileTab === 'graph' ? 'block' : 'hidden md:block'
            }`}
          >
            <CodebaseGraph />
          </div>

          {/* Right Panel: Mission Control / Inspector */}
          {!isInspectorCollapsed && (
            <div
              className={`w-full md:w-72 lg:w-80 xl:w-96 shrink-0 h-full ${
                activeMobileTab === 'mission' ? 'block' : 'hidden md:block'
              }`}
            >
              <InspectorPanel />
            </div>
          )}

          {/* Source Code Viewer Drawer (Monaco) */}
          <SourceDrawer />
        </div>

        {/* Mobile Navigation bar */}
        <MobileNav />
      </div>
    </AppShell>
  );
}
