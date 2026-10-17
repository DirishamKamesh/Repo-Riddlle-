import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Target, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FileCode, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useInvestigationStore } from '../../store/useInvestigationStore';

export const MissionPanel: React.FC = () => {
  const {
    missions,
    activeMissionId,
    setActiveMissionId,
    requestNextHint,
    submitMissionAnswer,
    isSubmittingMission,
    missionFeedback,
    selectFile,
  } = useInvestigationStore();

  const [answerInput, setAnswerInput] = useState('');

  const activeMission = missions.find((m) => m.id === activeMissionId) || missions[0];

  const handleHintClick = () => {
    if (!activeMission) return;
    requestNextHint(activeMission.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || !activeMission) return;

    const result = await submitMissionAnswer(activeMission.id, answerInput);
    if (result.isCorrect) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#45D9CF', '#43D8A8', '#7695FF', '#F4C66E'],
        });
      } catch {
        // non-fatal
      }
      setAnswerInput('');
    }
  };

  if (!activeMission) {
    return (
      <div className="p-6 text-center text-xs text-[var(--text-muted)]">
        No active mission assigned to this investigation.
      </div>
    );
  }

  const remainingHints = Math.max(0, activeMission.maxHints - activeMission.hintsUsed);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 select-none">
      {/* Mission Switcher / Stepper */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-elevated)] border" style={{ borderColor: 'var(--border-subtle)' }}>
        {missions.map((m, idx) => {
          const isActive = m.id === activeMission.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMissionId(m.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all ${
                isActive
                  ? 'bg-[#F4C66E] text-[#080D18] font-bold shadow-xs'
                  : m.isSolved
                  ? 'bg-[var(--surface-hover)] text-[#43D8A8]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {m.isSolved ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#43D8A8]" />
              ) : (
                <span>0{idx + 1}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mission Header Card */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#F4C66E]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#F4C66E] font-bold">
              Mission Objective 0{activeMission.order}
            </span>
          </div>

          {activeMission.isSolved ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#43D8A8]/15 text-[#43D8A8] border border-[#43D8A8]/30">
              <ShieldCheck className="w-3 h-3" />
              VERIFIED
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--text-muted)] border" style={{ borderColor: 'var(--border-subtle)' }}>
              IN PROGRESS
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-[var(--text-primary)] font-display mb-1.5 leading-snug">
          {activeMission.title}
        </h3>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {activeMission.objective}
        </p>
      </div>

      {/* Starting Clue */}
      <div className="p-3 rounded-xl border bg-[var(--surface-elevated)]/60" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#7695FF]" />
          <span>Starting Tactical Clue</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
          "{activeMission.startingClue}"
        </p>
      </div>

      {/* Relevant Files Tags */}
      {activeMission.relevantFiles && activeMission.relevantFiles.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
            Target Files for Investigation
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeMission.relevantFiles.map((path) => (
              <button
                key={path}
                onClick={() => selectFile(path)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-[#7695FF] border transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <FileCode className="w-3 h-3 text-[#7695FF]" />
                <span>{path.split('/').pop()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progressive Hints Drawer */}
      <div className="p-3 rounded-xl border bg-[var(--surface-elevated)]/40" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)]">
            <Lightbulb className="w-3.5 h-3.5 text-[#F4C66E]" />
            <span>Tactical Hints</span>
          </div>

          {remainingHints > 0 ? (
            <button
              onClick={handleHintClick}
              className="text-[11px] font-mono text-[#F4C66E] hover:underline cursor-pointer"
            >
              Unlock Hint ({remainingHints} left)
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              All hints unlocked
            </span>
          )}
        </div>

        {activeMission.hintsUsed === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)]">
            No hints requested yet. Click above to unlock hints if you get stuck.
          </p>
        ) : (
          <div className="space-y-2">
            {activeMission.hints.slice(0, activeMission.hintsUsed).map((hint, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-[var(--surface-elevated)] border text-xs text-[var(--text-secondary)] font-mono leading-relaxed"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span className="text-[#F4C66E] font-bold mr-1.5">Hint {idx + 1}:</span>
                {hint}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Section */}
      <div className="pt-2 border-t mt-auto" style={{ borderColor: 'var(--border-subtle)' }}>
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
            Submit Investigation Findings
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. x-sentinel-ticket or Dashboard.Advisor"
              value={answerInput}
              disabled={activeMission.isSolved || isSubmittingMission}
              onChange={(e) => setAnswerInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F4C66E] font-mono transition-colors disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={!answerInput.trim() || activeMission.isSolved || isSubmittingMission}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-[#080D18] bg-gradient-to-r from-[#F4C66E] to-[#E2B155] hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs font-display"
          >
            {isSubmittingMission ? (
              <span>Evaluating Solution...</span>
            ) : activeMission.isSolved ? (
              <span className="flex items-center gap-1.5 text-[#087E5B]">
                <CheckCircle2 className="w-4 h-4" />
                Objective Solved
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Submit Findings
              </span>
            )}
          </button>
        </form>

        {/* Evaluation Result Feedback */}
        {missionFeedback && (
          <div
            className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${
              missionFeedback.isCorrect
                ? 'bg-[#43D8A8]/10 text-[#43D8A8] border-[#43D8A8]/30'
                : 'bg-[#FF788B]/10 text-[#FF788B] border-[#FF788B]/30'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {missionFeedback.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-[#43D8A8]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#FF788B]" />
              )}
              <span>{missionFeedback.isCorrect ? 'Verification Successful' : 'Feedback'}</span>
            </div>
            <p>{missionFeedback.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
