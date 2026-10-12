import { Plus, Search, GitBranch } from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewInvestigation: () => void;
  totalRepos: number;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  onNewInvestigation,
  totalRepos,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Repository Portal
          </h1>
          <span className="text-body-xs font-mono px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-border">
            {totalRepos} tracked
          </span>
        </div>
        <p className="text-body-sm text-text-secondary mt-1">
          Select an existing codebase investigation or analyze a new GitHub repository.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter repositories..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
          />
        </div>

        <Button variant="primary" size="md" onClick={onNewInvestigation}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Investigation</span>
        </Button>
      </div>
    </div>
  );
}
