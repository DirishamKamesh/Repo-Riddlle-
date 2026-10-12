import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent-amber mb-6 shadow-xl">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
          Route Not Found
        </h1>
        <p className="text-text-secondary text-body-md max-w-md mb-8">
          The requested page or repository investigation could not be located in this workspace.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Landing
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
