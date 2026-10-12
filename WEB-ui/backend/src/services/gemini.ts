import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config } from '../config.js';
import {
  MissionDetail,
  MissionFeedback,
  Repository,
  Citation,
} from '../types/index.js';

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (config.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
}

// Zod schema for generated missions
const GeneratedMissionsSchema = z.object({
  missions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['entry_point', 'route_location', 'error_handling']),
      objective: z.string().min(10),
      startingClue: z.string().min(10),
      hints: z.array(z.string()).min(2),
      relevantFiles: z.array(z.string()).min(1),
      order: z.number(),
    })
  ),
});

// Zod schema for answer evaluation
const GeneratedFeedbackSchema = z.object({
  correct: z.boolean(),
  partial: z.boolean(),
  feedback: z.string(),
  explanation: z.string(),
});

/**
 * Generate deterministic grounded missions when Gemini is unconfigured or unavailable
 */
export function generateDeterministicMissions(
  repository: Repository,
  indexedFiles: string[],
  fileSources: Map<string, string>
): MissionDetail[] {
  const normalized = indexedFiles.map((f) => f.replace(/\\/g, '/'));

  // 1. Find entry point
  const entryFiles = normalized.filter((f) => {
    const l = f.toLowerCase();
    return (
      l.endsWith('server.ts') ||
      l.endsWith('server.js') ||
      l.endsWith('index.ts') ||
      l.endsWith('index.js') ||
      l.endsWith('app.ts') ||
      l.endsWith('app.js') ||
      l.endsWith('main.ts') ||
      l.endsWith('main.js')
    );
  });
  const bestEntry = entryFiles[0] || normalized[0] || 'index.js';

  // 2. Find route / controller / API file
  const routeFiles = normalized.filter((f) => {
    const l = f.toLowerCase();
    return (
      l.includes('/routes/') ||
      l.includes('/controllers/') ||
      l.includes('/api/') ||
      l.includes('route') ||
      l.includes('controller')
    );
  });
  const bestRoute = routeFiles[0] || normalized[1] || bestEntry;

  // 3. Find error handler / middleware / model / validation file
  const errorOrValidationFiles = normalized.filter((f) => {
    const l = f.toLowerCase();
    return (
      l.includes('error') ||
      l.includes('middleware') ||
      l.includes('schema') ||
      l.includes('model') ||
      l.includes('validate')
    );
  });
  const bestError = errorOrValidationFiles[0] || normalized[2] || bestRoute;

  const missions: MissionDetail[] = [
    {
      id: 'mission-1',
      type: 'entry_point',
      objective: `Identify the main entry point or bootstrap file in ${repository.name}.`,
      startingClue: `Inspect the repository root or src/ directory for bootstrap modules (e.g. ${bestEntry}).`,
      hints: [
        `Look for files that configure runtime listeners, application bootstrapping, or process entry points.`,
        `Examine ${bestEntry} and check its imports and exported factory functions.`,
        `Verify whether ${bestEntry} binds to network ports or exports the top-level application instance.`,
      ],
      relevantFiles: [bestEntry],
      status: 'active',
      order: 1,
    },
    {
      id: 'mission-2',
      type: 'route_location',
      objective: `Locate the primary route or request-handling module in ${repository.name}.`,
      startingClue: `Explore HTTP endpoints or controller registrations (e.g. ${bestRoute}).`,
      hints: [
        `Check how requests are dispatched to routes or controllers.`,
        `Inspect ${bestRoute} to locate endpoint declarations and request payload handling.`,
      ],
      relevantFiles: [bestRoute],
      status: 'available',
      order: 2,
    },
    {
      id: 'mission-3',
      type: 'error_handling',
      objective: `Pinpoint how errors, exceptions, or input validations are handled in ${repository.name}.`,
      startingClue: `Look for middleware, centralized error catches, or schemas (e.g. ${bestError}).`,
      hints: [
        `Examine error propagation or validation schemas in ${bestError}.`,
        `Trace how unexpected exceptions or failed assertions are caught and formatted.`,
      ],
      relevantFiles: [bestError],
      status: 'locked',
      order: 3,
    },
  ];

  return missions;
}

/**
 * Generate missions using Gemini with ground-truth verification
 */
