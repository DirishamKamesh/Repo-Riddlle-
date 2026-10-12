import {
  Repository,
  GraphData,
  FileTreeNode,
  SourceFile,
  MissionSummary,
  MissionDetail,
  MissionFeedback,
  AnalyzeResponse,
  AnalysisStatusResponse,
  SubmitRequest,
  HintResponse,
  DashboardRepo,
  AnalysisStatus,
} from '../types';

export interface AnalysisDetailResponse {
  analysisId: string;
  repository: Repository;
  status: AnalysisStatus;
  fileTree: FileTreeNode;
  commitSha: string;
  missionsTotal: number;
}

export interface GraphResponse {
  graph: GraphData;
  fileTree: FileTreeNode;
}

export interface ApiClient {
  analyzeRepo(url: string): Promise<AnalyzeResponse>;
  getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse>;
  getAnalysis(analysisId: string): Promise<AnalysisDetailResponse>;
  getGraph(graphId: string): Promise<GraphResponse>;
  getSourceFile(graphId: string, filePath: string): Promise<SourceFile>;
  getMissions(analysisId: string): Promise<MissionSummary[]>;
  getMissionDetail(missionId: string, analysisId: string): Promise<MissionDetail>;
  requestHint(missionId: string, analysisId: string): Promise<HintResponse>;
  submitMission(
    missionId: string,
    payload: SubmitRequest & { analysisId: string; sessionToken?: string }
  ): Promise<MissionFeedback>;
  getDashboardRepos(): Promise<DashboardRepo[]>;
}
