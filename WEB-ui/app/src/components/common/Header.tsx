import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { RepoRiddleLogo } from './RepoRiddleLogo';

interface HeaderProps {
  currentRepo?: string;
  isInvestigation?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className="sticky top-0 z-40 w-full h-14 border-b transition-colors flex items-center justify-between gap-8 px-4 sm:px-6 select-none"
      style={{
        backgroundColor: 'var(--panel-primary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Zone 1: Brand Emblem + Wordmark */}
      <Link
        to="/"
        className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7695FF] rounded px-1 group"
      >
        <RepoRiddleLogo size={28} className="group-hover:scale-105 transition-transform duration-150" />
        <span>RepoRiddle</span>
      </Link>

      {/* Zone 2: Concise single-line navigation links */}
      <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link
          to="/"
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            isActive('/')
              ? 'text-[var(--text-primary)] border-[#7695FF] font-semibold'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
          }`}
        >
          Launch Bay
        </Link>
        <Link
          to="/dashboard"
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            isActive('/dashboard')
              ? 'text-[var(--text-primary)] border-[#7695FF] font-semibold'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/analysis/demo-faculynk"
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            isActive('/analysis')
              ? 'text-[var(--text-primary)] border-[#7695FF] font-semibold'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
          }`}
        >
          Scan Sequence
        </Link>
        <Link
          to="/investigation/demo-faculynk"
          className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            isActive('/investigation')
              ? 'text-[var(--text-primary)] border-[#7695FF] font-semibold'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
          }`}
        >
          Command Center
        </Link>
      </nav>

      {/* Zone 3: Theme Toggle & Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <Link
          to="/investigation/demo-faculynk"
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#3E60DA] dark:bg-[#7695FF] dark:text-[#080D18] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          Open Workspace
        </Link>
      </div>
    </header>
  );
};
