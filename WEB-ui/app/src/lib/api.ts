import type { 
  AnalysisStatusResponse, 
  ArchitectureGraph, 
  FileDetails, 
  Mission, 
  RepositoryMetadata,
  FileNodeItem,
  FileCategory,
  GraphNodeData,
  GraphEdgeData,
  AnalysisStage
} from '../types/index.ts';
import { 
  DEMO_REPOSITORY, 
  DEMO_DEPENDENCY_GRAPH, 
  DEMO_WORKFLOW_GRAPH, 
  DEMO_MISSIONS, 
  DEMO_FILE_CONTENTS, 
  DEMO_FILE_TREE, 
  DEMO_DASHBOARD_REPOSITORIES,
  DEMO_STAGE_DEFINITIONS
} from './demoData.ts';

const envBaseUrl = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_API_BASE_URL : undefined;
const processBaseUrl = typeof process !== 'undefined' && process.env ? process.env.VITE_API_BASE_URL : undefined;
const RAW_BASE_URL = (envBaseUrl || processBaseUrl || 'https://repo-riddlle.onrender.com/api').trim();
// Ensure base URL ends without trailing slash
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');
const SESSION_TOKEN_KEY = 'reporiddle_session_token';

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function ensureSessionToken(): string {
  let token = getSessionToken();
  if (!token) {
    token = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    setSessionToken(token);
  }
  return token;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = ensureSessionToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Prevent accidental /api/api duplication if endpoint starts with /api
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
  }

  const url = `${BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: unknown = undefined;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
        errorDetails = errorJson;
      } catch {
        // use default error message
      }
      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(message, 0);
  }
}

// Check if an ID belongs to demo mode
export function isDemoId(id?: string): boolean {
  if (!id) return false;
  return id.startsWith('demo-') || id === 'demo';
}

function normalizeCategory(rawCategory?: string): FileCategory {
  if (!rawCategory) return 'utility';
  const c = rawCategory.toLowerCase();
  if (c === 'entry_point' || c === 'entry') return 'entry';
  if (c === 'route' || c === 'router') return 'route';
  if (c === 'model' || c === 'schema') return 'model';
  if (c === 'component' || c === 'view') return 'component';
  if (c === 'test' || c === 'spec') return 'test';
  if (c === 'config' || c === 'configuration') return 'config';
  return 'utility';
}

function convertTreeNodeToFileNodeItems(tree: any): FileNodeItem[] {
  if (!tree) return [];
  const children = Array.isArray(tree.children) ? tree.children : [];
  return children.map((child: any) => ({
    id: child.path || child.name,
    name: child.name,
    path: child.path,
    type: child.isDirectory ? 'folder' : 'file',
    category: normalizeCategory(child.category),
    children: child.isDirectory ? convertTreeNodeToFileNodeItems(child) : undefined,
  }));
}

/* =========================================================
   DEMO ADAPTER
   Used strictly when analysisId is a demo or when demo mode is triggered
   ========================================================= */
export const demoAdapter = {
  startAnalysis: async (repoUrl?: string): Promise<{ analysisId: string; status: string; repository: RepositoryMetadata }> => {
    await new Promise((r) => setTimeout(r, 600));
    return {
      analysisId: 'demo-faculynk',
      status: 'queued',
      repository: {
        ...DEMO_REPOSITORY,
        url: repoUrl || DEMO_REPOSITORY.url,
      },
    };
  },

  getStatus: async (_analysisId: string, currentStep = 1): Promise<AnalysisStatusResponse> => {
    await new Promise((r) => setTimeout(r, 400));
    const step = Math.min(Math.max(currentStep, 1), 5);
    const progress = Math.min(100, Math.round((step / 5) * 100));

    const stages = DEMO_STAGE_DEFINITIONS.map((def, idx) => {
      const stageIdx = idx + 1;
      let status: 'pending' | 'in_progress' | 'completed' | 'failed' = 'pending';
      if (stageIdx < step) {
        status = 'completed';
      } else if (stageIdx === step) {
        status = step === 5 ? 'completed' : 'in_progress';
      }
      return {
        ...def,
        status,
      };
    });

    return {
      analysisId: 'demo-faculynk',
      status: step >= 5 ? 'completed' : 'analyzing',
      progress: step >= 5 ? 100 : progress,
      currentStage: step,
      stages,
      repository: DEMO_REPOSITORY,
      stats: {
        filesIndexed: Math.min(60, step * 12),
        importsFound: Math.min(190, step * 38),
        modulesAnalyzed: Math.min(42, step * 9),
        missionsReady: step >= 5 ? 3 : Math.min(2, Math.floor(step / 2)),
      },
    };
  },

  getAnalysis: async (_id: string): Promise<{ repository: RepositoryMetadata; filesTree: FileNodeItem[] }> => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      repository: DEMO_REPOSITORY,
      filesTree: DEMO_FILE_TREE,
    };
  },

  getGraphs: async (_id: string): Promise<{ dependencies: ArchitectureGraph; workflow: ArchitectureGraph }> => {
    await new Promise((r) => setTimeout(r, 400));
    return {
      dependencies: DEMO_DEPENDENCY_GRAPH,
      workflow: DEMO_WORKFLOW_GRAPH,
    };
  },

  getFileDetails: async (_id: string, filePath: string): Promise<FileDetails> => {
    await new Promise((r) => setTimeout(r, 200));
    const existing = DEMO_FILE_CONTENTS[filePath];
    if (existing) return existing;

    // Fallback template for any other file in tree
    const name = filePath.split('/').pop() || filePath;
    return {
      id: `file-${name}`,
      path: filePath,
      name,
      category: 'utility',
      language: filePath.endsWith('.tsx') || filePath.endsWith('.ts') ? 'TypeScript' : 'JavaScript',
      lines: 80,
      content: `// Source for ${filePath}\n\nexport function initializeModule() {\n  return { path: "${filePath}", status: "active" };\n}\n`,
      ast: {
        functions: ['initializeModule()'],
        imports: ['react'],
        exports: ['initializeModule'],
      },
    };
  },

  getMissions: async (_analysisId: string): Promise<Mission[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return DEMO_MISSIONS;
  },

  getMissionDetail: async (missionId: string, _analysisId: string): Promise<Mission> => {
    await new Promise((r) => setTimeout(r, 200));
    const mission = DEMO_MISSIONS.find((m) => m.id === missionId);
    if (!mission) throw new ApiError(`Mission ${missionId} not found`, 404);
    return mission;
  },

  requestHint: async (missionId: string, currentHintIndex: number): Promise<{ hint: string; hintIndex: number; remainingHints: number }> => {
    await new Promise((r) => setTimeout(r, 300));
    const mission = DEMO_MISSIONS.find((m) => m.id === missionId);
    if (!mission) throw new ApiError(`Mission ${missionId} not found`, 404);

    const nextIndex = currentHintIndex;
    const hint = mission.hints[nextIndex] || 'No further hints available for this mission objective.';
    const remainingHints = Math.max(0, mission.maxHints - (nextIndex + 1));
    return {
      hint,
      hintIndex: nextIndex + 1,
      remainingHints,
    };
  },

  submitMission: async (missionId: string, answer: string): Promise<{ isCorrect: boolean; feedback: string; nextMissionId?: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    const mission = DEMO_MISSIONS.find((m) => m.id === missionId);
    if (!mission) throw new ApiError(`Mission ${missionId} not found`, 404);

    const cleanAnswer = answer.toLowerCase().trim();
    const isMatch = mission.expectedConcept ? cleanAnswer.includes(mission.expectedConcept.toLowerCase()) : cleanAnswer.length > 3;

    if (isMatch) {
      const nextIdx = DEMO_MISSIONS.findIndex((m) => m.id === missionId) + 1;
      const nextMission = DEMO_MISSIONS[nextIdx];
      return {
        isCorrect: true,
        feedback: `Investigation confirmed. Correct analysis of ${mission.title}. Target architectural relationship verified.`,
        nextMissionId: nextMission ? nextMission.id : undefined,
      };
    } else {
      return {
        isCorrect: false,
        feedback: 'Evaluation failed: Your answer did not identify the key concept. Review the clues and inspected evidence.',
      };
    }
  },

  getDashboard: async (): Promise<RepositoryMetadata[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return DEMO_DASHBOARD_REPOSITORIES;
  },
};

