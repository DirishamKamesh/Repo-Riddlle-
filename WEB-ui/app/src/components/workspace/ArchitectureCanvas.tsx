import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import dagre from '@dagrejs/dagre';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Workflow, 
  GitBranch, 
  FileCode,
  BookmarkPlus,
  GripVertical,
  X
} from 'lucide-react';
import { useInvestigationStore } from '../../store/useInvestigationStore';
import { GraphNodeData, FileCategory } from '../../types';
import { GraphLegend } from './GraphLegend';
import { CATEGORY_CONFIG } from '../common/CategoryBadge';
import {
  computeConnectedSubgraph,
  filterArchitectureGraph,
  applyNodeDragDelta,
  computeEdgeGeometry,
} from '../../lib/investigationRules';

interface PositionedNode extends GraphNodeData {
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;

const TOOLBAR_CATEGORIES: Array<FileCategory | 'all'> = [
  'all',
  'entry',
  'route',
  'model',
  'component',
  'utility',
  'config',
];

export const ArchitectureCanvas: React.FC = () => {
  const {
    graphMode,
    setGraphMode,
    layoutMode,
    setLayoutMode,
    dependenciesGraph,
    workflowGraph,
    nodePositions,
    layoutVersion,
    setNodePosition,
    seedNodePositions,
    resetNodePositions,
    selectedNodeId,
    setSelectedNodeId,
    selectedCategory,
    setSelectedCategory,
    showLegend,
    toggleLegend,
    selectFile,
    openSourceViewer,
    pinEvidence,
    activeEvidenceEdge,
    setActiveEvidenceEdge,
    resetHighlighting,
  } = useInvestigationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Active node drag state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const suppressNextClickRef = useRef(false);
  const dragSessionRef = useRef<{
    nodeId: string;
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const currentGraph = graphMode === 'dependencies' ? dependenciesGraph : workflowGraph;

  const { nodes: filteredNodes, edges: filteredEdges } = useMemo(
    () => filterArchitectureGraph(currentGraph.nodes, currentGraph.edges, selectedCategory),
    [currentGraph.nodes, currentGraph.edges, selectedCategory]
  );

  const connectedInfo = useMemo(
    () => computeConnectedSubgraph(selectedNodeId, filteredEdges),
    [selectedNodeId, filteredEdges]
  );

  // Compute initial automatic layout only when layoutMode, layoutVersion, or graph topology changes
  const baseAutomaticPositions = useMemo(() => {
    const nodeById = new Map<string, GraphNodeData>();
    dependenciesGraph.nodes.forEach((n) => nodeById.set(n.id, n));
    workflowGraph.nodes.forEach((n) => {
      if (!nodeById.has(n.id)) nodeById.set(n.id, n);
    });
    const allNodes = Array.from(nodeById.values());
    const allEdges = dependenciesGraph.edges.length > 0 ? dependenciesGraph.edges : workflowGraph.edges;
    const positions: Record<string, { x: number; y: number }> = {};

    if (layoutMode === 'radial') {
      const centerNode = allNodes.find((n) => n.id.includes('Core') || n.isEntry) || allNodes[0];
      const others = allNodes.filter((n) => n.id !== centerNode?.id);
      const total = Math.max(1, others.length);
      const radius = Math.max(260, total * 32);

      if (centerNode) {
        positions[centerNode.id] = {
          x: 450 - NODE_WIDTH / 2,
          y: 340 - NODE_HEIGHT / 2,
        };
      }

      others.forEach((node, i) => {
        const angle = (i / total) * 2 * Math.PI;
        positions[node.id] = {
          x: Math.round(450 + radius * Math.cos(angle) - NODE_WIDTH / 2),
          y: Math.round(340 + radius * Math.sin(angle) - NODE_HEIGHT / 2),
        };
      });
      return positions;
    }

    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: layoutMode === 'tree' ? 'TB' : 'LR',
      nodesep: 38,
      ranksep: 92,
      marginx: 32,
      marginy: 32,
    });
    g.setDefaultEdgeLabel(() => ({}));

    allNodes.forEach((node) => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    allEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    try {
      dagre.layout(g);
    } catch {
      // fallback grid
    }

    allNodes.forEach((node, idx) => {
      const pos = g.node(node.id);
      positions[node.id] = {
        x: pos && Number.isFinite(pos.x) ? Math.round(pos.x - NODE_WIDTH / 2) : (idx % 4) * 240 + 60,
        y: pos && Number.isFinite(pos.y) ? Math.round(pos.y - NODE_HEIGHT / 2) : Math.floor(idx / 4) * 110 + 80,
      };
    });

    return positions;
  }, [dependenciesGraph.nodes, dependenciesGraph.edges, workflowGraph.nodes, workflowGraph.edges, layoutMode, layoutVersion]);

  // Seed initial positions for any nodes that do not have a position yet
  useEffect(() => {
    if (Object.keys(baseAutomaticPositions).length > 0) {
      seedNodePositions(baseAutomaticPositions);
    }
  }, [baseAutomaticPositions, seedNodePositions]);

  // Combine filtered nodes with their persistent manual/seeded positions
  const positionedNodes: PositionedNode[] = useMemo(() => {
    return filteredNodes.map((node) => {
      const saved = nodePositions[node.id] || baseAutomaticPositions[node.id] || { x: 100, y: 100 };
      return {
        ...node,
        x: saved.x,
        y: saved.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      };
    });
  }, [filteredNodes, nodePositions, baseAutomaticPositions]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    positionedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [positionedNodes]);

  const fitToView = useCallback(() => {
    if (positionedNodes.length === 0 || !containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (!clientWidth || !clientHeight) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    positionedNodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    });

    const graphWidth = Math.max(240, maxX - minX + 180);
    const graphHeight = Math.max(240, maxY - minY + 180);

    const scaleX = clientWidth / graphWidth;
    const scaleY = (clientHeight - 70) / graphHeight;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.32), 1.1);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({
      x: clientWidth / 2 - centerX * scale,
      y: (clientHeight + 36) / 2 - centerY * scale,
      scale,
    });
  }, [positionedNodes]);

  // Fit to view on initial mount and when layoutVersion changes (explicit reset or layout mode switch)
  const fitToViewRef = useRef(fitToView);
  fitToViewRef.current = fitToView;

  useEffect(() => {
    const timer = setTimeout(() => fitToViewRef.current(), 50);
    return () => clearTimeout(timer);
  }, [layoutMode, layoutVersion]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let initial = true;
    const ro = new ResizeObserver(() => {
      if (initial) {
        initial = false;
        fitToViewRef.current();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Global mouse/pointer move & up listeners for smooth node dragging and canvas panning
  useEffect(() => {
    if (!draggingNodeId && !isPanning) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragSessionRef.current) {
        const session = dragSessionRef.current;
        const dx = e.clientX - session.mouseX;
        const dy = e.clientY - session.mouseY;

        if (!session.moved && Math.hypot(dx, dy) >= 3) {
          session.moved = true;
          suppressNextClickRef.current = true;
        }

        if (session.moved) {
          const nextPos = applyNodeDragDelta(
            { x: session.startX, y: session.startY },
            { dx, dy },
            transform.scale
          );
          setNodePosition(session.nodeId, nextPos);
        }
        return;
      }

      if (isPanning) {
        setTransform((prev) => ({
          ...prev,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }));
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragSessionRef.current) {
        dragSessionRef.current = null;
        setDraggingNodeId(null);
      }
      if (isPanning) {
        setIsPanning(false);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingNodeId, isPanning, panStart, transform.scale, setNodePosition]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('.canvas-node') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: PositionedNode) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    suppressNextClickRef.current = false;
    dragSessionRef.current = {
      nodeId: node.id,
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: node.x,
      startY: node.y,
      moved: false,
    };
    setDraggingNodeId(node.id);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * zoomFactor, 0.3), 2.0);
      return { ...prev, scale: newScale };
    });
  };

  const handleZoom = (delta: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale + delta, 0.3), 2.0),
    }));
  };

  const handleResetLayout = () => {
    resetNodePositions();
    resetHighlighting();
    setTimeout(() => fitToViewRef.current(), 60);
  };

  return (
    <div
      ref={containerRef}
      data-testid="architecture-canvas"
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      className="relative flex-1 h-full overflow-hidden bg-tactical-grid select-none cursor-grab active:cursor-grabbing"
      style={{
        backgroundColor: 'var(--bg-main)',
      }}
    >
      {/* Top Floating Control Strip */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Mode & Layout selectors */}
          <div className="flex items-center gap-2 pointer-events-auto bg-[var(--panel-primary)]/95 backdrop-blur-md p-1.5 rounded-xl border shadow-sm" style={{ borderColor: 'var(--border-subtle)' }}>
            <div role="group" aria-label="Graph mode" className="flex items-center p-0.5 rounded-lg bg-[var(--surface-elevated)] border" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setGraphMode('dependencies')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  graphMode === 'dependencies'
                    ? 'bg-[var(--color-blue)] text-white shadow-xs font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Dependencies</span>
              </button>
              <button
                type="button"
                onClick={() => setGraphMode('workflow')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  graphMode === 'workflow'
                    ? 'bg-[var(--color-cyan)] text-white dark:text-[#080D18] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Workflow</span>
              </button>
            </div>

            <div role="group" aria-label="Layout mode" className="hidden sm:flex items-center gap-1 pl-2 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
              {(['dagre', 'tree', 'radial'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLayoutMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    layoutMode === mode
                      ? 'bg-[var(--surface-hover)] text-[var(--color-blue)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {mode === 'dagre' ? 'Graph' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Contextual Selection & Zoom Controls */}
          <div className="flex items-center gap-2 pointer-events-auto bg-[var(--panel-primary)]/95 backdrop-blur-md p-1.5 rounded-xl border shadow-sm" style={{ borderColor: 'var(--border-subtle)' }}>
            {selectedNodeId && (
              <button
                type="button"
                onClick={resetHighlighting}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-[var(--color-coral)] hover:bg-[var(--color-coral)]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Clear Highlight</span>
              </button>
            )}

            <div className="flex items-center gap-0.5 text-[var(--text-muted)]">
              <button
                type="button"
                onClick={() => handleZoom(0.15)}
                aria-label="Zoom in"
                title="Zoom in"
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(-0.15)}
                aria-label="Zoom out"
                title="Zoom out"
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={fitToView}
                aria-label="Fit to view"
                title="Fit to view"
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetLayout}
                aria-label="Reset layout"
                title="Reset layout"
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={toggleLegend}
                aria-label="Toggle legend"
                title="Toggle legend"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showLegend ? 'bg-[#7695FF]/15 text-[var(--color-blue)]' : 'hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Strip */}
        <div role="group" aria-label="Category filter" className="hidden md:flex items-center gap-1 self-start pointer-events-auto bg-[var(--panel-primary)]/90 backdrop-blur-md px-2 py-1 rounded-lg border shadow-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          {TOOLBAR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] font-semibold ring-1 ring-[var(--border-strong)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas Surface */}
      <div
        className="w-full h-full transform-gpu"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Edges Layer with Directional Arrowheads */}
        <svg className="absolute inset-0 w-[4000px] h-[4000px] pointer-events-none overflow-visible">
          <defs>
            <marker
              id="edge-arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--border-strong)" />
            </marker>
            <marker
              id="edge-arrow-highlight"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-blue)" />
            </marker>
            <marker
              id="edge-arrow-workflow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-cyan)" />
            </marker>
          </defs>

          {filteredEdges.map((edge) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const isHighlighted = connectedInfo ? connectedInfo.edgeIds.has(edge.id) : false;
            const isDimmed = connectedInfo ? !isHighlighted : false;
            const isWorkflow = graphMode === 'workflow';
            const isHovered = hoveredEdgeId === edge.id;

            const { pathData, midX, midY } = computeEdgeGeometry(source, target);

            const markerId =
              isHighlighted || isHovered
                ? isWorkflow
                  ? 'url(#edge-arrow-workflow)'
                  : 'url(#edge-arrow-highlight)'
                : isWorkflow
                ? 'url(#edge-arrow-workflow)'
                : 'url(#edge-arrow-default)';

            return (
              <g
                key={edge.id}
                data-edge-id={edge.id}
                data-source={edge.source}
                data-target={edge.target}
                className="cursor-pointer pointer-events-auto"
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
              >
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (edge.evidence) {
                      setActiveEvidenceEdge(edge);
                    }
                  }}
                />

                <path
                  d={pathData}
                  fill="none"
                  markerEnd={markerId}
                  stroke={
                    isHighlighted || isHovered
                      ? isWorkflow
                        ? 'var(--color-mint)'
                        : 'var(--color-blue)'
                      : isWorkflow
                      ? 'var(--color-cyan)'
                      : 'var(--border-strong)'
                  }
                  strokeWidth={isHighlighted || isHovered ? 2.5 : isWorkflow ? 2 : 1.5}
                  strokeDasharray={isWorkflow ? '6 4' : undefined}
                  className={`transition-opacity duration-150 ${
                    isDimmed ? 'opacity-15' : 'opacity-90'
                  }`}
                />

                {/* Hover relationship label for dependency edges */}
                {!isWorkflow && isHovered && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-42"
                      y="-10"
                      width="84"
                      height="20"
                      rx="4"
                      fill="var(--panel-primary)"
                      stroke="var(--color-blue)"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                    >
                      {edge.type || 'import'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Workflow Edge Evidence Buttons (Dynamically positioned at edge midpoints) */}
        {graphMode === 'workflow' &&
          filteredEdges.map((edge) => {
            if (!edge.label) return null;
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const { midX, midY } = computeEdgeGeometry(source, target);

            return (
              <button
                key={`wf-btn-${edge.id}`}
                type="button"
                aria-label={`Inspect workflow step: ${edge.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (edge.evidence) setActiveEvidenceEdge(edge);
                }}
                style={{
                  transform: `translate(${midX - 65}px, ${midY - 12}px)`,
                  backgroundColor: 'var(--panel-primary)',
                }}
                className="canvas-node absolute z-10 px-2.5 py-1 rounded-md border border-[var(--color-cyan)] text-[10px] font-mono font-medium text-[var(--text-primary)] hover:border-[var(--color-mint)] shadow-xs whitespace-nowrap cursor-pointer"
              >
                {edge.label}
              </button>
            );
          })}

        {/* HTML Interactive & Draggable Nodes Layer */}
        {positionedNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isDraggingThis = draggingNodeId === node.id;
          const isConnected = connectedInfo ? connectedInfo.nodeIds.has(node.id) : false;
          const isDimmed = connectedInfo ? !isConnected : false;
          const config = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.utility;

          return (
            <button
              key={node.id}
              type="button"
              data-node-id={node.id}
              data-x={node.x}
              data-y={node.y}
              aria-label={`Select node ${node.name} (${node.category})`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onClick={(e) => {
                e.stopPropagation();
                if (suppressNextClickRef.current) {
                  suppressNextClickRef.current = false;
                  return;
                }
                setSelectedNodeId(node.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedNodeId(node.id);
                }
              }}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                width: `${node.width}px`,
                height: `${node.height}px`,
                backgroundColor: 'var(--panel-primary)',
              }}
              className={`canvas-node group absolute rounded-xl p-3 border text-left transition-opacity duration-150 select-none ${
                isDraggingThis
                  ? 'cursor-grabbing border-[var(--color-cyan)] ring-2 ring-[var(--color-cyan)]/50 shadow-xl z-30'
                  : isSelected
                  ? 'cursor-grab border-[var(--color-blue)] ring-2 ring-[#7695FF]/40 z-20 shadow-md'
                  : isConnected
                  ? 'cursor-grab border-[var(--color-cyan)] ring-1 ring-[#45D9CF]/30 z-10'
                  : 'cursor-grab border-[var(--border-color)] hover:border-[var(--border-strong)] shadow-xs'
              } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className={`text-[10px] font-mono font-medium capitalize ${config.text}`}>
                    {node.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {node.lines && (
                    <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)]">
                      {node.lines}L
                    </span>
                  )}
                  <GripVertical className="w-3 h-3 text-[var(--text-muted)] opacity-40 group-hover:opacity-90 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-1">
                <span
                  title={node.path}
                  className="text-xs font-semibold font-mono text-[var(--text-primary)] truncate"
                >
                  {node.name}
                </span>

                {node.isEntry && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold text-[var(--color-blue)] bg-[#7695FF]/15">
                    ENTRY
                  </span>
                )}
              </div>

              <div className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                {node.path}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Status Strip for Active Selection */}
      <div
        className="absolute bottom-3 left-3 z-20 flex items-center gap-3 px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums pointer-events-none"
        style={{
          backgroundColor: 'var(--panel-primary)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <span>{filteredNodes.length} files</span>
        <span aria-hidden="true">·</span>
        <span>{filteredEdges.length} links</span>
        <span aria-hidden="true">·</span>
        <span className="text-[var(--text-muted)]">Drag nodes to arrange</span>
        {connectedInfo && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-[var(--color-cyan)] font-medium">
              {connectedInfo.incomingCount} in / {connectedInfo.outgoingCount} out
            </span>
          </>
        )}
      </div>

      {/* Workflow Evidence Popover Modal */}
      {activeEvidenceEdge && activeEvidenceEdge.evidence && (
        <div
          role="dialog"
          aria-label="Verified Execution Evidence"
          className="absolute bottom-14 left-4 z-30 max-w-md w-full p-4 rounded-xl shadow-xl border backdrop-blur-lg bg-[var(--panel-primary)]"
          style={{ borderColor: 'var(--color-cyan)' }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-[var(--color-cyan)]" />
              <span className="text-xs font-bold font-display text-[var(--text-primary)]">
                Verified Connection: {activeEvidenceEdge.label}
              </span>
            </div>
            <button
              type="button"
              aria-label="Close evidence detail"
              onClick={() => setActiveEvidenceEdge(null)}
              className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">
            {activeEvidenceEdge.evidence.description}
          </p>

          <div className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border mb-3 font-mono text-xs overflow-x-auto text-[var(--color-cyan)]" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="text-[10px] text-[var(--text-muted)] mb-1 tabular-nums">
              {activeEvidenceEdge.evidence.sourcePath} · Line {activeEvidenceEdge.evidence.line}
            </div>
            <code>{activeEvidenceEdge.evidence.snippet}</code>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                selectFile(activeEvidenceEdge.evidence!.sourcePath, activeEvidenceEdge.evidence!.line);
                openSourceViewer(activeEvidenceEdge.evidence!.line);
                setActiveEvidenceEdge(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <FileCode className="w-3.5 h-3.5 text-[var(--color-blue)]" />
              <span>Inspect Source</span>
            </button>

            <button
              type="button"
              onClick={() => {
                pinEvidence({
                  filePath: activeEvidenceEdge.evidence!.sourcePath,
                  line: activeEvidenceEdge.evidence!.line,
                  snippet: activeEvidenceEdge.evidence!.snippet,
                  description: activeEvidenceEdge.evidence!.description,
                });
                setActiveEvidenceEdge(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white dark:text-[#080D18] bg-[var(--color-mint)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Pin as Evidence</span>
            </button>
          </div>
        </div>
      )}

      {/* Legend Drawer */}
      <GraphLegend isOpen={showLegend} onClose={toggleLegend} />
    </div>
  );
};
