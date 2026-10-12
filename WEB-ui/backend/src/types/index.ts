export type FileCategory =
  | 'entry_point'
  | 'route'
  | 'model'
  | 'config'
  | 'component'
  | 'utility'
  | 'test'
  | 'unknown';

export type InferenceMethod = 'path_pattern' | 'content_parsed';

export type AnalysisStatus =
  | 'pending'
  | 'connecting'
  | 'reading_tree'
  | 'fetching_files'
  | 'analyzing_imports'
  | 'building_map'
  | 'preparing_missions'
  | 'partial'
  | 'complete'
  | 'failed';

export interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  defaultBranch: string;
  commitSha: string;
  stars: number;
  fileCount: number;
  detectedTechnologies: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  filePath: string;
  category: FileCategory;
  inferenceMethod: InferenceMethod;
  language: string;
  fetched: boolean;
  summary: string | null;
  parentDir: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'import';
  confirmed: boolean;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeCount: number;
  edgeCount: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  category?: FileCategory;
  inferenceMethod?: InferenceMethod;
  language?: string;
  children?: FileTreeNode[];
}

export interface Citation {
  id: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  snippet: string;
  reason: string;
}

export interface SourceFile {
  path: string;
  content: string | null;
  language: string;
  category: FileCategory;
  summary: string | null;
  citations: Citation[];
  lineCount: number;
}

export interface Evidence {
  id: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  snippet: string;
}

export type MissionType =
  | 'entry_point'
  | 'route_location'
  | 'error_handling';

export type MissionStatus =
  | 'locked'
  | 'available'
  | 'active'
  | 'completed'
  | 'failed';

export interface MissionSummary {
  id: string;
  type: MissionType;
  objective: string;
  status: MissionStatus;
  order: number;
}

export interface MissionDetail {
  id: string;
  type: MissionType;
  objective: string;
  startingClue: string;
  hints: string[];
  relevantFiles: string[];
  status: MissionStatus;
  order: number;
}

export interface MissionFeedback {
  correct: boolean;
  partial: boolean;
  feedback: string;
  explanation: string;
  citations: Citation[];
}

export interface AnalyzeResponse {
  analysisId: string;
  repositoryId: string;
  status: AnalysisStatus;
  cached: boolean;
}

export interface AnalysisStatusResponse {
  status: AnalysisStatus;
  progress: {
    stage: string;
    detail: string;
  };
  graphId: string | null;
  missionIds: string[] | null;
}

export interface SubmitRequest {
  answer: string;
  explanation?: string;
  evidence?: Evidence[];
}

export interface HintResponse {
  hint: string;
  hintsUsed: number;
}

export interface DashboardRepo {
  repositoryId: string;
  repository: Repository;
  analysisStatus: AnalysisStatus;
  missionsCompleted: number;
  missionsTotal: number;
  lastExplored: string;
}
