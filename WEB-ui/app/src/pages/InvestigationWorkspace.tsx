import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  GitBranch, 
  Target, 
  FileCode, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard,
  AlertCircle,
  RotateCcw,
  Folder,
  Compass,
  Code2
} from 'lucide-react';
import { useInvestigationStore, ActiveTab } from '../store/useInvestigationStore';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { RepoRiddleLogo } from '../components/common/RepoRiddleLogo';
import { RepositoryExplorer } from '../components/workspace/RepositoryExplorer';
import { ArchitectureCanvas } from '../components/workspace/ArchitectureCanvas';
import { MissionPanel } from '../components/workspace/MissionPanel';
import { FileDetailsTab } from '../components/workspace/FileDetailsTab';
import { EvidenceTab } from '../components/workspace/EvidenceTab';
import { TacticalChatTab } from '../components/workspace/TacticalChatTab';
import { SourceViewerDrawer } from '../components/workspace/SourceViewerDrawer';

type MobileView = 'files' | 'graph' | 'mission' | 'source';

export const InvestigationWorkspace: React.FC = () => {
  const { id = 'demo-faculynk' } = useParams<{ id: string }>();
  const {
    repository,
    missions,
    pinnedEvidence,
    activeTab,
    setActiveTab,
    isRightPanelOpen,
    toggleRightPanel,
    isLoading,
    error,
    initializeInvestigation,
    openSourceViewer,
  } = useInvestigationStore();

  const [mobileView, setMobileView] = useState<MobileView>('graph');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    initializeInvestigation(id);
  }, [id, initializeInvestigation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    setIsMobileViewport(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const solvedCount = missions.filter((m) => m.isSolved).length;

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col select-none"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Unified Compact Investigation Header */}
      <header
        className="h-13 border-b flex items-center justify-between gap-4 px-4 shrink-0"
        style={{
          backgroundColor: 'var(--panel-primary)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Zone 1: Brand + Repository Context */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display font-bold text-base tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 hover:text-[var(--color-blue)] transition-colors group"
          >
            <RepoRiddleLogo size={24} className="group-hover:scale-105 transition-transform duration-150" />
            <span>RepoRiddle</span>
          </Link>

          <span className="text-[var(--border-strong)]" aria-hidden="true">/</span>

          {repository ? (
            <div className="flex items-center gap-2.5 min-w-0 text-xs font-mono">
              <span className="font-semibold text-[var(--text-primary)] truncate">
                {repository.fullName}
              </span>
              <span className="hidden sm:inline text-[var(--text-muted)]" aria-hidden="true">·</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[var(--text-secondary)]">
                <GitBranch className="w-3 h-3 text-[var(--color-cyan)]" />
                <span>{repository.branch}</span>
              </span>
              {repository.language && (
                <>
                  <span className="hidden md:inline text-[var(--text-muted)]" aria-hidden="true">·</span>
                  <span className="hidden md:inline text-[var(--text-secondary)]">
                    {repository.language}
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-xs font-mono text-[var(--text-muted)]">Loading repository...</span>
          )}
        </div>

        {/* Zone 2: Mission Progress Status */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono tabular-nums text-[var(--text-secondary)]">
          <span>
            Quest Progress: <strong className="text-[var(--color-gold)]">{solvedCount} / {missions.length || 3}</strong> Verified
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Evidence Collected: <strong className="text-[var(--color-cyan)]">{pinnedEvidence.length}</strong>
          </span>
        </div>

        {/* Zone 3: Navigation & Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors whitespace-nowrap shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="px-4 py-2.5 bg-[#FF788B]/10 border-b border-[#FF788B]/30 text-xs text-[var(--color-coral)] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Failed to load workspace: {error}</span>
          </div>
          <button
            type="button"
            onClick={() => initializeInvestigation(id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--panel-primary)] text-[var(--text-primary)] border border-[var(--border-color)] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[var(--text-muted)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-blue)] border-t-transparent animate-spin" />
          <span>Initializing Tactical Command Center...</span>
        </div>
      ) : !isMobileViewport ? (
        /* DESKTOP 3-PANEL WORKSTATION */
        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
          {/* Left Panel: Repository Explorer */}
          <RepositoryExplorer />

          {/* Center Panel: Architecture Investigation Canvas */}
          <main className="flex-1 h-full min-w-0 relative flex flex-col">
            <ArchitectureCanvas />
          </main>

          {/* Right Panel: Mission & Inspection Panel */}
          {!isRightPanelOpen ? (
            <div
              className="w-11 h-full border-l flex flex-col items-center py-3 shrink-0"
              style={{
                backgroundColor: 'var(--panel-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={toggleRightPanel}
                aria-label="Expand Mission and Inspection Panel"
                title="Expand Mission and Inspection Panel"
                className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <aside
              aria-label="Mission and Inspection Panel"
              className="w-80 lg:w-96 h-full border-l flex flex-col shrink-0 transition-colors"
              style={{
                backgroundColor: 'var(--panel-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {/* Switchable Side Panel Tabs */}
              <div
                className="h-12 border-b flex items-center justify-between px-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div role="tablist" aria-label="Inspection tabs" className="flex items-center gap-0.5 overflow-x-auto">
                  {([
                    { id: 'mission', label: 'Mission', icon: Target },
                    { id: 'details', label: 'File Details', icon: FileCode },
                    { id: 'evidence', label: `Evidence (${pinnedEvidence.length})`, icon: Bookmark },
                    { id: 'copilot', label: 'Co-Pilot', icon: Compass },
                  ] as const).map((tab) => {
                    const Icon = tab.icon;
                    const isTabActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isTabActive}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isTabActive
                            ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] font-semibold'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={toggleRightPanel}
                  aria-label="Collapse Mission Panel"
                  title="Collapse Mission Panel"
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {activeTab === 'mission' && <MissionPanel />}
                {activeTab === 'details' && <FileDetailsTab />}
                {activeTab === 'evidence' && <EvidenceTab />}
                {activeTab === 'copilot' && <TacticalChatTab />}
              </div>
            </aside>
          )}
        </div>
      ) : (
        /* MOBILE SINGLE-PANEL EXPERIENCE */
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {mobileView === 'files' && (
                <div className="flex-1 overflow-y-auto">
                  <RepositoryExplorer />
                </div>
              )}
              {mobileView === 'graph' && (
                <div className="flex-1 h-full relative flex flex-col">
                  <ArchitectureCanvas />
                </div>
              )}
              {mobileView === 'mission' && (
                <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--panel-primary)' }}>
                  <MissionPanel />
                </div>
              )}
              {mobileView === 'source' && (
                <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--panel-primary)' }}>
                  <FileDetailsTab />
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <nav
              aria-label="Mobile workspace view switcher"
              className="h-13 border-t grid grid-cols-4 shrink-0"
              style={{
                backgroundColor: 'var(--panel-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {[
                { id: 'files', label: 'Files', icon: Folder },
                { id: 'graph', label: 'Graph', icon: Compass },
                { id: 'mission', label: 'Mission', icon: Target },
                { id: 'source', label: 'Inspector', icon: Code2 },
              ].map((item) => {
                const Icon = item.icon;
                const active = mobileView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'source') {
                        openSourceViewer();
                      }
                      setMobileView(item.id as MobileView);
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium cursor-pointer ${
                      active ? 'text-[var(--color-blue)] font-semibold' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
      )}

      {/* Source Inspection Drawer */}
      <SourceViewerDrawer />
    </div>
  );
};