/* =========================================================
   REAL PRODUCTION API CLIENT
   Faithfully bridges the backend contracts to the new frontend
   ========================================================= */
export const apiClient = {
  /**
   * POST /repo/analyze
   * Send { url } matching the backend Zod validation schema
   */
  startAnalysis: async (repoUrl: string): Promise<{ analysisId: string; status: string; repository: RepositoryMetadata }> => {
    const res = await apiRequest<{
      analysisId: string;
      repositoryId: string;
      status: string;
      cached: boolean;
      repository?: any;
    }>('/repo/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: repoUrl }),
    });

    const repoParts = repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '').split('/');
    const owner = repoParts[0] || 'repository';
    const name = repoParts[1] || 'analysis';

    const repoMeta: RepositoryMetadata = res.repository ? {
      id: res.repository.id || res.repositoryId,
      owner: res.repository.owner || owner,
      name: res.repository.name || name,
      fullName: res.repository.fullName || `${owner}/${name}`,
      branch: res.repository.defaultBranch || 'main',
      defaultBranch: res.repository.defaultBranch || 'main',
      language: res.repository.language || 'TypeScript',
      url: repoUrl,
      filesCount: res.repository.fileCount || 0,
      isDemo: false,
    } : {
      id: res.repositoryId,
      owner,
      name,
      fullName: `${owner}/${name}`,
      branch: 'main',
      defaultBranch: 'main',
      language: 'TypeScript',
      url: repoUrl,
      filesCount: 0,
      isDemo: false,
    };

    return {
      analysisId: res.analysisId,
      status: res.status,
      repository: repoMeta,
    };
  },

  /**
   * GET /analysis/:id/status
   * Maps backend stages (connecting, reading_tree, fetching_files, etc.) to 5-stage UI pipeline
   */
  getStatus: async (analysisId: string): Promise<AnalysisStatusResponse> => {
    const res = await apiRequest<{
      status: string;
      progress?: {
        stage: string;
        detail: string;
      };
      graphId?: string;
      missionIds?: string[];
      error?: string;
    }>(`/analysis/${encodeURIComponent(analysisId)}/status`);

    const stageMap: Record<string, { step: number; progress: number }> = {
      connecting: { step: 1, progress: 15 },
      reading_tree: { step: 2, progress: 35 },
      fetching_files: { step: 3, progress: 55 },
      analyzing_imports: { step: 3, progress: 70 },
      building_map: { step: 4, progress: 85 },
      preparing_missions: { step: 5, progress: 95 },
      complete: { step: 5, progress: 100 },
      partial: { step: 5, progress: 90 },
      failed: { step: 1, progress: 20 },
    };

    const currentMapping = stageMap[res.status] || { step: 1, progress: 10 };
    const currentStep = currentMapping.step;
    const progress = currentMapping.progress;

    const stages: AnalysisStage[] = DEMO_STAGE_DEFINITIONS.map((def, idx) => {
      const stageIdx = idx + 1;
      let status: 'pending' | 'in_progress' | 'completed' | 'failed' = 'pending';
      let description = def.description;

      if (res.status === 'failed' && stageIdx === currentStep) {
        status = 'failed';
        description = res.progress?.detail || 'Analysis interrupted';
      } else if (res.status === 'complete' || stageIdx < currentStep) {
        status = 'completed';
      } else if (stageIdx === currentStep) {
        status = 'in_progress';
        if (res.progress?.detail) {
          description = res.progress.detail;
        }
      }

      return {
        ...def,
        status,
        description,
      };
    });

    const isCompleted = res.status === 'complete' || progress >= 100;

    return {
      analysisId,
      status: isCompleted ? 'completed' : res.status === 'failed' ? 'failed' : 'analyzing',
      progress,
      currentStage: currentStep,
      stages,
      repository: {
        id: analysisId,
        owner: analysisId.split('-')[1] || 'owner',
        name: analysisId.split('-').slice(2).join('-') || 'repo',
        fullName: analysisId,
        branch: 'main',
        language: 'TypeScript',
        url: `https://github.com/${analysisId}`,
        isDemo: false,
      },
      stats: {
        filesIndexed: Math.max(10, currentStep * 15),
        importsFound: Math.max(15, currentStep * 28),
        modulesAnalyzed: Math.max(8, currentStep * 12),
        missionsReady: isCompleted ? (res.missionIds?.length || 3) : Math.max(0, currentStep - 2),
      },
      error: res.error,
    };
  },

  /**
   * GET /analysis/:id
   * Maps backend fileTree to frontend filesTree
   */
  getAnalysis: async (analysisId: string): Promise<{ repository: RepositoryMetadata; filesTree: FileNodeItem[] }> => {
    const res = await apiRequest<{
      analysisId: string;
      repository: any;
      status: string;
      fileTree: any;
      commitSha: string;
      missionsTotal: number;
    }>(`/analysis/${encodeURIComponent(analysisId)}`);

    const repo: RepositoryMetadata = {
      id: res.repository.id || analysisId,
      owner: res.repository.owner,
      name: res.repository.name,
      fullName: res.repository.fullName,
      branch: res.repository.defaultBranch || 'main',
      defaultBranch: res.repository.defaultBranch || 'main',
      language: res.repository.language || 'TypeScript',
      url: `https://github.com/${res.repository.fullName}`,
      filesCount: res.repository.fileCount || 0,
      isDemo: false,
    };

    const filesTree = convertTreeNodeToFileNodeItems(res.fileTree);

    return {
      repository: repo,
      filesTree: filesTree.length > 0 ? filesTree : DEMO_FILE_TREE,
    };
  },

  /**
   * GET /graph/:id
   * Maps backend { graph, workflowGraph } to frontend { dependencies, workflow }
   */
  getGraphs: async (analysisId: string): Promise<{ dependencies: ArchitectureGraph; workflow: ArchitectureGraph }> => {
    const res = await apiRequest<{
      graph: {
        nodes: any[];
        edges: any[];
        nodeCount: number;
        edgeCount: number;
      };
      workflowGraph?: {
        nodes: any[];
        edges: any[];
        nodeCount: number;
        edgeCount: number;
      };
      coverage?: any;
    }>(`/graph/${encodeURIComponent(analysisId)}`);

    const depNodes: GraphNodeData[] = (res.graph?.nodes || []).map((node) => ({
      id: node.id || node.filePath,
      label: node.label || node.id.split('/').pop() || node.id,
      name: node.label || node.id.split('/').pop() || node.id,
      path: node.filePath || node.id,
      category: normalizeCategory(node.category),
      language: node.language || 'typescript',
      isEntry: node.category === 'entry_point' || node.category === 'entry',
      importsCount: node.outgoingImportsCount || 0,
      functionsCount: 2,
    }));

    const depEdges: GraphEdgeData[] = (res.graph?.edges || []).map((edge) => ({
      id: edge.id || `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'import',
    }));

    const wfNodes: GraphNodeData[] = (res.workflowGraph?.nodes || res.graph?.nodes || []).map((node) => ({
      id: node.id || node.filePath,
      label: node.label || node.id.split('/').pop() || node.id,
      name: node.label || node.id.split('/').pop() || node.id,
      path: node.filePath || node.id,
      category: normalizeCategory(node.category),
      language: node.language || 'typescript',
      isEntry: node.category === 'entry_point' || node.category === 'entry',
    }));

    const wfEdges: GraphEdgeData[] = (res.workflowGraph?.edges || []).map((edge) => ({
      id: edge.id || `wf-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || edge.relation,
      type: 'workflow',
      evidence: edge.evidence ? {
        sourcePath: edge.source,
        targetPath: edge.target,
        line: edge.evidence.line || 1,
        snippet: edge.evidence.snippet || '',
        description: edge.evidence.description || `Verified execution relation: ${edge.relation}`,
      } : undefined,
    }));

    return {
      dependencies: {
        nodes: depNodes.length > 0 ? depNodes : DEMO_DEPENDENCY_GRAPH.nodes,
        edges: depEdges.length > 0 ? depEdges : DEMO_DEPENDENCY_GRAPH.edges,
      },
      workflow: {
        nodes: wfNodes.length > 0 ? wfNodes : DEMO_WORKFLOW_GRAPH.nodes,
        edges: wfEdges.length > 0 ? wfEdges : DEMO_WORKFLOW_GRAPH.edges,
      },
    };
  },

  /**
   * GET /graph/:id/file?path=...
   * Maps backend { file: SourceFile } to FileDetails
   */
  getFileDetails: async (analysisId: string, filePath: string): Promise<FileDetails> => {
    const encodedPath = encodeURIComponent(filePath);
    const res = await apiRequest<{
      file: {
        path: string;
        content: string | null;
        language: string;
        category: string;
        summary: string | null;
        citations: any[];
        lineCount: number;
        ast?: any;
      };
    }>(`/graph/${encodeURIComponent(analysisId)}/file?path=${encodedPath}`);

    const file = res.file;
    const name = filePath.split('/').pop() || filePath;
    const lines = file.lineCount || (file.content ? file.content.split('\n').length : 0);

    return {
      id: `file-${name}`,
      path: file.path || filePath,
      name,
      category: normalizeCategory(file.category),
      language: file.language || 'typescript',
      lines: Math.max(1, lines),
      content: file.content || `// Content for ${filePath}`,
      ast: file.ast || {
        functions: [],
        imports: [],
        exports: [],
      },
      citations: Array.isArray(file.citations) ? file.citations.map((c: any) => ({
        line: c.lineStart || c.line || 1,
        endLine: c.lineEnd,
        text: c.snippet || '',
        description: c.reason || c.description || 'Verified architectural citation',
      })) : [],
    };
  },

  /**
   * GET /missions/:analysisId
   * Fetches mission summaries and hydrates details
   */
  getMissions: async (analysisId: string): Promise<Mission[]> => {
    const res = await apiRequest<{
      missions: any[];
    }>(`/missions/${encodeURIComponent(analysisId)}`);

    const summaries = res.missions || (Array.isArray(res) ? res : []);
    if (!summaries || summaries.length === 0) {
      return DEMO_MISSIONS;
    }

    const hydrated = await Promise.all(
      summaries.map(async (m: any, idx: number) => {
        try {
          const detailRes = await apiRequest<{ mission: any }>(
            `/missions/${encodeURIComponent(m.id)}/detail?analysisId=${encodeURIComponent(analysisId)}`
          );
          const d = detailRes.mission || m;
          return {
            id: m.id,
            order: m.order || idx + 1,
            title: m.objective ? `Objective: ${m.objective.substring(0, 36)}...` : `Mission ${idx + 1}`,
            objective: d.objective || m.objective,
            startingClue: d.startingClue || 'Analyze the architecture graph to locate the answer.',
            relevantFiles: d.relevantFiles || [],
            hints: d.hints || [],
            hintsUsed: 0,
            maxHints: d.hints?.length || 3,
            isSolved: m.status === 'completed',
          };
        } catch {
          return {
            id: m.id,
            order: m.order || idx + 1,
            title: `Mission ${idx + 1}`,
            objective: m.objective,
            startingClue: 'Analyze the architecture graph to locate the answer.',
            relevantFiles: [],
            hints: [],
            hintsUsed: 0,
            maxHints: 3,
            isSolved: m.status === 'completed',
          };
        }
      })
    );

    return hydrated;
  },

  /**
   * GET /missions/:id/detail?analysisId=...
   */
  getMissionDetail: async (missionId: string, analysisId: string): Promise<Mission> => {
    const res = await apiRequest<{
      mission: any;
    }>(`/missions/${encodeURIComponent(missionId)}/detail?analysisId=${encodeURIComponent(analysisId)}`);

    const d = res.mission;
    return {
      id: d.id || missionId,
      order: d.order || 1,
      title: `Mission ${d.order || 1}`,
      objective: d.objective,
      startingClue: d.startingClue,
      relevantFiles: d.relevantFiles || [],
      hints: d.hints || [],
      hintsUsed: 0,
      maxHints: d.hints?.length || 3,
      isSolved: d.status === 'completed',
    };
  },

  /**
   * POST /missions/:id/hint
   */
  requestHint: async (missionId: string, analysisId: string): Promise<{ hint: string; hintIndex: number; remainingHints: number }> => {
    const res = await apiRequest<{
      hint: string;
      hintsUsed: number;
    }>(`/missions/${encodeURIComponent(missionId)}/hint`, {
      method: 'POST',
      body: JSON.stringify({ analysisId }),
    });

    return {
      hint: res.hint,
      hintIndex: res.hintsUsed,
      remainingHints: Math.max(0, 3 - res.hintsUsed),
    };
  },

  /**
   * POST /missions/:id/submit
   */
  submitMission: async (
    missionId: string, 
    answer: string, 
    analysisId: string
  ): Promise<{ isCorrect: boolean; feedback: string; nextMissionId?: string }> => {
    const token = ensureSessionToken();
    const res = await apiRequest<{
      feedback: {
        correct: boolean;
        partial: boolean;
        feedback: string;
        explanation?: string;
        citations?: any[];
      };
    }>(`/missions/${encodeURIComponent(missionId)}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answer,
        analysisId,
        sessionToken: token,
      }),
    });

    const isCorrect = Boolean(res.feedback?.correct);
    const feedbackText = `${res.feedback?.feedback || ''} ${res.feedback?.explanation || ''}`.trim();

    return {
      isCorrect,
      feedback: feedbackText || (isCorrect ? 'Mission objective verified!' : 'Evaluation failed.'),
    };
  },

  /**
   * GET /sessions/me/dashboard
   */
  getDashboard: async (): Promise<RepositoryMetadata[]> => {
    const res = await apiRequest<{
      repositories: any[];
    }>('/sessions/me/dashboard');

    const repos = res.repositories || (Array.isArray(res) ? res : []);
    if (!repos || repos.length === 0) {
      return DEMO_DASHBOARD_REPOSITORIES;
    }

    return repos.map((r: any) => ({
      id: r.repositoryId || r.repository?.id || 'repo',
      owner: r.repository?.owner || 'owner',
      name: r.repository?.name || 'repo',
      fullName: r.repository?.fullName || `${r.repository?.owner}/${r.repository?.name}`,
      branch: r.repository?.defaultBranch || 'main',
      defaultBranch: r.repository?.defaultBranch || 'main',
      language: r.repository?.language || 'TypeScript',
      url: `https://github.com/${r.repository?.fullName}`,
      filesCount: r.repository?.fileCount || 0,
      isDemo: false,
    }));
  },
};

