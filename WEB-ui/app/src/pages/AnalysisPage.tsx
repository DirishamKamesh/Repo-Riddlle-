import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AnalysisProgress, StageInfo } from '../components/analysis/AnalysisProgress';
import { Button } from '../components/ui/Button';
import { realApi } from '../api';
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const INITIAL_STAGES: StageInfo[] = [
  {
    number: 1,
    label: 'Connecting to repository',
    detail: 'Authenticating and validating target repository tree...',
    state: 'in_progress',
  },
  {
    number: 2,
    label: 'Reading directory hierarchy',
    detail: 'Enumerating files and applying path classification tokens...',
    state: 'pending',
  },
  {
    number: 3,
    label: 'Analyzing verified imports',
    detail: 'Resolving static import/export declarations across JS/TS modules...',
    state: 'pending',
  },
  {
    number: 4,
    label: 'Constructing architecture graph',
    detail: 'Building containment boundaries and verified edge mappings...',
    state: 'pending',
  },
  {
    number: 5,
    label: 'Preparing forensic missions',
    detail: 'Synthesizing evidence-backed engineering objectives...',
    state: 'pending',
  },
];

export function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stages, setStages] = useState<StageInfo[]>(INITIAL_STAGES);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDemo = id === 'demo' || id === 'demo-task-api';

  // Check if there was pending analysis from landing page
  const pendingData = (() => {
    try {
      const stored = sessionStorage.getItem('pendingAnalysis');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const repoTitle =
    pendingData?.owner && pendingData?.repo
      ? `${pendingData.owner} / ${pendingData.repo}`
      : isDemo
        ? 'demo-org / task-api'
        : id || 'Repository Analysis';

  const startAnalysis = useCallback(() => {
    setIsFailed(false);
    setIsComplete(false);
    setErrorMessage(null);
    setCurrentStep(0);
    setStages(INITIAL_STAGES);
  }, []);

  useEffect(() => {
    if (isDemo) {
      // Demo simulation
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= INITIAL_STAGES.length) {
            clearInterval(interval);
            setIsComplete(true);
            return INITIAL_STAGES.length;
          }
          return next;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    if (!id) return;

    // Real backend polling
    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await realApi.getAnalysisStatus(id);
        if (!isSubscribed) return;

        if (statusRes.status === 'complete') {
          setIsComplete(true);
          setCurrentStep(INITIAL_STAGES.length);
          clearInterval(pollInterval);
        } else if (statusRes.status === 'failed') {
          setIsFailed(true);
          setErrorMessage(statusRes.progress?.detail || 'Analysis failed on backend');
          clearInterval(pollInterval);
        } else {
          // Map backend status to steps
          const statusStepMap: Record<string, number> = {
            connecting: 0,
            reading_tree: 1,
            fetching_files: 2,
            analyzing_imports: 3,
            building_map: 3,
            preparing_missions: 4,
          };
          const step = statusStepMap[statusRes.status] ?? 1;
          setCurrentStep(step);

          // Update stage detail text dynamically
          if (statusRes.progress?.detail) {
            setStages((prev) =>
              prev.map((s, idx) =>
                idx === step ? { ...s, detail: statusRes.progress.detail } : s
              )
            );
          }
        }
      } catch (err: any) {
        if (!isSubscribed) return;
        setIsFailed(true);
        setErrorMessage(err.message || 'Error checking analysis status');
        clearInterval(pollInterval);
      }
    }, 1200);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [id, isDemo, isFailed]);

  useEffect(() => {
    if (isFailed) {
      setStages((prev) =>
        prev.map((s, idx) =>
          idx === Math.min(currentStep, 2)
            ? { ...s, state: 'failed', detail: errorMessage || 'Analysis interrupted.' }
            : s
        )
      );
      return;
    }

    setStages((prevStages) =>
      prevStages.map((stage, idx) => {
        if (idx < currentStep) {
          return { ...stage, state: 'completed' };
        } else if (idx === currentStep) {
          return { ...stage, state: 'in_progress' };
        } else {
          return { ...stage, state: 'pending' };
        }
      })
    );
  }, [currentStep, isFailed, errorMessage]);

  const progressPercent = isFailed
    ? 40
    : Math.min(100, Math.round((currentStep / INITIAL_STAGES.length) * 100));

  const handleLaunch = () => {
    const targetId = isDemo ? 'demo-task-api' : id || 'demo-task-api';
    navigate(`/investigation/${targetId}`);
  };

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto rounded-2xl border border-border bg-surface-primary/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          {/* Demo mode alert banner */}
          <div className="mb-5 p-3 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-between text-body-xs text-accent-amber">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Demo Mode:</span>
              <span className="text-text-secondary">Simulated static analysis of sample repository</span>
            </div>
            <Link to="/" className="text-text-muted hover:text-text-primary text-[11px] underline">
              Cancel
            </Link>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary font-mono truncate max-w-xs sm:max-w-md">
                  {repoTitle}
                </h2>
                <p className="text-body-xs text-text-muted">
                  Static AST dependency extraction
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-body-xs text-accent-emerald font-mono px-2.5 py-1 rounded bg-accent-emerald/10 border border-accent-emerald/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>STRICT MVP</span>
            </div>
          </div>

          <div className="py-6">
            <AnalysisProgress
              stages={stages}
              overallProgress={isComplete ? 100 : progressPercent}
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-body-xs text-text-muted">
              {isFailed
                ? 'Analysis interrupted.'
                : isComplete
                  ? 'Analysis complete. Investigation ready.'
                  : 'Processing codebase structure...'}
            </span>

            {isFailed ? (
              <Button variant="danger" size="md" onClick={startAnalysis}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                <span>Retry Analysis</span>
              </Button>
            ) : isComplete ? (
              <Button variant="primary" size="md" onClick={handleLaunch}>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-body-xs text-accent-blue font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing AST</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
