import path from 'path';
import {
  FileCategory,
  InferenceMethod,
  GraphNode,
  GraphEdge,
  GraphData,
  FileTreeNode,
  GraphCoverage,
  UnresolvedImport,
  WorkflowGraphData,
} from '../types/index.js';
import { TreeFileItem } from './github.js';
import { parseSourceAst, AstParseResult } from './ast-parser.js';
import {
  resolveModuleSpecifier,
  parseTsConfigFile,
} from './resolver.js';
import type { TsConfigOptions } from './resolver.js';
import { constructWorkflowGraph } from './workflow-analyzer.js';

export { parseTsConfigFile };
export type { TsConfigOptions };

/**
 * Classify a file path by pattern heuristics
 */
export function classifyFilePath(filePath: string): {
  category: FileCategory;
  inferenceMethod: InferenceMethod;
} {
  const normalized = filePath.toLowerCase().replace(/\\/g, '/');

  if (
    normalized.endsWith('index.ts') ||
    normalized.endsWith('index.js') ||
    normalized.endsWith('server.ts') ||
    normalized.endsWith('server.js') ||
    normalized.endsWith('main.ts') ||
    normalized.endsWith('main.js') ||
    normalized.endsWith('app.ts') ||
    normalized.endsWith('app.js')
  ) {
    return { category: 'entry_point', inferenceMethod: 'path_pattern' };
  }

  if (
    normalized.includes('/routes/') ||
    normalized.includes('/controllers/') ||
    normalized.includes('/api/') ||
    normalized.endsWith('.route.ts') ||
    normalized.endsWith('.route.js') ||
    normalized.endsWith('.controller.ts') ||
    normalized.endsWith('.controller.js')
  ) {
    return { category: 'route', inferenceMethod: 'path_pattern' };
  }

  if (
    normalized.includes('/models/') ||
    normalized.includes('/schemas/') ||
    normalized.includes('/entities/') ||
    normalized.endsWith('.model.ts') ||
    normalized.endsWith('.schema.ts') ||
    normalized.endsWith('.entity.ts')
  ) {
    return { category: 'model', inferenceMethod: 'path_pattern' };
  }

  if (
    normalized.includes('/components/') ||
    normalized.includes('/views/') ||
    normalized.endsWith('.tsx') ||
    normalized.endsWith('.jsx')
  ) {
    return { category: 'component', inferenceMethod: 'path_pattern' };
  }

  if (
    normalized.includes('__tests__') ||
    normalized.includes('/tests/') ||
    normalized.includes('/test/') ||
    normalized.endsWith('.test.ts') ||
    normalized.endsWith('.test.js') ||
    normalized.endsWith('.spec.ts') ||
    normalized.endsWith('.spec.js')
  ) {
    return { category: 'test', inferenceMethod: 'path_pattern' };
  }

  if (
    normalized.includes('config') ||
    normalized.endsWith('.json') ||
    normalized.endsWith('.yaml') ||
    normalized.endsWith('.yml') ||
    normalized.endsWith('.env.example') ||
    normalized.endsWith('dockerfile')
  ) {
    return { category: 'config', inferenceMethod: 'path_pattern' };
  }

  if (
    normalized.includes('/utils/') ||
    normalized.includes('/lib/') ||
    normalized.includes('/helpers/') ||
    normalized.includes('/services/')
  ) {
    return { category: 'utility', inferenceMethod: 'path_pattern' };
  }

  return { category: 'unknown', inferenceMethod: 'path_pattern' };
}

/**
 * Raw import match extracted from file source (enhanced with AST parser)
 */
export interface ExtractedImport {
  specifier: string;
  importedSymbols: string[];
  line: number;
  isTypeOnly?: boolean;
  kind?: 'static' | 'dynamic' | 're_export' | 'require';
}

/**
 * Extract static ES imports, CommonJS requires, dynamic imports, and re-exports
 * using the TypeScript Compiler API AST parser.
 */
export function extractImportsFromSource(source: string, filePath = 'file.ts'): ExtractedImport[] {
  const parseResult = parseSourceAst(filePath, source);
  return parseResult.imports.map((imp) => ({
    specifier: imp.specifier,
    importedSymbols: imp.importedSymbols,
    line: imp.line,
    isTypeOnly: imp.isTypeOnly,
    kind: imp.kind,
  }));
}

