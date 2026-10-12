import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Hero } from '../components/landing/Hero';
import { RepoUrlInput } from '../components/landing/RepoUrlInput';
import { FeatureCards } from '../components/landing/FeatureCards';
import { GraphPreview } from '../components/landing/GraphPreview';
import { realApi } from '../api';
import { AlertCircle } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInvestigate = useCallback(
    async (url: string, owner: string, repo: string) => {
      setIsSubmitting(true);
      setSubmitError(null);

      // Check if user entered demo repo
      const isDemoUrl = url.includes('demo-org/task-api');
      if (isDemoUrl) {
        setIsSubmitting(false);
        navigate('/analysis/demo');
        return;
      }

      try {
        sessionStorage.setItem(
          'pendingAnalysis',
          JSON.stringify({ url, owner, repo })
        );

        const response = await realApi.analyzeRepo(url);
        setIsSubmitting(false);
        navigate(`/analysis/${response.analysisId}`);
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || 'Failed to connect to backend analysis service.');
      }
    },
    [navigate]
  );

  const handleDemoMode = useCallback(() => {
    navigate('/analysis/demo');
  }, [navigate]);

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <Hero />

          <div className="w-full mt-10 max-w-xl">
            <RepoUrlInput
              onSubmit={handleInvestigate}
              isSubmitting={isSubmitting}
            />

            {submitError && (
              <div className="mt-3 p-3 rounded-lg bg-accent-error/10 border border-accent-error/30 text-accent-error text-body-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="mt-3 text-center">
              <button
                onClick={handleDemoMode}
                className="text-body-sm text-text-muted hover:text-accent-blue transition-colors underline underline-offset-2"
              >
                or try a demo investigation
              </button>
            </div>
          </div>

          <GraphPreview />

          <FeatureCards />
        </div>
      </div>
    </AppShell>
  );
}
