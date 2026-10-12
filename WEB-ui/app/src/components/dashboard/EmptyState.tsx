import { FolderGit2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  onNewInvestigation: () => void;
}

export function EmptyState({ onNewInvestigation }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed border-border bg-surface-primary/50">
      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted mb-4">
        <FolderGit2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        No repositories found
      </h3>
      <p className="text-body-sm text-text-secondary max-w-sm mb-6">
        No codebase matches your filter, or you haven't started an investigation yet.
      </p>
      <Button variant="primary" size="md" onClick={onNewInvestigation}>
        Start New Investigation
      </Button>
    </div>
  );
}