export async function generateRepositoryMissions(
  repository: Repository,
  indexedFiles: string[],
  fileSources: Map<string, string>
): Promise<MissionDetail[]> {
  // If no Gemini API key, use deterministic generator immediately
  if (!aiClient || !config.GEMINI_API_KEY) {
    return generateDeterministicMissions(repository, indexedFiles, fileSources);
  }

  try {
    // Construct structured manifest with real snippet previews
    const fileManifest = Array.from(fileSources.entries())
      .slice(0, 15)
      .map(([fPath, content]) => {
        const preview = content.slice(0, 500).replace(/\r\n/g, '\n');
        return `FILE: ${fPath}\nPREVIEW:\n${preview}\n---`;
      })
      .join('\n');

    const prompt = `You are a principal software forensic investigator creating codebase missions for ${repository.fullName}.
The indexed files in this repository are:
${indexedFiles.slice(0, 80).join('\n')}

Here are actual source snippets from the repository:
${fileManifest}

Generate exactly 3 progressive engineering missions:
1. type: "entry_point" - Discover the startup bootstrap / entry module.
2. type: "route_location" - Trace key route, controller, or endpoint declarations.
3. type: "error_handling" - Pinpoint centralized error handling, middleware, or validation.

CRITICAL CONSTRAINTS:
- Every file in "relevantFiles" MUST be an exact string from the indexed files listed above.
- Do NOT hallucinate filenames or directories.
- Return ONLY a JSON object matching this schema:
{
  "missions": [
    {
      "id": "mission-1",
      "type": "entry_point",
      "objective": "...",
      "startingClue": "...",
      "hints": ["hint 1", "hint 2", "hint 3"],
      "relevantFiles": ["path/to/existing/file"],
      "order": 1
    },
    ...
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: config.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || '';
    const parsedJson = JSON.parse(text);
    const validated = GeneratedMissionsSchema.parse(parsedJson);

    // Verify all relevantFiles against real indexed files
    const indexedSet = new Set(indexedFiles);
    const verifiedMissions: MissionDetail[] = validated.missions.map((m, idx) => {
      const filteredFiles = m.relevantFiles.filter((f) => indexedSet.has(f));
      const finalFiles = filteredFiles.length > 0 ? filteredFiles : [indexedFiles[0] || 'index.js'];

      return {
        ...m,
        relevantFiles: finalFiles,
        status: idx === 0 ? 'active' : idx === 1 ? 'available' : 'locked',
        order: idx + 1,
      };
    });

    return verifiedMissions;
  } catch (err) {
    console.warn('⚠️ Gemini mission generation failed, falling back to deterministic missions:', (err as Error).message);
    return generateDeterministicMissions(repository, indexedFiles, fileSources);
  }
}

/**
 * Evaluate user's mission submission deterministically first, then with Gemini
 */
export async function evaluateMissionSubmission(
  mission: MissionDetail,
  answer: string,
  evidenceFiles: string[],
  evidenceSnippets: string[],
  sourceFiles: Map<string, string>
): Promise<MissionFeedback> {
  const answerLower = answer.toLowerCase();
  const relevantFiles = mission.relevantFiles;

  // 1. Deterministic file target check
  const mentionedRelevantFile = relevantFiles.some((f) => {
    const baseName = f.split('/').pop()?.toLowerCase() || '';
    return (
      answerLower.includes(f.toLowerCase()) ||
      answerLower.includes(baseName) ||
      evidenceFiles.includes(f)
    );
  });

  // Extract real source snippet from ground truth for citations
  const targetPath = relevantFiles[0] || '';
  const targetContent = sourceFiles.get(targetPath) || '';
  const lines = targetContent.split('\n');
  const citationSnippet = lines.slice(0, Math.min(10, lines.length)).join('\n');

  const citations: Citation[] = targetPath
    ? [
        {
          id: `cit-${Date.now()}`,
          file: targetPath,
          lineStart: 1,
          lineEnd: Math.min(10, lines.length),
          snippet: citationSnippet || `// Reference in ${targetPath}`,
          reason: `Grounded reference in target file ${targetPath}`,
        },
      ]
    : [];

  // If answer does not mention any target file or evidence
  if (!mentionedRelevantFile && evidenceFiles.length === 0) {
    return {
      correct: false,
      partial: false,
      feedback: `The submitted finding did not reference the expected target files for this objective (${relevantFiles.join(', ')}).`,
      explanation: `Re-examine the architecture graph and investigate ${relevantFiles.join(', ')} to locate the target declarations.`,
      citations: [],
    };
  }

  // 2. Qualitative evaluation with Gemini if available
  if (aiClient && config.GEMINI_API_KEY && targetContent) {
    try {
      const evalPrompt = `You are evaluating a developer's codebase forensic mission answer.
Mission Objective: "${mission.objective}"
Target Expected Files: ${relevantFiles.join(', ')}
Target File Excerpt:
${targetContent.slice(0, 1200)}

User Answer: "${answer}"
Pinned Evidence Snippets:
${evidenceSnippets.join('\n')}

Evaluate the user's answer:
- correct: true if they accurately identified the relevant architectural mechanism.
- partial: true if they identified the file or related component but missed the specific mechanism.
- feedback: 1-2 sentence direct evaluation.
- explanation: Architectural reasoning referencing the target file.

Return ONLY a JSON object:
{
  "correct": boolean,
  "partial": boolean,
  "feedback": "string",
  "explanation": "string"
}`;

      const res = await aiClient.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: evalPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = GeneratedFeedbackSchema.parse(JSON.parse(res.text?.trim() || '{}'));
      return {
        correct: parsed.correct,
        partial: parsed.partial,
        feedback: parsed.feedback,
        explanation: parsed.explanation,
        citations,
      };
    } catch {
      // Fall through to deterministic evaluation
    }
  }

  // 3. Deterministic evaluation fallback
  if (mentionedRelevantFile) {
    return {
      correct: true,
      partial: false,
      feedback: `Accurate forensic identification! You successfully pinpointed ${relevantFiles.join(', ')}.`,
      explanation: `The identified source code contains the architectural declarations matching mission objective "${mission.objective}".`,
      citations,
    };
  }

  return {
    correct: false,
    partial: true,
    feedback: 'Your answer points in the right direction but lacks key evidence from the target file.',
    explanation: `Investigate ${relevantFiles.join(', ')} to substantiate your finding.`,
    citations: [],
  };
}
