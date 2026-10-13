import { useCallback, useMemo, useState, useEffect } from 'react';
import { Network, Workflow, ShieldCheck } from 'lucide-react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

import { useInvestigationStore } from '../../store/investigation-store';
import { useUIStore } from '../../store/ui-store';
import { FileNode } from './FileNode';
import { GraphToolbar } from './GraphToolbar';
import { GraphLegend } from './GraphLegend';
import { WorkflowEdge } from '../../types';

const nodeTypes: NodeTypes = {
  fileNode: FileNode,
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 90 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: (nodeWithPosition ? nodeWithPosition.x : 0) - NODE_WIDTH / 2,
        y: (nodeWithPosition ? nodeWithPosition.y : 0) - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

const RELATION_COLORS: Record<string, string> = {
  boots: '#00F0FF',
  mounts_router: '#38BDF8',
  applies_middleware: '#F59E0B',
  invokes_handler: '#A855F7',
  accesses_model: '#39D6A0',
  calls_service: '#818CF8',
  renders_component: '#EC4899',
};

export function CodebaseGraph() {
  const {
    graphData,
    workflowGraphData,
    graphViewMode,
    setGraphViewMode,
    selectedFilePath,
    selectFile,
    filterCategory,
    setCategoryFilter,
  } = useInvestigationStore();
  const { isLegendOpen, setLegendOpen, setInspectorTab } = useUIStore();
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [layoutMode, setLayoutMode] = useState<'graph' | 'tree'>('graph');
  const [selectedWorkflowEdge, setSelectedWorkflowEdge] = useState<WorkflowEdge | null>(null);

  // Direction: TB for graph, LR for tree hierarchy
  const direction = layoutMode === 'graph' ? 'TB' : 'LR';

  // Transform active graph data (Dependency or Workflow) into React Flow elements
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (graphViewMode === 'workflow') {
      if (!workflowGraphData || workflowGraphData.nodes.length === 0) {
        return { nodes: [], edges: [] };
      }

      const rawNodes: Node[] = workflowGraphData.nodes.map((node) => ({
        id: node.id,
        type: 'fileNode',
        position: { x: 0, y: 0 },
        data: {
          label: node.label,
          filePath: node.filePath,
          category: node.category,
          summary: node.summary,
        },
        selected: node.filePath === selectedFilePath,
      }));

      const rawEdges: Edge[] = (workflowGraphData.edges || []).map((edge) => {
        const color = RELATION_COLORS[edge.relation] || '#38BDF8';
        const isMiddleware = edge.relation === 'applies_middleware';

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated: true,
          label: edge.label,
          labelStyle: { fill: '#F1F5F9', fontSize: 10, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#0F172A', fillOpacity: 0.85, stroke: color, strokeWidth: 1 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
          style: {
            stroke: color,
            strokeWidth: 2,
            strokeDasharray: isMiddleware ? '5 5' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
            width: 14,
            height: 14,
          },
          data: edge as unknown as Record<string, unknown>,
        };
      });

      return getLayoutedElements(rawNodes, rawEdges, direction);
    }

    // Dependency Graph mode (default)
    if (!graphData || graphData.nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    const rawNodes: Node[] = graphData.nodes.map((node) => {
      const isCategoryMatch = !filterCategory || node.category === filterCategory;
      return {
        id: node.id,
        type: 'fileNode',
        position: { x: 0, y: 0 },
        data: {
          label: node.label,
          filePath: node.filePath,
          category: node.category,
          summary: node.summary,
        },
        selected: node.filePath === selectedFilePath,
        style: {
          opacity: isCategoryMatch ? 1 : 0.25,
          transition: 'opacity 0.2s ease',
        },
      };
    });

    const rawEdges: Edge[] = graphData.edges.map((edge) => {
      const isTypeOnly = Boolean(edge.isTypeOnly);
      const color = isTypeOnly ? '#60A5FA' : '#39D6A0';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: !isTypeOnly,
        label: edge.label,
        labelStyle: { fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#0F172A', fillOpacity: 0.8 },
        labelBgPadding: [3, 2] as [number, number],
        labelBgBorderRadius: 4,
        style: {
          stroke: color,
          strokeWidth: isTypeOnly ? 1.2 : 1.5,
          strokeDasharray: isTypeOnly ? '4 4' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 12,
          height: 12,
        },
      };
    });

    return getLayoutedElements(rawNodes, rawEdges, direction);
  }, [graphData, workflowGraphData, graphViewMode, selectedFilePath, filterCategory, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync initial nodes whenever layout, mode, or filter recalculates
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Update selected state whenever selectedFilePath changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === selectedFilePath,
      }))
    );
  }, [selectedFilePath, setNodes]);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      selectFile(node.id);
      setSelectedWorkflowEdge(null);
      setInspectorTab('file');
    },
    [selectFile, setInspectorTab]
  );

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    if (edge.data) {
      setSelectedWorkflowEdge(edge.data as unknown as WorkflowEdge);
    }
  }, []);

  const handleZoomIn = () => reactFlowInstance?.zoomIn();
  const handleZoomOut = () => reactFlowInstance?.zoomOut();
  const handleFitView = () => reactFlowInstance?.fitView({ padding: 0.2 });
  const handleResetLayout = () => {
    const layouted = getLayoutedElements(nodes, edges, direction);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    reactFlowInstance?.fitView({ padding: 0.2 });
  };

  const handleToggleLayoutMode = (mode: 'graph' | 'tree') => {
    setLayoutMode(mode);
    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.2 });
    }, 50);
  };

  const currentNodes = graphViewMode === 'workflow' ? workflowGraphData?.nodes : graphData?.nodes;

  // Fallback state if graph data is missing or empty
  if (!currentNodes || currentNodes.length === 0) {
    return (
      <div className="relative w-full h-full bg-canvas-base flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted mb-3">
          {graphViewMode === 'workflow' ? (
            <Workflow className="w-6 h-6 text-accent-emerald" />
          ) : (
            <Network className="w-6 h-6 text-accent-blue" />
          )}
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">
          {graphViewMode === 'workflow'
            ? 'Workflow Graph Unavailable'
            : 'Architecture Graph Unavailable'}
        </h3>
        <p className="text-body-xs text-text-secondary max-w-sm mb-4">
          {graphViewMode === 'workflow'
            ? 'No verifiable execution pipelines (Express routes, app listeners, or component trees) were found.'
            : 'Verified static import edges could not be resolved for this view. Navigate using the File Explorer on the left.'}
        </p>
        {graphViewMode === 'workflow' && (
          <button
            onClick={() => setGraphViewMode('dependency')}
            className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs text-text-primary hover:bg-surface-elevated/80"
          >
            Switch to Dependencies View
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-canvas-base overflow-hidden">
      <GraphToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onResetLayout={handleResetLayout}
        onToggleLegend={() => setLegendOpen(!isLegendOpen)}
        isLegendOpen={isLegendOpen}
        layoutMode={layoutMode}
        onToggleLayoutMode={handleToggleLayoutMode}
        graphViewMode={graphViewMode}
        onToggleGraphViewMode={setGraphViewMode}
        selectedCategory={filterCategory}
        onSelectCategory={setCategoryFilter}
      />

      {isLegendOpen && (
        <GraphLegend
          onClose={() => setLegendOpen(false)}
          graphViewMode={graphViewMode}
        />
      )}

      {/* Selected Workflow Edge Evidence Card */}
      {selectedWorkflowEdge && (
        <div className="absolute top-20 right-4 z-20 w-84 rounded-xl bg-surface-primary/95 backdrop-blur-md border border-accent-blue/40 p-3.5 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-accent-blue uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Execution Evidence
            </span>
            <button
              onClick={() => setSelectedWorkflowEdge(null)}
              className="text-text-muted hover:text-text-primary text-xs font-mono p-0.5"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="text-text-secondary">
              <span className="text-text-muted">Relation: </span>
              <span className="font-mono font-bold text-accent-emerald">
                {selectedWorkflowEdge.relation}
              </span>
            </div>
            <div className="text-text-secondary">
              <span className="text-text-muted">Origin: </span>
              <span className="font-mono text-text-primary">
                {selectedWorkflowEdge.evidence.filePath}:{selectedWorkflowEdge.evidence.line}
              </span>
            </div>
            <p className="text-text-muted text-[10px] leading-relaxed">
              {selectedWorkflowEdge.evidence.description}
            </p>
            <div className="p-2 rounded bg-canvas-base border border-border font-mono text-[10px] text-accent-emerald overflow-x-auto">
              <code>{selectedWorkflowEdge.evidence.snippet}</code>
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#2A3441"
        />
      </ReactFlow>

      {/* Floating status metadata pill */}
      <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-surface-primary/80 backdrop-blur-md border border-border text-[11px] font-mono text-text-muted pointer-events-none flex items-center gap-3">
        {graphViewMode === 'workflow' ? (
          <>
            <span>Active Modules: {workflowGraphData?.nodeCount || 0}</span>
            <span className="text-accent-emerald font-semibold">
              Workflow Paths: {workflowGraphData?.edgeCount || 0}
            </span>
            <span>Mode: Execution</span>
          </>
        ) : (
          <>
            <span>Nodes: {graphData?.nodeCount || 0}</span>
            <span>Verified Edges: {graphData?.edgeCount || 0}</span>
            {graphData?.coverage && (
              <span className="text-accent-blue">
                Analyzed: {graphData.coverage.analyzedFiles}/{graphData.coverage.eligibleFiles}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
