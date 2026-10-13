import {
  ApiClient,
  AnalysisDetailResponse,
  GraphResponse,
} from './client';
import {
  AnalyzeResponse,
  AnalysisStatusResponse,
  SourceFile,
  MissionSummary,
  MissionDetail,
  MissionFeedback,
  SubmitRequest,
  HintResponse,
  DashboardRepo,
} from '../types';
import { DEMO_REPOSITORY, DEMO_DASHBOARD_REPOS } from '../mock/repository';
import { DEMO_FILE_TREE } from '../mock/file-tree';
import { DEMO_GRAPH_DATA, DEMO_WORKFLOW_GRAPH_DATA } from '../mock/graph-data';
import {
  DEMO_MISSIONS,
  DEMO_MISSION_SUMMARIES,
  MISSION_EVALUATION_RULES,
} from '../mock/missions';
import { DEMO_SOURCE_FILES } from '../mock/source-files';

export class DemoApiAdapter implements ApiClient {
  async analyzeRepo(_url: string): Promise<AnalyzeResponse> {
    return {
      analysisId: 'demo-task-api',
      repositoryId: 'demo-task-api',
      status: 'complete',
      cached: true,
    };
  }

  async getAnalysisStatus(_analysisId: string): Promise<AnalysisStatusResponse> {
    return {
      status: 'complete',
      progress: {
        stage: 'Analysis Complete',
        detail: 'Simulated static analysis ready for inspection.',
      },
      graphId: 'demo-task-api',
      missionIds: DEMO_MISSION_SUMMARIES.map((m) => m.id),
    };
  }

  async getAnalysis(_analysisId: string): Promise<AnalysisDetailResponse> {
    return {
      analysisId: 'demo-task-api',
      repository: DEMO_REPOSITORY,
      status: 'complete',
      fileTree: DEMO_FILE_TREE,
      commitSha: DEMO_REPOSITORY.commitSha,
      missionsTotal: DEMO_MISSION_SUMMARIES.length,
    };
  }

  async getGraph(_graphId: string): Promise<GraphResponse> {
    return {
      graph: DEMO_GRAPH_DATA,
      workflowGraph: DEMO_WORKFLOW_GRAPH_DATA,
      fileTree: DEMO_FILE_TREE,
    };
  }

  async getSourceFile(_graphId: string, filePath: string): Promise<SourceFile> {
    const file = DEMO_SOURCE_FILES[filePath];
    if (file) return file;

    return {
      path: filePath,
      language: filePath.endsWith('.json')
        ? 'json'
        : filePath.endsWith('.md')
          ? 'markdown'
          : 'typescript',
      category: 'unknown',
      summary: `Demo view for ${filePath}`,
      citations: [],
      content: `// Source for ${filePath}\n// Fetched via RepoRiddle Demo Provider\n`,
      lineCount: 2,
    };
  }

  async getMissions(_analysisId: string): Promise<MissionSummary[]> {
    return DEMO_MISSION_SUMMARIES;
  }

  async getMissionDetail(missionId: string, _analysisId: string): Promise<MissionDetail> {
    const mission = DEMO_MISSIONS.find((m) => m.id === missionId);
    if (!mission) {
      throw new Error(`Demo mission ${missionId} not found`);
    }
    return mission;
  }

  async requestHint(missionId: string, _analysisId: string): Promise<HintResponse> {
    const mission = DEMO_MISSIONS.find((m) => m.id === missionId);
    const hints = mission?.hints || ['Explore the architecture graph.'];
    return {
      hint: hints[0],
      hintsUsed: 1,
    };
  }

  async submitMission(
    missionId: string,
    payload: SubmitRequest & { analysisId: string }
  ): Promise<MissionFeedback> {
    const rule = MISSION_EVALUATION_RULES[missionId];
    const evidenceFiles = (payload.evidence || []).map((e) => e.filePath);

    if (rule) {
      return rule.evaluate(payload.answer, evidenceFiles);
    }

    return {
      correct: false,
      partial: false,
      feedback: 'Mission evaluation rule not found.',
      explanation: 'Please attempt one of the available demo missions.',
      citations: [],
    };
  }

  async getDashboardRepos(): Promise<DashboardRepo[]> {
    return DEMO_DASHBOARD_REPOS;
  }
}
