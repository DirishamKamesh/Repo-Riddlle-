import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  GitBranch, 
  Folder, 
  Share2, 
  FileCode, 
  Target,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { repoRiddleApi, isDemoId } from '../lib/api';
import { AnalysisStatusResponse } from '../types';
import { DEMO_STAGE_DEFINITIONS } from '../lib/demoData';

export const ScanningSequence: React.FC = () => {
  const { id = 'demo-faculynk' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isDemo = isDemoId(id);
  const repoParam = searchParams.get('repo');

  const [statusData, setStatusData] = useState<AnalysisStatusResponse | null>(null);
  const [demoStep, setDemoStep] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const pollStatus = useCallback(async (step: number) => {
    try {
      setError(null);
      const res = await repoRiddleApi.getStatus(id, step);
      setStatusData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis status polling failed.';
      setError(msg);
    }
  }, [id]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isDemo) {
      pollStatus(demoStep);
      timer = setInterval(() => {
        setDemoStep((prev) => {
          const next = prev < 5 ? prev + 1 : 5;
          pollStatus(next);
          return next;
        });
      }, 1800);
    } else {
      pollStatus(1);
      timer = setInterval(() => {
        pollStatus(1);
      }, 3000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id, isDemo, retryCount, pollStatus]);

  const stages = statusData?.stages || DEMO_STAGE_DEFINITIONS.map((d, idx) => ({
    ...d,
    status: idx < 2 ? 'completed' : idx === 2 ? 'in_progress' : 'pending',
  }));

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progress = statusData?.progress ?? Math.round((completedCount / stages.length) * 100);
  const isCompleted = statusData?.status === 'completed' || progress >= 100;
  const repoFullName = statusData?.repository?.fullName || repoParam || (isDemo ? 'DirishamKamesh/FacuLynk' : id);
  const repoBranch = statusData?.repository?.branch || 'main';
  const repoLanguage = statusData?.repository?.language || 'TypeScript';

  return (
    <div className="min-h-screen flex flex-col bg-tactical-grid" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Context Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {/* Repository Identity Pill */}
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl border"
              style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-color)' }}
            >
              <FileCode className="w-4 h-4 text-[var(--color-blue)]" />
              <div className="text-xs">
                <div className="font-mono font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>{repoFullName}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {isDemo ? 'Demo Investigation Workspace' : 'Analyzing public repository'}
                </div>
              </div>
            </div>

            {/* Metadata Strip */}
            <div
              className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-mono text-[var(--text-secondary)]"
              style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
            >
              <span className="inline-flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-[var(--color-cyan)]" />
                <span>{repoBranch}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{repoLanguage}</span>
            </div>
          </div>
        </div>

        {/* Title & Status Headline */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-cyan)] font-semibold">
            Repository Analysis Sequence
          </p>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text-primary)]">
            {isCompleted ? 'Architecture Scan Complete' : 'Mapping the Architecture...'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            {isCompleted
              ? 'All modules, dependency links, and engineering missions have been indexed and verified.'
              : 'Scanning files, analyzing dependencies, and preparing your tactical investigation.'}
          </p>
        </div>

        {/* Error Banner for Failed Real Analysis */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl border bg-[#FF788B]/10 border-[#FF788B]/30 text-[var(--color-coral)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Scan encountered an error: {error}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--panel-primary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Scan</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/analysis/demo-faculynk')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-cyan)] text-[#080D18] cursor-pointer"
              >
                Switch to Demo
              </button>
            </div>
          </div>
        )}

        {/* Main Split Grid: Left Architecture Cluster + Right 5-Stage Sequence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Tactical Module Cluster Visual */}
          <div
            className="lg:col-span-5 rounded-2xl border p-6 flex flex-col justify-between bg-circuit-dots relative overflow-hidden"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>AST TOPOLOGY SCANNER</span>
              <span className="tabular-nums text-[var(--color-cyan)]">{progress}%</span>
            </div>

            {/* Isometric-inspired Module Nodes Grid */}
            <div className="my-6 grid grid-cols-2 gap-3">
              {[
                { name: 'App.tsx', meta: 'entry · 142L', accent: 'border-[var(--color-blue)]' },
                { name: 'routes/', meta: '12 files', accent: 'border-[var(--color-mint)]' },
                { name: 'services/', meta: '8 files', accent: 'border-[var(--color-cyan)]' },
                { name: 'components/', meta: '28 files', accent: 'border-[var(--color-violet)]' },
                { name: 'hooks/', meta: '6 files', accent: 'border-[var(--color-gold)]' },
                { name: 'utils/', meta: '15 files', accent: 'border-[var(--color-blue)]' },
              ].map((mod) => (
                <div
                  key={mod.name}
                  className={`p-3 rounded-xl border ${mod.accent} transition-all`}
                  style={{ backgroundColor: 'var(--surface-elevated)' }}
                >
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)]">{mod.name}</div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5 tabular-nums">{mod.meta}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs text-[var(--text-secondary)]">
                {isCompleted ? 'Ready for deployment' : 'Building AST dependency graph...'}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/investigation/${id}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--color-blue)] hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
              >
                <span>Enter Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: 5-Stage Progress Sequence */}
          <div
            className="lg:col-span-7 rounded-2xl border p-6 flex flex-col justify-between space-y-5"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-color)' }}
          >
            {/* Progress Header */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Overall Scan Progress
                </span>
                <div className="text-right">
                  <span className="text-2xl font-display font-bold text-[var(--color-blue)] tabular-nums">
                    {progress}%
                  </span>
                  <span className="block text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
                    {completedCount} / {stages.length} stages completed
                  </span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-cyan)] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stages List */}
            <div className="space-y-2.5">
              {stages.map((stage, idx) => {
                const isStageCompleted = stage.status === 'completed';
                const isStageActive = stage.status === 'in_progress';
                const isStageFailed = stage.status === 'failed';

                return (
                  <div
                    key={stage.key || idx}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isStageActive
                        ? 'bg-[var(--surface-elevated)] border-[var(--color-cyan)]'
                        : 'bg-[var(--surface-elevated)]/40 border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        {isStageCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-mint)]" />
                        ) : isStageActive ? (
                          <Loader2 className="w-4 h-4 text-[var(--color-cyan)] animate-spin" />
                        ) : isStageFailed ? (
                          <AlertCircle className="w-4 h-4 text-[var(--color-coral)]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[var(--text-muted)] opacity-40" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div
                          className={`text-xs font-semibold truncate ${
                            isStageActive
                              ? 'text-[var(--color-cyan)]'
                              : isStageCompleted
                              ? 'text-[var(--text-primary)]'
                              : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {idx + 1}. {stage.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {stage.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px] tabular-nums">
                      <span
                        className={
                          isStageCompleted
                            ? 'text-[var(--color-mint)]'
                            : isStageActive
                            ? 'text-[var(--color-cyan)] font-semibold'
                            : isStageFailed
                            ? 'text-[var(--color-coral)]'
                            : 'text-[var(--text-muted)]'
                        }
                      >
                        {isStageCompleted
                          ? 'Completed'
                          : isStageActive
                          ? 'Scanning'
                          : isStageFailed
                          ? 'Failed'
                          : 'Pending'}
                      </span>
                      {stage.duration && (
                        <span className="text-[var(--text-muted)]">{stage.duration}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom 4 Metric Cards (Only rendered when stats are present) */}
        {statusData?.stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="p-2.5 rounded-lg bg-[#7695FF]/15 text-[var(--color-blue)]">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-display font-bold text-[var(--text-primary)] tabular-nums">
                  {statusData.stats.filesIndexed}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Files Indexed</div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="p-2.5 rounded-lg bg-[#43D8A8]/15 text-[var(--color-mint)]">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-display font-bold text-[var(--text-primary)] tabular-nums">
                  {statusData.stats.importsFound}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Imports Found</div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="p-2.5 rounded-lg bg-[#B49AFF]/15 text-[var(--color-violet)]">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-display font-bold text-[var(--text-primary)] tabular-nums">
                  {statusData.stats.modulesAnalyzed}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Modules Analyzed</div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="p-2.5 rounded-lg bg-[#F4C66E]/15 text-[var(--color-gold)]">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-display font-bold text-[var(--text-primary)] tabular-nums">
                  {statusData.stats.missionsReady} / 3
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Missions Ready</div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Mode Notice ONLY when isDemo is true */}
        {isDemo && (
          <div
            className="p-3 rounded-xl border text-center text-xs text-[var(--text-secondary)] font-mono"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
          >
            Demo Investigation Mode active: exploring pre-indexed AST snapshot for DirishamKamesh/FacuLynk.
          </div>
        )}
      </main>
    </div>
  );
};
