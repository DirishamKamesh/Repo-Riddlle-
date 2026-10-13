import { create } from 'zustand';
import {
  Repository,
  GraphData,
  FileTreeNode,
  SourceFile,
  MissionDetail,
  MissionSummary,
  Evidence,
  MissionFeedback,
  FileCategory,
  WorkflowGraphData,
} from '../types';
import { DEMO_REPOSITORY } from '../mock/repository';
import { DEMO_FILE_TREE } from '../mock/file-tree';
import { DEMO_GRAPH_DATA, DEMO_WORKFLOW_GRAPH_DATA } from '../mock/graph-data';
import {
  DEMO_MISSIONS,
  DEMO_MISSION_SUMMARIES,
  MISSION_EVALUATION_RULES,
} from '../mock/missions';
import { DEMO_SOURCE_FILES } from '../mock/source-files';
import { getApiClient } from '../api';

interface InvestigationState {
  currentRepoId: string;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  repository: Repository | null;
  fileTree: FileTreeNode | null;
  graphData: GraphData | null;
  workflowGraphData: WorkflowGraphData | null;
  graphViewMode: 'dependency' | 'workflow';
  selectedFilePath: string | null;
  selectedFileContent: SourceFile | null;
  fileContentCache: Record<string, SourceFile>;

  missions: MissionSummary[];
  activeMissionId: string | null;
  activeMission: MissionDetail | null;

  evidence: Evidence[];
  feedback: MissionFeedback | null;
  usedHintsCount: number;

  filterCategory: FileCategory | null;
  searchFilter: string;

  // Actions
  loadRepository: (id?: string) => Promise<void>;
  loadDemoRepository: () => void;
  selectFile: (filePath: string) => Promise<void> | void;
  clearSelectedFile: () => void;
  setActiveMission: (missionId: string) => Promise<void> | void;
  requestNextHint: () => Promise<void> | void;
  addEvidence: (evidence: Omit<Evidence, 'id'>) => void;
  removeEvidence: (id: string) => void;
  submitMissionAnswer: (answer: string) => Promise<void> | void;
  resetFeedback: () => void;
  setCategoryFilter: (category: FileCategory | null) => void;
  setSearchFilter: (query: string) => void;
  setGraphViewMode: (mode: 'dependency' | 'workflow') => void;
}

