import { Link, useLocation } from 'react-router-dom';
import { Search, GitBranch, Settings, ArrowLeft } from 'lucide-react';
import type { Repository } from '../../types';

interface TopNavProps {
  /** If inside an investigation, show repo context */
  repository?: Repository;
  /** Show back-to-dashboard link */
  showBack?: boolean;
  /** Show analysis status badge */
  analysisActive?: boolean;
  /** Mission progress: e.g. "01 / 06" */
  missionProgress?: string;
}

export function TopNav({
  repository,
  showBack = false,
  analysisActive = false,
  missionProgress,
}: TopNavProps) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-primary border-b border-border h-16">
      <div className="h-full w-full px-4 flex items-center justify-between gap-4">
        {/* Left: Brand + Navigation */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {showBack && (
            <Link
              to="/dashboard"
              className="text-text-muted hover:text-text-primary transition-colors p-1"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
          )}

          <Link to="/" className="flex items-center gap-2">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded bg-accent-blue flex items-center justify-center flex-shrink-0">
              <span className="text-canvas font-mono font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-headline-sm text-text-primary tracking-tight">
              RepoRiddle
            </span>
            <span className="font-mono text-label-code bg-ds-surface-container-high text-accent-blue px-1.5 py-0.5 rounded border border-ds-outline-variant uppercase hidden sm:inline-block">
              v0.1-beta
            </span>
          </Link>

          {/* Navigation links — only on non-landing pages */}
          {!isLanding && (
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              <Link
                to="/dashboard"
                className={`px-2.5 py-1 text-label-md rounded transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-text-primary bg-ds-surface-container-high font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Investigations
              </Link>
            </nav>
          )}
        </div>

        {/* Center: Repository context (when in investigation) */}
        {repository && (
          <div className="hidden sm:flex items-center gap-3 flex-1 justify-center max-w-xl">
            <div className="flex items-center gap-2 bg-ds-surface-container-lowest px-3 py-1.5 rounded border border-ds-outline-variant font-mono text-code-sm">
              <Search size={14} className="text-text-muted" />
              <span className="text-text-muted">investigate:</span>
              <span className="text-accent-blue font-medium truncate">
                {repository.owner}/{repository.name}
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 bg-ds-surface-container-high px-2 py-1 rounded border border-ds-outline-variant font-mono text-code-sm text-text-secondary">
              <GitBranch size={14} className="text-text-muted" />
              <span className="text-text-primary">{repository.defaultBranch}</span>
              <span className="text-text-muted">
                ({repository.commitSha.slice(0, 6)})
              </span>
            </div>
          </div>
        )}

        {/* Right: Status + Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {analysisActive && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-ds-surface-container-lowest border border-ds-outline-variant">
              <span className="w-2 h-2 rounded-full bg-accent-emerald ring-2 ring-accent-emerald/20 animate-pulse" />
              <span className="font-mono text-label-code uppercase tracking-wider text-accent-emerald">
                Active
              </span>
            </div>
          )}

          {missionProgress && (
            <div className="hidden md:flex items-center font-mono text-label-code text-accent-amber uppercase tracking-wider font-semibold">
              {missionProgress}
            </div>
          )}

          <button
            aria-label="Settings"
            className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded hover:bg-surface-hover"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
