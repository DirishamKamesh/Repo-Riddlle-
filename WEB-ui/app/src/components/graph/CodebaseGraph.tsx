import { useCallback, useMemo, useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
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
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function CodebaseGraph() {
  const {
    graphData,
    selectedFilePath,
    selectFile,
    filterCategory,
    setCategoryFilter,
  } = useInvestigationStore();
  const { isLegendOpen, setLegendOpen, setInspectorTab } = useUIStore();
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [layoutMode, setLayoutMode] = useState<'graph' | 'tree'>('graph');

  // Direction: TB for graph, LR for tree hierarchy
  const direction = layoutMode === 'graph' ? 'TB' : 'LR';

  // Transform graph data into React Flow nodes & edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
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

    const rawEdges: Edge[] = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#39D6A0', strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#39D6A0',
        width: 14,
        height: 14,
      },
    }));

    return getLayoutedElements(rawNodes, rawEdges, direction);
  }, [graphData, selectedFilePath, filterCategory, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync initial nodes whenever layout or filter recalculates
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
      setInspectorTab('file');
    },
    [selectFile, setInspectorTab]
  );

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

  // Fallback state if graph data is missing or empty
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="relative w-full h-full bg-canvas-base flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted mb-3">
          <Network className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">
          Architecture Graph Unavailable
        </h3>
        <p className="text-body-xs text-text-secondary max-w-sm mb-4">
          Verified static import edges could not be resolved for this view. Navigate using the File Explorer on the left.
        </p>
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
        selectedCategory={filterCategory}
        onSelectCategory={setCategoryFilter}
      />

      {isLegendOpen && <GraphLegend onClose={() => setLegendOpen(false)} />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
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
        <span>Nodes: {graphData?.nodeCount || 0}</span>
        <span>Verified Edges: {graphData?.edgeCount || 0}</span>
      </div>
    </div>
  );
}
