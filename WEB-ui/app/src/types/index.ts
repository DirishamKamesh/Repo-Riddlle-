export type FileCategory = 
  | 'entry' 
  | 'route' 
  | 'model' 
  | 'component' 
  | 'test' 
  | 'config' 
  | 'utility';

export interface RepositoryMetadata {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  branch: string;
  defaultBranch?: string;
  language: string;
  url: string;
  filesCount?: number;
  importsCount?: number;
  modulesCount?: number;
  analyzedAt?: string;
  isDemo?: boolean;
}

export interface FileNodeItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  category?: FileCategory;
  children?: FileNodeItem[];
  size?: number;
  lines?: number;
}

export interface ASTSummary {
  classes?: string[];
  functions?: string[];
  imports?: string[];
  exports?: string[];
  decorators?: string[];
  complexity?: number;
  dependenciesCount?: number;
}

export interface FileDetails {
  id: string;
  path: string;
  name: string;
  category: FileCategory;
  language: string;
  lines: number;
  content: string;
  ast?: ASTSummary;
  blastRadius?: {
    filesCount: number;
    percentage: number;
    affectedFiles: string[];
  };
  citations?: Array<{
    line: number;
    endLine?: number;
    text: string;
    description: string;
  }>;
}

export interface GraphNodeData {
  id: string;
  label: string;
  name: string;
  path: string;
  category: FileCategory;
  language?: string;
  lines?: number;
  importsCount?: number;
  functionsCount?: number;
  isEntry?: boolean;
  blastRadiusScore?: number;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'import' | 'call' | 'workflow' | 'dependency';
  evidence?: {
    sourcePath: string;
    targetPath: string;
    line: number;
    snippet: string;
    description: string;
  };
}

export interface ArchitectureGraph {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface Mission {
  id: string;
  order: number;
  title: string;
  objective: string;
  startingClue: string;
  relevantFiles: string[];
  hints: string[];
  hintsUsed: number;
  maxHints: number;
  isSolved: boolean;
  targetFilePath?: string;
  expectedConcept?: string;
}

export interface EvidenceItem {
  id: string;
  filePath: string;
  line: number;
  endLine?: number;
  snippet: string;
  description: string;
  missionId?: string;
  addedAt: string;
}

export interface AnalysisStage {
  id: number;
  key: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: string;
}

export interface AnalysisStatusResponse {
  analysisId: string;
  status: 'queued' | 'scanning' | 'analyzing' | 'building' | 'completed' | 'failed';
  progress: number;
  currentStage: number;
  stages: AnalysisStage[];
  repository: RepositoryMetadata;
  stats?: {
    filesIndexed: number;
    importsFound: number;
    modulesAnalyzed: number;
    missionsReady: number;
  };
  error?: string;
}
