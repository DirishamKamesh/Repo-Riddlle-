import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  GitBranch, 
  Search, 
  ArrowRight, 
  Code2, 
  Target, 
  AlertCircle, 
  Compass,
  FileCode,
  Workflow
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { RepoRiddleLogo } from '../components/common/RepoRiddleLogo';
import { validateGitHubUrl } from '../lib/investigationRules';
import { repoRiddleApi } from '../lib/api';

export const LaunchBay: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [repoUrl, setRepoUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('autostart') === '1') {
      navigate('/investigation/demo-faculynk', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleStartInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setValidationError(null);
    setApiError(null);

    const parsed = validateGitHubUrl(repoUrl);
    if (!parsed.isValid) {
      setValidationError(parsed.error || 'Invalid GitHub repository URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await repoRiddleApi.startAnalysis(parsed.normalizedUrl, false);
      navigate(`/analysis/${response.analysisId}?repo=${encodeURIComponent(parsed.fullName)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to reach analysis service.';
      setApiError(msg);
      setIsSubmitting(false);
    }
  };

  const handleStartDemo = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setValidationError(null);
    setApiError(null);
    try {
      const res = await repoRiddleApi.startAnalysis('https://github.com/DirishamKamesh/FacuLynk', true);
      navigate(`/analysis/${res.analysisId}`);
    } catch {
      navigate('/analysis/demo-faculynk');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-tactical-grid" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-3xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[var(--color-cyan)] font-semibold">
            <RepoRiddleLogo size={20} />
            <span>Tactical Codebase Investigation Platform</span>
          </div>

          <h1
            className="font-display font-bold tracking-tight text-[var(--text-primary)] leading-tight"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', textWrap: 'balance' }}
          >
            Every codebase has a story.{' '}
            <span className="bg-gradient-to-r from-[var(--color-blue)] via-[var(--color-cyan)] to-[var(--color-mint)] bg-clip-text text-transparent">
              Find it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Explore architecture, trace dependencies, inspect source code, and solve engineering missions inside any public GitHub repository.
          </p>

          {/* Repository Input Panel */}
          <div
            className="mt-8 p-4 sm:p-5 rounded-2xl border shadow-lg text-left transition-colors"
            style={{
              backgroundColor: 'var(--panel-primary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <form onSubmit={handleStartInvestigation} noValidate className="space-y-3">
              <label htmlFor="github-repo-input" className="block text-xs font-mono text-[var(--text-secondary)]">
                Public GitHub Repository URL
              </label>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    id="github-repo-input"
                    type="url"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="https://github.com/DirishamKamesh/FacuLynk"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-blue)] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-blue)] hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  <span>{isSubmitting ? 'Scanning Repository...' : 'Start Investigation'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium bg-[#FF788B]/10 text-[var(--color-coral)] border border-[#FF788B]/30"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Live Backend Error + Retry / Demo Options */}
              {apiError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg text-xs bg-[#FF788B]/10 text-[var(--color-coral)] border border-[#FF788B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Backend connection error: {apiError}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-mono cursor-pointer"
                    >
                      Retry Live Scan
                    </button>
                    <button
                      type="button"
                      onClick={handleStartDemo}
                      className="px-2.5 py-1 rounded bg-[var(--color-cyan)] text-[#080D18] font-semibold font-mono cursor-pointer"
                    >
                      Use Demo Mode
                    </button>
                  </div>
                </div>
              )}

              {/* Demo Mode & Preset Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex flex-wrap items-center gap-2 text-[var(--text-muted)] font-mono">
                  <span>Quick sample:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRepoUrl('https://github.com/DirishamKamesh/FacuLynk');
                      setValidationError(null);
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--color-blue)] underline decoration-dotted cursor-pointer"
                  >
                    DirishamKamesh/FacuLynk
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRepoUrl('https://github.com/Zedoman/Carbon_Forest');
                      setValidationError(null);
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--color-blue)] underline decoration-dotted cursor-pointer"
                  >
                    Zedoman/Carbon_Forest
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleStartDemo}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-cyan)] hover:underline cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Try Demo Investigation</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Architecture Preview Visual (Separate from live results, inspired by Screenshot 2) */}
        <section
          aria-label="Interactive Architecture Preview"
          className="w-full mt-12 rounded-2xl border p-6 sm:p-8 relative overflow-hidden bg-circuit-dots"
          style={{
            backgroundColor: 'var(--panel-primary)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <span>ARCHITECTURE PREVIEW</span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--text-secondary)]">DirishamKamesh/FacuLynk</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/investigation/demo-faculynk')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-cyan)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Enter Command Center
            </button>
          </div>

          {/* Illustrative Node Diagram */}
          <div className="relative w-full flex flex-col items-center justify-between py-2 select-none">
            {/* Root Node */}
            <div
              className="z-10 px-5 py-2 rounded-xl border-2 border-[var(--color-blue)] font-mono text-xs sm:text-sm font-semibold text-[var(--text-primary)] shadow-md"
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            >
              DirishamKamesh/FacuLynk
            </div>

            {/* SVG Connecting Curves */}
            <svg className="w-full h-16 overflow-visible pointer-events-none" viewBox="0 0 800 100" preserveAspectRatio="none">
              <path d="M 400 0 C 400 50, 100 50, 100 100" fill="none" stroke="var(--color-blue)" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 400 0 C 400 50, 250 50, 250 100" fill="none" stroke="var(--color-cyan)" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 400 0 C 400 50, 400 50, 400 100" fill="none" stroke="var(--color-mint)" strokeWidth="2" />
              <path d="M 400 0 C 400 50, 550 50, 550 100" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 400 0 C 400 50, 700 50, 700 100" fill="none" stroke="var(--color-violet)" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {/* Child Module Nodes */}
            <div className="z-10 grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-4xl">
              {[
                { name: 'src/App.tsx', role: 'Entry · 142L', border: 'border-[var(--color-blue)]' },
                { name: 'routes/auth.ts', role: 'Route · 84L', border: 'border-[var(--color-mint)]' },
                { name: 'Gantry.Core.ts', role: 'Model · 348L', border: 'border-[var(--color-gold)]' },
                { name: 'Dashboard.Advisor', role: 'Component · 260L', border: 'border-[var(--color-violet)]' },
                { name: 'AuthSentinel.ts', role: 'Utility · 172L', border: 'border-[var(--color-cyan)]' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigate('/investigation/demo-faculynk')}
                  style={{ backgroundColor: 'var(--surface-elevated)' }}
                  className={`p-3 rounded-xl border ${item.border} text-left hover:scale-102 transition-transform cursor-pointer`}
                >
                  <div className="font-mono text-xs font-semibold text-[var(--text-primary)] truncate">
                    {item.name}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1 tabular-nums">
                    {item.role}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Three-Column Feature Section */}
        <section aria-label="Core Platform Capabilities" className="w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-xl border space-y-3"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#7695FF]/15 text-[var(--color-blue)]">
              <GitBranch className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold font-display text-[var(--text-primary)]">
              01. Trace Dependencies
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Visualize static import trees and runtime execution workflows. Select any module to isolate its blast radius and upstream callers.
            </p>
          </div>

          <div
            className="p-6 rounded-xl border space-y-3"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#45D9CF]/15 text-[var(--color-cyan)]">
              <Code2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold font-display text-[var(--text-primary)]">
              02. Investigate Source Code
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Inspect AST summaries, exported symbols, and full source files in Monaco Editor with line-level citation pinning.
            </p>
          </div>

          <div
            className="p-6 rounded-xl border space-y-3"
            style={{ backgroundColor: 'var(--panel-primary)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F4C66E]/15 text-[var(--color-gold)]">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold font-display text-[var(--text-primary)]">
              03. Solve Engineering Missions
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Follow progressive clues, collect code evidence, and verify your architectural findings against real repository quests.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