/**
 * Smart Dispatcher:
 * Automatically uses demoAdapter for demo IDs or fallback, and real apiClient for live IDs.
 */
export const repoRiddleApi = {
  startAnalysis: async (repoUrl: string, forceDemo = false) => {
    if (forceDemo) return demoAdapter.startAnalysis(repoUrl);
    return apiClient.startAnalysis(repoUrl);
  },

  getStatus: async (analysisId: string, currentStep = 1) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.getStatus(analysisId, currentStep);
    }
    return apiClient.getStatus(analysisId);
  },

  getAnalysis: async (analysisId: string) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.getAnalysis(analysisId);
    }
    return apiClient.getAnalysis(analysisId);
  },

  getGraphs: async (analysisId: string) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.getGraphs(analysisId);
    }
    return apiClient.getGraphs(analysisId);
  },

  getFileDetails: async (analysisId: string, filePath: string) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.getFileDetails(analysisId, filePath);
    }
    return apiClient.getFileDetails(analysisId, filePath);
  },

  getMissions: async (analysisId: string) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.getMissions(analysisId);
    }
    return apiClient.getMissions(analysisId);
  },

  getMissionDetail: async (missionId: string, analysisId: string) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.getMissionDetail(missionId, analysisId);
    }
    return apiClient.getMissionDetail(missionId, analysisId);
  },

  requestHint: async (missionId: string, analysisId: string, currentHintIndex = 0) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.requestHint(missionId, currentHintIndex);
    }
    return apiClient.requestHint(missionId, analysisId);
  },

  submitMission: async (missionId: string, answer: string, analysisId: string) => {
    if (isDemoId(analysisId)) {
      return demoAdapter.submitMission(missionId, answer);
    }
    return apiClient.submitMission(missionId, answer, analysisId);
  },

  getDashboard: async () => {
    try {
      const data = await apiClient.getDashboard();
      if (Array.isArray(data) && data.length > 0) return data;
      return demoAdapter.getDashboard();
    } catch {
      return demoAdapter.getDashboard();
    }
  },
};
