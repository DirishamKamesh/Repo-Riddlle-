// File category types matching the PRD specification
export type FileCategory =
  | 'entry_point'
  | 'route'
  | 'model'
  | 'config'
  | 'component'
  | 'utility'
  | 'test'
  | 'unknown';

// How the category was determined
export type InferenceMethod = 'path_pattern' | 'content_parsed';

// Analysis pipeline status
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

// Repository metadata
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

// Graph node
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
  incomingImportsCount?: number;
  outgoingImportsCount?: number;
  parseError?: string | null;
}

// Graph edge
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'import';
  confirmed: boolean;
  label?: string;
  specifier?: string;
  importedSymbols?: string[];
  isTypeOnly?: boolean;
  kind?: 'static' | 'dynamic' | 're_export' | 'require';
  line?: number;
}

export interface GraphCoverage {
  totalInventoryFiles: number;
  eligibleFiles: number;
  analyzedFiles: number;
  skippedFiles: number;
  parseFailedFiles: number;
  isTruncated: boolean;
  unresolvedImportsCount: number;
  resolvedImportsCount: number;
}

export interface UnresolvedImport {
  sourceFile: string;
  specifier: string;
  line: number;
  reason: string;
}

// Graph data
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeCount: number;
  edgeCount: number;
  coverage?: GraphCoverage;
  unresolvedImports?: UnresolvedImport[];
}

export type WorkflowRelation =
  | 'boots'
  | 'mounts_router'
  | 'applies_middleware'
  | 'invokes_handler'
  | 'accesses_model'
  | 'calls_service'
  | 'renders_component';

export interface WorkflowEvidence {
  filePath: string;
  line: number;
  snippet: string;
  description: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  relation: WorkflowRelation;
  label: string;
  routePath?: string;
  httpMethod?: string;
  status: 'confirmed' | 'inferred' | 'unresolved';
  evidence: WorkflowEvidence;
}

export interface WorkflowGraphData {
  nodes: GraphNode[];
  edges: WorkflowEdge[];
  nodeCount: number;
  edgeCount: number;
  description?: string;
}

export interface GraphApiResponse {
  graph: GraphData;
  workflowGraph?: WorkflowGraphData;
  fileTree: FileTreeNode;
  coverage?: GraphCoverage;
}

// File tree node for the explorer
export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  category?: FileCategory;
  inferenceMethod?: InferenceMethod;
  language?: string;
  children?: FileTreeNode[];
}

// Source file content
export interface SourceFile {
  path: string;
  content: string | null;
  language: string;
  category: FileCategory;
  summary: string | null;
  citations: Citation[];
  lineCount: number;
}

// Citation reference
export interface Citation {
  id: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  snippet: string;
  reason: string;
}

// Evidence selected by user
export interface Evidence {
  id: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  snippet: string;
}

// Mission types (MVP)
export type MissionType =
  | 'entry_point'
  | 'route_location'
  | 'error_handling';

// Mission status
export type MissionStatus =
  | 'locked'
  | 'available'
  | 'active'
  | 'completed'
  | 'failed';

// Mission summary (list view)
export interface MissionSummary {
  id: string;
  type: MissionType;
  objective: string;
  status: MissionStatus;
  order: number;
}

// Mission detail
export interface MissionDetail {
  id: string;
  type: MissionType;
  objective: string;
  startingClue: string;
  hints: string[];
  relevantFiles: string[];
  status: MissionStatus;
}

// Mission submission feedback
export interface MissionFeedback {
  correct: boolean;
  partial: boolean;
  feedback: string;
  explanation: string;
  citations: Citation[];
}

// API response types
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

// Dashboard repository card
export interface DashboardRepo {
  repositoryId: string;
  repository: Repository;
  analysisStatus: AnalysisStatus;
  missionsCompleted: number;
  missionsTotal: number;
  lastExplored: string;
}
