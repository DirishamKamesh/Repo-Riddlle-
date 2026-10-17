import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGitHubUrl,
  computeConnectedSubgraph,
  filterArchitectureGraph,
  evaluateMissionSubmission,
  applyNodeDragDelta,
  computeEdgeGeometry,
} from './investigationRules.ts';
import type { GraphNodeData, GraphEdgeData } from '../types/index.ts';

test('validateGitHubUrl accepts valid full GitHub URLs and owner/repo shorthand', () => {
  const full = validateGitHubUrl('https://github.com/DirishamKamesh/FacuLynk');
  assert.equal(full.isValid, true);
  assert.equal(full.owner, 'DirishamKamesh');
  assert.equal(full.name, 'FacuLynk');
  assert.equal(full.fullName, 'DirishamKamesh/FacuLynk');

  const short = validateGitHubUrl('Zedoman/Carbon_Forest');
  assert.equal(short.isValid, true);
  assert.equal(short.normalizedUrl, 'https://github.com/Zedoman/Carbon_Forest');
});

test('validateGitHubUrl rejects empty or invalid URLs with descriptive errors', () => {
  const empty = validateGitHubUrl('   ');
  assert.equal(empty.isValid, false);
  assert.ok(empty.error?.includes('Please enter'));

  const invalid = validateGitHubUrl('https://gitlab.com/foo/bar');
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.error?.includes('Invalid GitHub repository format'));
});

test('computeConnectedSubgraph identifies incoming and outgoing connections accurately', () => {
  const edges: GraphEdgeData[] = [
    { id: 'e1', source: 'A', target: 'B', type: 'import' },
    { id: 'e2', source: 'B', target: 'C', type: 'import' },
    { id: 'e3', source: 'D', target: 'E', type: 'import' },
  ];

  const sub = computeConnectedSubgraph('B', edges);
  assert.ok(sub);
  assert.equal(sub.incomingCount, 1);
  assert.equal(sub.outgoingCount, 1);
  assert.equal(sub.nodeIds.has('A'), true);
  assert.equal(sub.nodeIds.has('B'), true);
  assert.equal(sub.nodeIds.has('C'), true);
  assert.equal(sub.nodeIds.has('D'), false);
  assert.equal(sub.edgeIds.has('e1'), true);
  assert.equal(sub.edgeIds.has('e2'), true);
  assert.equal(sub.edgeIds.has('e3'), false);
});

test('filterArchitectureGraph filters nodes by category and prunes dangling edges', () => {
  const nodes: GraphNodeData[] = [
    { id: '1', label: 'App.tsx', name: 'App.tsx', path: 'src/App.tsx', category: 'entry' },
    { id: '2', label: 'Core.ts', name: 'Core.ts', path: 'src/Core.ts', category: 'model' },
    { id: '3', label: 'Advisor.ts', name: 'Advisor.ts', path: 'src/Advisor.ts', category: 'model' },
  ];
  const edges: GraphEdgeData[] = [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '2', target: '3' },
  ];

  const filtered = filterArchitectureGraph(nodes, edges, 'model');
  assert.equal(filtered.nodes.length, 2);
  assert.equal(filtered.edges.length, 1);
  assert.equal(filtered.edges[0].id, 'e2');
});

test('evaluateMissionSubmission verifies expected concept and target file names case-insensitively', () => {
  const matchConcept = evaluateMissionSubmission('The header is X-Sentinel-Ticket', 'x-sentinel-ticket');
  assert.equal(matchConcept.isCorrect, true);

  const wrong = evaluateMissionSubmission('Authorization Bearer', 'x-sentinel-ticket');
  assert.equal(wrong.isCorrect, false);
});

test('applyNodeDragDelta scales screen delta accurately by canvas zoom factor', () => {
  const updated = applyNodeDragDelta({ x: 100, y: 200 }, { dx: 50, dy: -25 }, 0.5);
  assert.deepEqual(updated, { x: 200, y: 150 });
});

test('computeEdgeGeometry dynamically reroutes edges as nodes move horizontally or vertically', () => {
  const source = { x: 100, y: 100, width: 200, height: 72 };
  const targetRight = { x: 500, y: 100, width: 200, height: 72 };
  const geomRight = computeEdgeGeometry(source, targetRight);
  assert.equal(geomRight.sx, 300);
  assert.equal(geomRight.tx, 500);
  assert.equal(geomRight.midX, 400);

  // Drag target node to the left of source node -> ports swap cleanly without detaching
  const targetLeft = { x: -300, y: 100, width: 200, height: 72 };
  const geomLeft = computeEdgeGeometry(source, targetLeft);
  assert.equal(geomLeft.sx, 100);
  assert.equal(geomLeft.tx, -100);
  assert.equal(geomLeft.midX, 0);
});
