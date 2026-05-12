import { useMemo } from 'react';
import { buildAdjacency } from '../algorithms/buildAdjacency';
import { detectFaces } from '../algorithms/detectFaces';
import { getUndirectedEdgeKey } from '../algorithms/graphKeys';
import { hasEdgeCrossings } from '../algorithms/segmentIntersection';
import { buildPolygonPoints } from '../utils/geometry';
import type { Edge, Face, NodeId, PointNode } from '../types/graph';

export function useGraphDerivedData(
  nodes: PointNode[],
  edges: Edge[],
  selectedFaceId: string | null,
) {
  const nodeMap = useMemo(() => {
    const map = new Map<NodeId, PointNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  const edgeKeySet = useMemo(() => {
    const keys = new Set<string>();
    for (const edge of edges) {
      keys.add(getUndirectedEdgeKey(edge.from, edge.to));
    }
    return keys;
  }, [edges]);

  const adjacency = useMemo(() => buildAdjacency(nodes, edges), [nodes, edges]);
  const faces = useMemo(() => detectFaces(nodes, edges), [nodes, edges]);
  const hasCrossings = useMemo(() => hasEdgeCrossings(nodes, edges), [nodes, edges]);

  const selectedFace = useMemo<Face | null>(() => {
    if (!selectedFaceId) {
      return null;
    }
    return faces.find((face) => face.id === selectedFaceId) ?? null;
  }, [faces, selectedFaceId]);

  const selectedFacePolygonPoints = useMemo(() => {
    if (!selectedFace || selectedFace.isOuter) {
      return [];
    }

    return buildPolygonPoints(selectedFace.nodeIds, nodeMap);
  }, [nodeMap, selectedFace]);

  return {
    nodeMap,
    edgeKeySet,
    adjacency,
    faces,
    hasCrossings,
    selectedFace,
    selectedFacePolygonPoints,
  };
}
