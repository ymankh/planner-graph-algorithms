import { useCallback, useRef, useState } from 'react';
import type { Edge, Face, NodeId, PointNode } from '../types/graph';
import { getUndirectedEdgeKey } from '../algorithms/graphKeys';

type UsePlanarGraphEditorOptions = {
  initialNodes?: PointNode[];
  initialEdges?: Edge[];
};

function createNodeId(index: number): NodeId {
  return `n${index}`;
}

function createEdgeId(index: number): string {
  return `e${index}`;
}

export function usePlanarGraphEditor(options: UsePlanarGraphEditorOptions = {}) {
  const [nodes, setNodes] = useState<PointNode[]>(() => options.initialNodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(() => options.initialEdges ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);

  const nextNodeIdRef = useRef(nodes.length + 1);
  const nextEdgeIdRef = useRef(edges.length + 1);

  const addNode = useCallback((x: number, y: number) => {
    const node: PointNode = {
      id: createNodeId(nextNodeIdRef.current),
      x,
      y,
    };
    nextNodeIdRef.current += 1;
    setNodes((current) => [...current, node]);
  }, []);

  const moveNode = useCallback((nodeId: NodeId, x: number, y: number) => {
    setNodes((current) =>
      current.map((node) => (node.id === nodeId ? { ...node, x, y } : node)),
    );
  }, []);

  const connectNodes = useCallback((from: NodeId, to: NodeId) => {
    if (from === to) {
      return;
    }

    const edgeKey = getUndirectedEdgeKey(from, to);
    setEdges((current) => {
      const alreadyExists = current.some(
        (edge) => getUndirectedEdgeKey(edge.from, edge.to) === edgeKey,
      );
      if (alreadyExists) {
        return current;
      }

      const edge: Edge = {
        id: createEdgeId(nextEdgeIdRef.current),
        from,
        to,
      };
      nextEdgeIdRef.current += 1;
      return [...current, edge];
    });
  }, []);

  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedFaceId(null);
    nextNodeIdRef.current = 1;
    nextEdgeIdRef.current = 1;
  }, []);

  const selectFace = useCallback((faceId: string | null) => {
    setSelectedFaceId(faceId);
  }, []);

  const selectNodeForConnection = useCallback((nodeId: NodeId | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const setSelectedFace = useCallback((face: Face | null) => {
    setSelectedFaceId(face?.id ?? null);
  }, []);

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedFaceId,
    addNode,
    moveNode,
    connectNodes,
    clearGraph,
    selectFace,
    selectNodeForConnection,
    resetSelection,
    setSelectedFace,
  };
}
