import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RotateCcw } from 'lucide-react';
import { useInvestigationStore } from '../../store/useInvestigationStore';

export interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

type CoPilotRole = 'architect' | 'scout';

const ROLE_CONFIGS: Record<
  CoPilotRole,
  { label: string; model: string; instruction: string }
> = {
  architect: {
    label: 'Architecture Analyst (gemini-3.8-flash)',
    model: 'gemini-3.8-flash',
    instruction:
      'Focus on deep dependency analysis, blast radius impact, security boundaries, and architectural coupling across modules.',
  },
  scout: {
    label: 'Rapid Scout (gemini-3.1-flash-lite)',
    model: 'gemini-3.1-flash-lite',
    instruction:
      'Provide fast, direct 1-2 sentence pointers to relevant files, lines, and symbols without spoiling the final mission answer.',
  },
};

export const TacticalChatTab: React.FC = () => {
  const {
    repository,
    selectedFilePath,
    selectedFileDetails,
    missions,
    activeMissionId,
  } = useInvestigationStore();

  const activeMission = missions.find((m) => m.id === activeMissionId) || missions[0];

  const [selectedRole, setSelectedRole] = useState<CoPilotRole>('architect');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: 'Tactical Architecture Co-Pilot online. Ask me to trace imports, explain AST symbols in the active file, or analyze clues for the current mission.',
      timestamp: 'Ready',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildLocalFallbackReply = (prompt: string): string => {
    const q = prompt.toLowerCase();
    if (q.includes('sentinel') || q.includes('token') || q.includes('header')) {
      return `In \`src/services/AuthSentinel.ts\`, \`extractSessionToken()\` first checks the \`Authorization: Bearer\` header, and falls back to reading \`headers['x-sentinel-ticket']\` on line 43.`;
    }
    if (q.includes('gantry') || q.includes('blast') || q.includes('advisor')) {
      return `\`src/client/Gantry.Core.ts\` is the central ledger model with a critical blast radius (46 downstream files). Its primary consumer widget is \`src/components/Dashboard.Advisor.tsx\`.`;
    }
    if (q.includes('telemetry') || q.includes('stats')) {
      return `\`src/routes/telemetry.routes.ts\` exposes \`/stats\` via \`handleStatsRequest()\` without mounting the \`AuthSentinel\` verification middleware.`;
    }
    if (selectedFileDetails) {
      return `Inspecting \`${selectedFileDetails.path}\` (${selectedFileDetails.category}, ${selectedFileDetails.lines} lines). Exported functions: ${
        selectedFileDetails.ast?.functions?.join(', ') || 'none listed'
      }.`;
    }
    return `Active repository: ${repository?.fullName || 'DirishamKamesh/FacuLynk'}. Current mission objective: "${
      activeMission?.title || 'Architecture Investigation'
    }". Select a node on the canvas or ask about a specific file path.`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInput('');
    setIsSending(true);

    const roleConfig = ROLE_CONFIGS[selectedRole];
    const repoContext = [
      repository ? `Repository: ${repository.fullName} (${repository.branch})` : '',
      selectedFilePath ? `Selected File: ${selectedFilePath}` : '',
      selectedFileDetails?.ast?.functions
        ? `Selected File Functions: ${selectedFileDetails.ast.functions.join(', ')}`
        : '',
      activeMission
        ? `Active Mission: ${activeMission.title} — ${activeMission.objective}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          model: roleConfig.model,
          roleInstruction: roleConfig.instruction,
          repoContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply || buildLocalFallbackReply(trimmed),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: buildLocalFallbackReply(trimmed),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full select-none overflow-hidden">
      {/* Role Selector Bar */}
      <div
        className="p-3 border-b flex items-center justify-between gap-2 shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-cyan)] shrink-0" />
          <select
            aria-label="Select Co-Pilot Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as CoPilotRole)}
            className="text-xs font-mono bg-[var(--surface-elevated)] text-[var(--text-primary)] border rounded-md px-2 py-1 focus:outline-none focus:border-[var(--color-blue)] truncate"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <option value="architect">Architecture Analyst (Flash)</option>
            <option value="scout">Rapid Scout (Flash-Lite)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                role: 'model',
                text: 'Conversation reset. Ready to inspect repository architecture.',
                timestamp: 'Ready',
              },
            ])
          }
          title="Clear chat history"
          aria-label="Clear chat history"
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable Message Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 select-text">
        {messages.map((turn) => {
          const isUser = turn.role === 'user';
          return (
            <div
              key={turn.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[var(--text-muted)]">
                {isUser ? (
                  <>
                    <span>Investigator</span>
                    <User className="w-3 h-3 text-[var(--color-blue)]" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-[var(--color-cyan)]" />
                    <span>Co-Pilot</span>
                  </>
                )}
                <span>·</span>
                <span className="tabular-nums">{turn.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed border ${
                  isUser
                    ? 'bg-[var(--color-blue)] text-white border-transparent'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-primary)]'
                }`}
                style={!isUser ? { borderColor: 'var(--border-subtle)' } : undefined}
              >
                {turn.text}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="text-xs font-mono text-[var(--color-cyan)] animate-pulse px-1">
            Analyzing AST & repository context...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t flex items-center gap-2 shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <input
          type="text"
          aria-label="Ask the Architecture Co-Pilot"
          placeholder="Ask about dependencies or clues..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-mono bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-blue)]"
        />
        <button
          type="submit"
          aria-label="Send chat message"
          disabled={!input.trim() || isSending}
          className="p-2 rounded-lg text-white bg-[var(--color-blue)] hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
