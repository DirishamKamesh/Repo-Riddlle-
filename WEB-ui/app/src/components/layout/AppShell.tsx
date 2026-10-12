import { TopNav } from './TopNav';
import type { Repository } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
  /** If inside an investigation, show repo context in nav */
  repository?: Repository;
  /** Show back-to-dashboard link */
  showBack?: boolean;
  /** Show analysis status badge */
  analysisActive?: boolean;
  /** Mission progress string */
  missionProgress?: string;
  /** Whether to add top padding for the fixed nav */
  padTop?: boolean;
}

export function AppShell({
  children,
  repository,
  showBack = false,
  analysisActive = false,
  missionProgress,
  padTop = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <TopNav
        repository={repository}
        showBack={showBack}
        analysisActive={analysisActive}
        missionProgress={missionProgress}
      />
      <main className={padTop ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
}
