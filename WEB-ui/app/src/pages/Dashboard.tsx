import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  GitBranch, 
  ArrowRight, 
  Folder, 
  Share2, 
  Compass, 
  Clock,
  X
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { repoRiddleApi } from '../lib/api';
import { RepositoryMetadata } from '../types';

import { DEMO_DASHBOARD_REPOSITORIES } from '../lib/demoData';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState<RepositoryMetadata[]>(DEMO_DASHBOARD_REPOSITORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    repoRiddleApi
      .getDashboard()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setRepositories(data);
        }
      })
      .catch(() => {
        // Keep existing repositories on network timeout
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredRepos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return repositories;
    return repositories.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.language.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q)
    );
  }, [repositories, searchQuery]);

  const primaryRepo = filteredRepos[0];
  const otherRepos = filteredRepos.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-tactical-grid" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Heading + Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)]">
              Investigation Hub
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Resume active codebase investigations or launch a new repository scan.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-blue)] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            aria-label="Filter recent repositories"
            placeholder="Filter repositories by name or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl text-xs font-mono bg-[var(--panel-primary)] text-[var(--text-primary)] border border-[var(--border-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-blue)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear repository filter"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl border animate-pulse"
                style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
              />
            ))}
          </div>
        ) : filteredRepos.length === 0 ? (
          <div
            className="p-12 rounded-2xl border text-center space-y-3"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
          >
            <Compass className="w-8 h-8 mx-auto text-[var(--color-blue)] opacity-60" />
            <h2 className="text-base font-display font-bold text-[var(--text-primary)]">
              No Matching Investigations
            </h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              {searchQuery
                ? `No repositories matched "${searchQuery}". Clear your search or start a new repository analysis.`
                : 'You have not analyzed any repositories yet. Enter a GitHub URL in the Launch Bay to begin.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => (searchQuery ? setSearchQuery('') : navigate('/'))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--color-blue)] cursor-pointer"
              >
                {searchQuery ? 'Reset Filter' : 'Start First Investigation'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active / Most Recent Priority Card */}
            {primaryRepo && (
              <div
                className="p-6 rounded-2xl border shadow-sm transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                style={{
                  backgroundColor: 'var(--panel-primary)',
                  borderColor: 'var(--color-blue)',
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-cyan)]">
                    <span>ACTIVE INVESTIGATION</span>
                    <span aria-hidden="true">·</span>
                    <span>{primaryRepo.language}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {primaryRepo.branch}
                    </span>
                  </div>

                  <h2 className="text-xl font-display font-bold text-[var(--text-primary)] font-mono">
                    {primaryRepo.fullName}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-[var(--text-secondary)]">
                    {primaryRepo.filesCount !== undefined && (
                      <span>{primaryRepo.filesCount} files indexed</span>
                    )}
                    {primaryRepo.importsCount !== undefined && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{primaryRepo.importsCount} dependency links</span>
                      </>
                    )}
                    {primaryRepo.modulesCount !== undefined && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{primaryRepo.modulesCount} modules</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/analysis/${primaryRepo.id}`)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    Scan Report
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/investigation/${primaryRepo.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--color-blue)] hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <span>Resume Investigation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Secondary Repositories Grid */}
            {otherRepos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Recent Repositories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-5 rounded-xl border flex flex-col justify-between gap-4 transition-colors"
                      style={{
                        backgroundColor: 'var(--panel-primary)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                          <span>{repo.language}</span>
                          <span className="inline-flex items-center gap-1">
                            <GitBranch className="w-3 h-3 text-[var(--color-cyan)]" />
                            {repo.branch}
                          </span>
                        </div>
                        <h4 className="text-base font-bold font-mono text-[var(--text-primary)] truncate">
                          {repo.fullName}
                        </h4>
                        <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-[var(--text-secondary)]">
                          {repo.filesCount !== undefined && <span>{repo.filesCount} files</span>}
                          {repo.importsCount !== undefined && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{repo.importsCount} imports</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          Ready to inspect
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/investigation/${repo.id}`)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-blue)] hover:underline cursor-pointer"
                        >
                          <span>Resume</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