/**
 * Resolve import specifier against real repository files.
 * Uses tsconfig path aliases, ESM .js extension rewriting, and index file resolution.
 */
export function resolveImportTarget(
  sourceFilePath: string,
  importSpecifier: string,
  existingFilePaths: Set<string>,
  tsconfig?: TsConfigOptions
): string | null {
  return resolveModuleSpecifier(sourceFilePath, importSpecifier, existingFilePaths, tsconfig);
}

/**
 * Build hierarchical FileTreeNode structure for File Explorer
 */
export function buildFileTree(files: TreeFileItem[]): FileTreeNode {
  const root: FileTreeNode = {
    name: 'root',
    path: '',
    isDirectory: true,
    children: [],
  };

  const blobFiles = files.filter((f) => f.type === 'blob' || !f.type);

  for (const file of blobFiles) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      if (isLast) {
        const { category, inferenceMethod } = classifyFilePath(file.path);
        current.children = current.children || [];
        if (!current.children.some((c) => c.name === part && !c.isDirectory)) {
          current.children.push({
            name: part,
            path: file.path,
            isDirectory: false,
            category,
            inferenceMethod,
            language:
              file.path.endsWith('.ts') || file.path.endsWith('.tsx')
                ? 'typescript'
                : file.path.endsWith('.json')
                  ? 'json'
                  : file.path.endsWith('.md')
                    ? 'markdown'
                    : 'javascript',
          });
        }
      } else {
        current.children = current.children || [];
        let dirNode = current.children.find((c) => c.name === part && c.isDirectory);
        if (!dirNode) {
          dirNode = {
            name: part,
            path: currentPath,
            isDirectory: true,
            children: [],
          };
          current.children.push(dirNode);
        }
        current = dirNode;
      }
    }
  }

  function sortTree(node: FileTreeNode) {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  }

  sortTree(root);
  return root;
}

/**
 * Generate GraphData containing verified nodes from repository inventory and static import edges.
 * Only draws edges verified by AST evidence and local file resolution.
 */
