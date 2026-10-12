import { useState } from 'react';
import { useInvestigationStore } from '../../store/investigation-store';
import { useUIStore } from '../../store/ui-store';
import { EvidenceCard } from './EvidenceCard';
import { MissionFeedback } from './MissionFeedback';
import { Button } from '../ui/Button';
import {
  Target,
  Lightbulb,
  Pin,
  Send,
  Lock,
  CheckCircle2,
  HelpCircle,
  Code2,
} from 'lucide-react';

export function MissionView() {
  const {
    missions,
    activeMissionId,
    activeMission,
    setActiveMission,
    usedHintsCount,
    requestNextHint,
    evidence,
    removeEvidence,
    submitMissionAnswer,
    feedback,
    resetFeedback,
    selectFile,
  } = useInvestigationStore();

  const { setSourceDrawerOpen } = useUIStore();
  const [answerText, setAnswerText] = useState('');

  if (!activeMission) {
    return (
      <div className="p-4 text-center text-text-muted text-body-sm">
        No active mission selected
      </div>
    );
  }

  const handleSelectFile = (path: string) => {
    selectFile(path);
    setSourceDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() && evidence.length === 0) return;
    submitMissionAnswer(answerText);
  };

  const handleNextMission = () => {
    const currentIndex = missions.findIndex((m) => m.id === activeMissionId);
    if (currentIndex >= 0 && currentIndex < missions.length - 1) {
      setActiveMission(missions[currentIndex + 1].id);
      setAnswerText('');
      resetFeedback();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-5 custom-scrollbar">
      {/* Mission selector pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated/70 border border-border">
        {missions.map((m) => {
          const isSelected = m.id === activeMissionId;
          const isLocked = m.status === 'locked';
          return (
            <button
              key={m.id}
              onClick={() => !isLocked && setActiveMission(m.id)}
              disabled={isLocked}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-mono transition-all flex items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30 font-bold shadow-sm'
                  : isLocked
                    ? 'text-text-muted opacity-40 cursor-not-allowed'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {isLocked ? (
                <Lock className="w-3 h-3" />
              ) : m.status === 'completed' ? (
                <CheckCircle2 className="w-3 h-3 text-accent-emerald" />
              ) : (
                <Target className="w-3 h-3" />
              )}
              <span>M{m.order}</span>
            </button>
          );
        })}
      </div>

      {/* Active objective box */}
      <div className="rounded-xl border border-border bg-surface-elevated/40 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent-amber font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
            Active Investigation
          </span>
          <span className="text-[10px] font-mono text-text-muted uppercase">
            {activeMission.type.replace('_', ' ')}
          </span>
        </div>

        <h3 className="font-semibold text-text-primary text-body-sm leading-snug">
          {activeMission.objective}
        </h3>

        <div className="text-body-xs text-text-secondary bg-surface-primary/70 p-2.5 rounded-lg border border-border/60">
          <span className="font-semibold text-text-primary">Clue: </span>
          {activeMission.startingClue}
        </div>

        {/* Suggested files */}
        {activeMission.relevantFiles && activeMission.relevantFiles.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono text-text-muted">Target files:</span>
            {activeMission.relevantFiles.map((f) => (
              <button
                key={f}
                onClick={() => handleSelectFile(f)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-accent-blue hover:border-accent-blue/40 transition-colors flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" />
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hints system */}
      <div className="rounded-xl border border-border bg-surface-elevated/20 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-body-xs font-semibold text-text-primary">
            <Lightbulb className="w-4 h-4 text-accent-amber" />
            <span>Investigation Hints</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {usedHintsCount} of {activeMission.hints.length} revealed
          </span>
        </div>

        {usedHintsCount === 0 ? (
          <p className="text-body-xs text-text-muted">
            Need guidance? Request progressive hints without losing accuracy points.
          </p>
        ) : (
          <div className="space-y-1.5">
            {activeMission.hints.slice(0, usedHintsCount).map((hint, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-surface-elevated text-body-xs text-text-secondary border border-border/60"
              >
                <span className="font-mono text-accent-amber font-semibold mr-1.5">
                  #{idx + 1}
                </span>
                {hint}
              </div>
            ))}
          </div>
        )}

        {usedHintsCount < activeMission.hints.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={requestNextHint}
            className="w-full text-accent-amber hover:bg-accent-amber/10 border border-accent-amber/20"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            <span>Unlock Next Hint ({activeMission.hints.length - usedHintsCount} left)</span>
          </Button>
        )}
      </div>

      {/* Pinned Evidence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-body-xs font-semibold text-text-primary">
            <Pin className="w-3.5 h-3.5 text-accent-amber" />
            <span>Pinned Code Citations</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {evidence.length} collected
          </span>
        </div>

        {evidence.length === 0 ? (
          <div className="p-3 text-center rounded-lg border border-dashed border-border text-body-xs text-text-muted">
            Pin lines from the Code Inspector to substantiate your answer.
          </div>
        ) : (
          <div className="space-y-2">
            {evidence.map((ev) => (
              <EvidenceCard
                key={ev.id}
                evidence={ev}
                onRemove={removeEvidence}
                onViewSource={handleSelectFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submission Feedback or Submit Form */}
      {feedback ? (
        <MissionFeedback
          feedback={feedback}
          onReset={resetFeedback}
          onNextMission={handleNextMission}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-mono text-text-secondary mb-1">
              Your Architectural Finding:
            </label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="e.g., src/server.ts is the main process entry point because it calls app.listen() on PORT..."
              rows={3}
              className="w-full p-2.5 rounded-lg bg-surface-elevated border border-border text-body-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 custom-scrollbar resize-none font-mono"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={!answerText.trim() && evidence.length === 0}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            <span>Submit Solution for Evaluation</span>
          </Button>
        </form>
      )}
    </div>
  );
}