export const useInvestigationStore = create<InvestigationState>((set, get) => ({
  currentRepoId: 'demo-task-api',
  isLoading: false,
  isSubmitting: false,
  error: null,

  repository: DEMO_REPOSITORY,
  fileTree: DEMO_FILE_TREE,
  graphData: DEMO_GRAPH_DATA,
  workflowGraphData: DEMO_WORKFLOW_GRAPH_DATA,
  graphViewMode: 'dependency',
  selectedFilePath: 'src/server.ts',
  selectedFileContent: DEMO_SOURCE_FILES['src/server.ts'] || null,
  fileContentCache: { ...DEMO_SOURCE_FILES },

  missions: DEMO_MISSION_SUMMARIES,
  activeMissionId: 'mission-1',
  activeMission: DEMO_MISSIONS.find((m) => m.id === 'mission-1') || null,

  evidence: [],
  feedback: null,
  usedHintsCount: 0,

  filterCategory: null,
  searchFilter: '',

  loadDemoRepository: () => {
    set({
      currentRepoId: 'demo-task-api',
      isLoading: false,
      error: null,
      repository: DEMO_REPOSITORY,
      fileTree: DEMO_FILE_TREE,
      graphData: DEMO_GRAPH_DATA,
      workflowGraphData: DEMO_WORKFLOW_GRAPH_DATA,
      graphViewMode: 'dependency',
      selectedFilePath: 'src/server.ts',
      selectedFileContent: DEMO_SOURCE_FILES['src/server.ts'] || null,
      fileContentCache: { ...DEMO_SOURCE_FILES },
      missions: DEMO_MISSION_SUMMARIES,
      activeMissionId: 'mission-1',
      activeMission: DEMO_MISSIONS[0],
      evidence: [],
      feedback: null,
      usedHintsCount: 0,
      filterCategory: null,
      searchFilter: '',
    });
  },

  loadRepository: async (id?: string) => {
    if (!id || id === 'demo' || id === 'demo-task-api') {
      get().loadDemoRepository();
      return;
    }

    set({ isLoading: true, error: null, currentRepoId: id });

    try {
      const client = getApiClient(id);
      const [analysisRes, graphRes, missionsRes] = await Promise.all([
        client.getAnalysis(id),
        client.getGraph(id),
        client.getMissions(id),
      ]);

      let activeMission: MissionDetail | null = null;
      let activeMissionId: string | null = null;

      if (missionsRes && missionsRes.length > 0) {
        activeMissionId = missionsRes[0].id;
        try {
          activeMission = await client.getMissionDetail(activeMissionId, id);
        } catch {
          activeMission = {
            id: missionsRes[0].id,
            type: missionsRes[0].type,
            objective: missionsRes[0].objective,
            startingClue: 'Analyze the repository graph and source files to begin investigation.',
            hints: [],
            relevantFiles: [],
            status: missionsRes[0].status,
          };
        }
      }

      // Pick default entry point file, first graph node, or first file tree leaf
      let initialFilePath: string | null = null;
      if (graphRes.graph.nodes && graphRes.graph.nodes.length > 0) {
        const entryNode = graphRes.graph.nodes.find((n) => n.category === 'entry_point');
        initialFilePath = entryNode ? entryNode.filePath : graphRes.graph.nodes[0].filePath;
      } else if (analysisRes.fileTree) {
        const findFirstLeaf = (node: FileTreeNode): string | null => {
          if (!node.isDirectory && node.path) return node.path;
          if (node.children) {
            for (const child of node.children) {
              const res = findFirstLeaf(child);
              if (res) return res;
            }
          }
          return null;
        };
        initialFilePath = findFirstLeaf(analysisRes.fileTree);
      }

      const cache: Record<string, SourceFile> = {};
      let initialContent: SourceFile | null = null;

      if (initialFilePath) {
        try {
          initialContent = await client.getSourceFile(id, initialFilePath);
          cache[initialFilePath] = initialContent;
        } catch (fetchErr) {
          console.warn('Could not fetch initial file content:', fetchErr);
        }
      }

      set({
        isLoading: false,
        error: null,
        currentRepoId: id,
        repository: analysisRes.repository,
        fileTree: analysisRes.fileTree,
        graphData: graphRes.graph,
        workflowGraphData: graphRes.workflowGraph || null,
        missions: missionsRes,
        activeMissionId,
        activeMission,
        selectedFilePath: initialFilePath,
        selectedFileContent: initialContent,
        fileContentCache: cache,
        evidence: [],
        feedback: null,
        usedHintsCount: 0,
      });
    } catch (err: any) {
      console.error('Failed to load investigation repository:', err);
      set({
        isLoading: false,
        error: err.message || 'Failed to load repository investigation',
      });
    }
  },

  selectFile: (filePath: string) => {
    const { currentRepoId, fileContentCache } = get();

    // If already in memory cache
    if (fileContentCache[filePath]) {
      set({
        selectedFilePath: filePath,
        selectedFileContent: fileContentCache[filePath],
      });
      return;
    }

    const isDemo =
      !currentRepoId || currentRepoId === 'demo' || currentRepoId === 'demo-task-api';

    if (isDemo) {
      const content = DEMO_SOURCE_FILES[filePath] || {
        path: filePath,
        language: filePath.endsWith('.json')
          ? 'json'
          : filePath.endsWith('.md')
            ? 'markdown'
            : 'typescript',
        category: 'unknown' as const,
        summary: `File view for ${filePath}`,
        lineCount: 1,
        citations: [],
        content: `// Source for ${filePath}\n// Fetched via RepoRiddle mock provider\n`,
      };
      set({
        selectedFilePath: filePath,
        selectedFileContent: content,
      });
      return;
    }

    // Real API fetch
    const client = getApiClient(currentRepoId);
    set({ selectedFilePath: filePath });

    client
      .getSourceFile(currentRepoId, filePath)
      .then((file) => {
        set((state) => ({
          selectedFileContent: file,
          fileContentCache: {
            ...state.fileContentCache,
            [filePath]: file,
          },
        }));
      })
      .catch((err) => {
        const errorContent: SourceFile = {
          path: filePath,
          language: filePath.endsWith('.json')
            ? 'json'
            : filePath.endsWith('.md')
              ? 'markdown'
              : 'typescript',
          category: 'unknown',
          summary: `Unable to load source code for ${filePath}`,
          lineCount: 3,
          citations: [],
          content: `// Error loading file from GitHub:\n// ${err.message}\n`,
        };
        set({
          selectedFileContent: errorContent,
        });
      });
  },

  clearSelectedFile: () => {
    set({
      selectedFilePath: null,
      selectedFileContent: null,
    });
  },

  setActiveMission: (missionId: string) => {
    const { currentRepoId } = get();
    const isDemo =
      !currentRepoId || currentRepoId === 'demo' || currentRepoId === 'demo-task-api';

    if (isDemo) {
      const detail = DEMO_MISSIONS.find((m) => m.id === missionId) || null;
      set({
        activeMissionId: missionId,
        activeMission: detail,
        usedHintsCount: 0,
        feedback: null,
        evidence: [],
      });
      return;
    }

    set({
      activeMissionId: missionId,
      usedHintsCount: 0,
      feedback: null,
      evidence: [],
    });

    const client = getApiClient(currentRepoId);
    client
      .getMissionDetail(missionId, currentRepoId)
      .then((detail) => {
        set({ activeMission: detail });
      })
      .catch((err) => {
        console.warn('Could not load mission detail:', err);
      });
  },

  requestNextHint: () => {
    const { currentRepoId, activeMission, activeMissionId, usedHintsCount } = get();
    if (!activeMission || !activeMissionId) return;

    const isDemo =
      !currentRepoId || currentRepoId === 'demo' || currentRepoId === 'demo-task-api';

    if (isDemo) {
      if (usedHintsCount < activeMission.hints.length) {
        set({ usedHintsCount: usedHintsCount + 1 });
      }
      return;
    }

    const client = getApiClient(currentRepoId);
    client
      .requestHint(activeMissionId, currentRepoId)
      .then((hintRes) => {
        set((state) => {
          if (!state.activeMission) return state;
          const currentHints = state.activeMission.hints || [];
          const updatedHints = currentHints.includes(hintRes.hint)
            ? currentHints
            : [...currentHints, hintRes.hint];
          return {
            usedHintsCount: hintRes.hintsUsed,
            activeMission: {
              ...state.activeMission,
              hints: updatedHints,
            },
          };
        });
      })
      .catch((err) => {
        console.warn('Error fetching hint:', err);
        if (usedHintsCount < activeMission.hints.length) {
          set({ usedHintsCount: usedHintsCount + 1 });
        }
      });
  },

  addEvidence: (evidenceItem) => {
    const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      evidence: [...state.evidence, { ...evidenceItem, id }],
    }));
  },

  removeEvidence: (id: string) => {
    set((state) => ({
      evidence: state.evidence.filter((e) => e.id !== id),
    }));
  },

  submitMissionAnswer: (answer: string) => {
    const { activeMissionId, currentRepoId, evidence, missions, activeMission } = get();
    if (!activeMissionId) return;

    const isDemo =
      !currentRepoId || currentRepoId === 'demo' || currentRepoId === 'demo-task-api';

    if (isDemo) {
      const evidenceFiles = evidence.map((e) => e.filePath);
      const rule = MISSION_EVALUATION_RULES[activeMissionId];

      const evaluation = rule
        ? rule.evaluate(answer, evidenceFiles)
        : {
            correct: false,
            partial: false,
            feedback: 'Unknown mission verification rule.',
            explanation: 'Please select a valid mission to evaluate.',
            citations: [],
          };

      if (evaluation.correct) {
        const currentIndex = missions.findIndex((m) => m.id === activeMissionId);
        const updatedMissions = missions.map((m, idx) => {
          if (m.id === activeMissionId) {
            return { ...m, status: 'completed' as const };
          }
          if (idx === currentIndex + 1 && m.status === 'locked') {
            return { ...m, status: 'available' as const };
          }
          return m;
        });

        set({
          feedback: evaluation,
          missions: updatedMissions,
          activeMission: activeMission
            ? { ...activeMission, status: 'completed' as const }
            : null,
        });
      } else {
        set({ feedback: evaluation });
      }
      return;
    }

    // Real API submission
    set({ isSubmitting: true });
    const client = getApiClient(currentRepoId);

    client
      .submitMission(activeMissionId, {
        answer,
        analysisId: currentRepoId,
        evidence,
      })
      .then((feedback) => {
        if (feedback.correct) {
          const currentIndex = missions.findIndex((m) => m.id === activeMissionId);
          const updatedMissions = missions.map((m, idx) => {
            if (m.id === activeMissionId) {
              return { ...m, status: 'completed' as const };
            }
            if (idx === currentIndex + 1 && m.status === 'locked') {
              return { ...m, status: 'available' as const };
            }
            return m;
          });

          set({
            isSubmitting: false,
            feedback,
            missions: updatedMissions,
            activeMission: activeMission
              ? { ...activeMission, status: 'completed' as const }
              : null,
          });
        } else {
          set({
            isSubmitting: false,
            feedback,
          });
        }
      })
      .catch((err) => {
        set({
          isSubmitting: false,
          feedback: {
            correct: false,
            partial: false,
            feedback: `Submission evaluation failed: ${err.message}`,
            explanation: 'Could not connect to the evaluation service.',
            citations: [],
          },
        });
      });
  },

  resetFeedback: () => {
    set({ feedback: null });
  },

  setCategoryFilter: (category) => {
    set({ filterCategory: category });
  },

  setSearchFilter: (query) => {
    set({ searchFilter: query });
  },

  setGraphViewMode: (mode) => {
    set({ graphViewMode: mode });
  },
}));
