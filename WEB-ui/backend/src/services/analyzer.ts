import path from 'path';
import {
  FileCategory,
  InferenceMethod,
  GraphNode,
  GraphEdge,
  GraphData,
  FileTreeNode,
} from '../types/index.js';
import { TreeFileItem } from './github.js';

/**
 * Classify a file path by pattern
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
 * Raw import match extracted from file source
 */
export interface ExtractedImport {
  specifier: string;
  importedSymbols: string[];
  line: number;
}

/**
 * Extract static ES imports and CommonJS requires from source text
 */
export function extractImportsFromSource(source: string): ExtractedImport[] {
  const imports: ExtractedImport[] = [];
  const lines = source.split('\n');

  // Match: import ... from 'specifier' or import 'specifier'
  const importRegex =
    /(?:import\s+(?:([\w*\s{},$]+)\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\))/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip full comment lines
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      continue;
    }

    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(line)) !== null) {
      const symbolsClause = match[1];
      const specifier = match[2] || match[3] || match[4];

      if (specifier) {
        const symbols: string[] = [];
        if (symbolsClause) {
          // Parse symbols like { a, b as c } or defaultImport
          const cleaned = symbolsClause.replace(/[{}]/g, '').trim();
          symbols.push(...cleaned.split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean));
        }

        imports.push({
          specifier,
          importedSymbols: symbols,
          line: i + 1,
        });
      }
    }
  }

  return imports;
}

/**
 * Resolve relative import specifier against real repository files.
 * Returns the matching repository file path, or null if external/unresolved.
 */
export function resolveImportTarget(
  sourceFilePath: string,
  importSpecifier: string,
  existingFilePaths: Set<string>
): string | null {
  // Only resolve relative local imports
  if (!importSpecifier.startsWith('.') && !importSpecifier.startsWith('/')) {
    return null;
  }

  const sourceDir = path.dirname(sourceFilePath);
  const rawTarget = path.posix.normalize(path.posix.join(sourceDir.replace(/\\/g, '/'), importSpecifier.replace(/\\/g, '/')));

  // Candidate extensions and index resolutions
  const candidates = [
    rawTarget,
    `${rawTarget}.ts`,
    `${rawTarget}.tsx`,
    `${rawTarget}.js`,
    `${rawTarget}.jsx`,
    `${rawTarget}.mjs`,
    `${rawTarget}.cjs`,
    `${rawTarget}.json`,
    `${rawTarget}/index.ts`,
    `${rawTarget}/index.tsx`,
    `${rawTarget}/index.js`,
    `${rawTarget}/index.jsx`,
  ];

  for (const candidate of candidates) {
    if (existingFilePaths.has(candidate)) {
      return candidate;
    }
  }

  return null;
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

  // Only build file tree from blobs (files), ignoring git tree directory items
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

  // Sort directories first, then alphabetically
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
 * Generate GraphData containing verified nodes and static import edges
 */
export function constructArchitectureGraph(
  files: TreeFileItem[],
  sources: Map<string, string>
): GraphData {
  const allPathSet = new Set(files.map((f) => f.path));
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeIdSet = new Set<string>();

  // Determine top files to include in graph (prioritize analyzed sources)
  const graphFiles = files.filter((f) => sources.has(f.path) || files.length <= 40);

  for (const file of graphFiles) {
    const { category, inferenceMethod } = classifyFilePath(file.path);
    const parentDir = path.dirname(file.path);
    const hasSource = sources.has(file.path);

    nodes.push({
      id: file.path,
      label: path.basename(file.path),
      filePath: file.path,
      category,
      inferenceMethod,
      language: file.path.endsWith('.ts') || file.path.endsWith('.tsx') ? 'typescript' : 'javascript',
      fetched: hasSource,
      summary: hasSource ? `Verified module in ${parentDir || 'root'}` : null,
      parentDir: parentDir === '.' ? '' : parentDir,
    });

    if (hasSource) {
      const sourceContent = sources.get(file.path)!;
      const rawImports = extractImportsFromSource(sourceContent);

      for (const imp of rawImports) {
        const resolvedTarget = resolveImportTarget(file.path, imp.specifier, allPathSet);

        // Only draw verified edges when target exists in repository!
        if (resolvedTarget && resolvedTarget !== file.path) {
          const edgeId = `edge:${file.path}->${resolvedTarget}`;
          if (!edgeIdSet.has(edgeId)) {
            edgeIdSet.add(edgeId);
            edges.push({
              id: edgeId,
              source: file.path,
              target: resolvedTarget,
              type: 'import',
              confirmed: true,
              label: imp.importedSymbols.length > 0
                ? `imports { ${imp.importedSymbols.slice(0, 2).join(', ')}${imp.importedSymbols.length > 2 ? '...' : ''} }`
                : `imports ${imp.specifier}`,
            });
          }
        }
      }
    }
  }

  return {
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
  };
}