export function constructArchitectureGraph(
  files: TreeFileItem[],
  sources: Map<string, string>,
  tsconfig?: TsConfigOptions,
  isTruncated = false
): { graphData: GraphData; astMap: Map<string, AstParseResult> } {
  const allPathSet = new Set(files.map((f) => f.path));
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeIdSet = new Set<string>();
  const astMap = new Map<string, AstParseResult>();
  const unresolvedImports: UnresolvedImport[] = [];

  let parseFailedCount = 0;
  let resolvedEdgesCount = 0;

  // Track incoming/outgoing import counts per file
  const incomingCounts = new Map<string, number>();
  const outgoingCounts = new Map<string, number>();

  // 1. Process files and parse ASTs for fetched sources
  for (const file of files) {
    const parentDir = path.dirname(file.path);
    const hasSource = sources.has(file.path);
    let { category, inferenceMethod } = classifyFilePath(file.path);
    let parseError: string | null = null;

    if (hasSource) {
      const sourceContent = sources.get(file.path)!;
      const ast = parseSourceAst(file.path, sourceContent);
      astMap.set(file.path, ast);

      if (ast.parseError) {
        parseError = ast.parseError;
        parseFailedCount++;
      } else {
        // Refine category using AST framework detection
        if (ast.framework.hasServerListen || ast.framework.isExpressApp) {
          category = 'entry_point';
          inferenceMethod = 'content_parsed';
        } else if (ast.framework.isExpressRouter || ast.framework.routes.length > 0) {
          category = 'route';
          inferenceMethod = 'content_parsed';
        } else if (ast.framework.jsxComponentReferences.length > 0 && category === 'unknown') {
          category = 'component';
          inferenceMethod = 'content_parsed';
        }
      }
    }

    nodes.push({
      id: file.path,
      label: path.basename(file.path),
      filePath: file.path,
      category,
      inferenceMethod,
      language:
        file.path.endsWith('.ts') || file.path.endsWith('.tsx')
          ? 'typescript'
          : file.path.endsWith('.json')
            ? 'json'
            : 'javascript',
      fetched: hasSource,
      summary: hasSource
        ? `Verified module in ${parentDir === '.' ? 'root' : parentDir}`
        : null,
      parentDir: parentDir === '.' ? '' : parentDir,
      parseError,
    });
  }

  // 2. Build verified dependency edges from AST parsed imports
  for (const [filePath, ast] of astMap.entries()) {
    let fileOutgoing = 0;

    for (const imp of ast.imports) {
      const resolvedTarget = resolveModuleSpecifier(
        filePath,
        imp.specifier,
        allPathSet,
        tsconfig
      );

      if (resolvedTarget && resolvedTarget !== filePath) {
        const edgeId = `edge:${filePath}->${resolvedTarget}:${imp.kind || 'static'}`;
        if (!edgeIdSet.has(edgeId)) {
          edgeIdSet.add(edgeId);

          let label = imp.isTypeOnly ? 'type import' : `imports`;
          if (imp.importedSymbols && imp.importedSymbols.length > 0) {
            const symPreview = imp.importedSymbols.slice(0, 2).join(', ');
            label = `${imp.isTypeOnly ? 'type ' : ''}import { ${symPreview}${imp.importedSymbols.length > 2 ? '...' : ''} }`;
          } else if (imp.kind === 're_export') {
            label = 're-exports';
          } else if (imp.kind === 'dynamic') {
            label = 'dynamic import';
          }

          edges.push({
            id: edgeId,
            source: filePath,
            target: resolvedTarget,
            type: 'import',
            confirmed: true,
            label,
            specifier: imp.specifier,
            importedSymbols: imp.importedSymbols,
            isTypeOnly: imp.isTypeOnly,
            kind: imp.kind,
            line: imp.line,
          });

          resolvedEdgesCount++;
          fileOutgoing++;
          incomingCounts.set(resolvedTarget, (incomingCounts.get(resolvedTarget) || 0) + 1);
        }
      } else if (!resolvedTarget) {
        // Record unresolved or external dependency
        unresolvedImports.push({
          sourceFile: filePath,
          specifier: imp.specifier,
          line: imp.line,
          reason: imp.specifier.startsWith('.') || imp.specifier.startsWith('/')
            ? 'Target local file not found in repository inventory'
            : 'External package dependency',
        });
      }
    }

    outgoingCounts.set(filePath, fileOutgoing);
  }

  // 3. Annotate nodes with incoming and outgoing counts
  for (const node of nodes) {
    node.incomingImportsCount = incomingCounts.get(node.id) || 0;
    node.outgoingImportsCount = outgoingCounts.get(node.id) || 0;
  }

  // 4. Calculate accurate coverage statistics
  const coverage: GraphCoverage = {
    totalInventoryFiles: files.length,
    eligibleFiles: files.length,
    analyzedFiles: astMap.size,
    skippedFiles: Math.max(0, files.length - sources.size),
    parseFailedFiles: parseFailedCount,
    isTruncated,
    unresolvedImportsCount: unresolvedImports.length,
    resolvedImportsCount: resolvedEdgesCount,
  };

  const graphData: GraphData = {
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    coverage,
    unresolvedImports: unresolvedImports.slice(0, 100), // Cap list for payload budget
  };

  return { graphData, astMap };
}

/**
 * Execute complete repository analysis: builds both Dependency Graph and Workflow Graph
 */
export function constructFullRepositoryAnalysis(
  files: TreeFileItem[],
  sources: Map<string, string>,
  isTruncated = false,
  rawTsConfig?: string
): {
  graphData: GraphData;
  workflowGraph: WorkflowGraphData;
  fileTree: FileTreeNode;
} {
  const tsconfig = rawTsConfig ? parseTsConfigFile(rawTsConfig) : undefined;
  const allPathSet = new Set(files.map((f) => f.path));

  // 1. Dependency Graph
  const { graphData, astMap } = constructArchitectureGraph(
    files,
    sources,
    tsconfig,
    isTruncated
  );

  // 2. Workflow Graph
  const workflowGraph = constructWorkflowGraph(
    graphData.nodes,
    astMap,
    allPathSet,
    tsconfig
  );

  // 3. File Tree
  const fileTree = buildFileTree(files);

  return {
    graphData,
    workflowGraph,
    fileTree,
  };
}
