import type { FileCategory, GraphEdgeData, GraphNodeData } from '../types/index.ts';

export interface ParsedGitHubRepo {
  isValid: boolean;
  owner: string;
  name: string;
  fullName: string;
  normalizedUrl: string;
  error?: string;
}

/**
 * Validates and normalizes a GitHub repository URL or owner/repo shorthand.
 */
export function validateGitHubUrl(input: string): ParsedGitHubRepo {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      owner: '',
      name: '',
      fullName: '',
      normalizedUrl: '',
      error: 'Please enter a GitHub repository URL (e.g. https://github.com/owner/repo).',
    };
  }

  const urlPattern = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git|\/.*)?$/;
  const urlMatch = trimmed.match(urlPattern);
  if (urlMatch) {
    const [, owner, name] = urlMatch;
    return {
      isValid: true,
      owner,
      name,
      fullName: `${owner}/${name}`,
      normalizedUrl: `https://github.com/${owner}/${name}`,
    };
  }

  const shorthandPattern = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/;
  const shortMatch = trimmed.match(shorthandPattern);
  if (shortMatch && !trimmed.includes(':') && !trimmed.startsWith('.')) {
    const [, owner, name] = shortMatch;
    return {
      isValid: true,
      owner,
      name,
      fullName: `${owner}/${name}`,
      normalizedUrl: `https://github.com/${owner}/${name}`,
    };
  }

  return {
    isValid: false,
    owner: '',
    name: '',
    fullName: '',
    normalizedUrl: '',
    error: 'Invalid GitHub repository format. Expected https://github.com/owner/repository.',
  };
}

/**
 * Computes the set of connected node IDs and edge IDs (incoming + outgoing)
 * for a selected node in the architecture graph.
 */
export function computeConnectedSubgraph(
  selectedNodeId: string | null,
  edges: GraphEdgeData[]
): { nodeIds: Set<string>; edgeIds: Set<string>; incomingCount: number; outgoingCount: number } | null {
  if (!selectedNodeId) return null;

  const nodeIds = new Set<string>([selectedNodeId]);
  const edgeIds = new Set<string>();
  let incomingCount = 0;
  let outgoingCount = 0;

  for (const edge of edges) {
    if (edge.source === selectedNodeId) {
      edgeIds.add(edge.id);
      nodeIds.add(edge.target);
      outgoingCount += 1;
    } else if (edge.target === selectedNodeId) {
      edgeIds.add(edge.id);
      nodeIds.add(edge.source);
      incomingCount += 1;
    }
  }

  return { nodeIds, edgeIds, incomingCount, outgoingCount };
}

/**
 * Filters graph nodes and edges by file category and optional search query.
 */
export function filterArchitectureGraph(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
  category: FileCategory | 'all',
  searchQuery = ''
): { nodes: GraphNodeData[]; edges: GraphEdgeData[] } {
  const query = searchQuery.trim().toLowerCase();

  const filteredNodes = nodes.filter((node) => {
    const matchesCategory = category === 'all' || node.category === category;
    const matchesQuery =
      !query ||
      node.name.toLowerCase().includes(query) ||
      node.path.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const validIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (edge) => validIds.has(edge.source) && validIds.has(edge.target)
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}

/**
 * Evaluates a user's mission submission against the expected concept or target file.
 */
export function evaluateMissionSubmission(
  answer: string,
  expectedConcept?: string,
  targetFilePath?: string
): { isCorrect: boolean; normalizedAnswer: string } {
  const normalizedAnswer = answer.trim().toLowerCase();
  if (!normalizedAnswer) {
    return { isCorrect: false, normalizedAnswer };
  }

  if (expectedConcept && normalizedAnswer.includes(expectedConcept.toLowerCase())) {
    return { isCorrect: true, normalizedAnswer };
  }

  if (targetFilePath) {
    const fileName = targetFilePath.split('/').pop()?.toLowerCase() || '';
    if (fileName && normalizedAnswer.includes(fileName)) {
      return { isCorrect: true, normalizedAnswer };
    }
  }

  return { isCorrect: false, normalizedAnswer };
}

/**
 * Applies a pointer drag delta in screen coordinates to a node's canvas coordinates,
 * accounting for the current canvas zoom scale.
 */
export function applyNodeDragDelta(
  startPos: { x: number; y: number },
  screenDelta: { dx: number; dy: number },
  scale: number
): { x: number; y: number } {
  const safeScale = scale > 0 ? scale : 1;
  return {
    x: Math.round((startPos.x + screenDelta.dx / safeScale) * 10) / 10,
    y: Math.round((startPos.y + screenDelta.dy / safeScale) * 10) / 10,
  };
}

/**
 * Computes responsive cubic-bezier SVG path and midpoint between two positioned nodes
 * so edges stay cleanly attached regardless of where nodes are dragged.
 */
export function computeEdgeGeometry(
  source: { x: number; y: number; width: number; height: number },
  target: { x: number; y: number; width: number; height: number }
): { pathData: string; midX: number; midY: number; sx: number; sy: number; tx: number; ty: number } {
  const sCenterX = source.x + source.width / 2;
  const sCenterY = source.y + source.height / 2;
  const tCenterX = target.x + target.width / 2;
  const tCenterY = target.y + target.height / 2;

  const deltaX = tCenterX - sCenterX;
  const deltaY = tCenterY - sCenterY;

  let sx: number, sy: number, tx: number, ty: number;
  let pathData: string;

  // Choose horizontal or vertical ports depending on relative node placement
  if (Math.abs(deltaX) >= Math.abs(deltaY) * 0.75) {
    if (deltaX >= 0) {
      sx = source.x + source.width;
      sy = sCenterY;
      tx = target.x;
      ty = tCenterY;
    } else {
      sx = source.x;
      sy = sCenterY;
      tx = target.x + target.width;
      ty = tCenterY;
    }
    const controlOffset = Math.max(40, Math.abs(tx - sx) * 0.45);
    const c1x = deltaX >= 0 ? sx + controlOffset : sx - controlOffset;
    const c2x = deltaX >= 0 ? tx - controlOffset : tx + controlOffset;
    pathData = `M ${sx} ${sy} C ${c1x} ${sy}, ${c2x} ${ty}, ${tx} ${ty}`;
  } else {
    if (deltaY >= 0) {
      sx = sCenterX;
      sy = source.y + source.height;
      tx = tCenterX;
      ty = target.y;
    } else {
      sx = sCenterX;
      sy = source.y;
      tx = tCenterX;
      ty = target.y + target.height;
    }
    const controlOffset = Math.max(40, Math.abs(ty - sy) * 0.45);
    const c1y = deltaY >= 0 ? sy + controlOffset : sy - controlOffset;
    const c2y = deltaY >= 0 ? ty - controlOffset : ty + controlOffset;
    pathData = `M ${sx} ${sy} C ${sx} ${c1y}, ${tx} ${c2y}, ${tx} ${ty}`;
  }

  return {
    pathData,
    midX: (sx + tx) / 2,
    midY: (sy + ty) / 2,
    sx,
    sy,
    tx,
    ty,
  };
}
