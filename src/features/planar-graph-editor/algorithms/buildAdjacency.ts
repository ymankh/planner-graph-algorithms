import type { Edge, NodeId, PointNode } from '../types/graph';
import { getUndirectedEdgeKey } from './graphKeys';

function angleForNeighbor(node: PointNode, neighbor: PointNode): number {
  return Math.atan2(neighbor.y - node.y, neighbor.x - node.x);
}

export function buildAdjacency(
  nodes: PointNode[],
  edges: Edge[],
): Map<NodeId, NodeId[]> {
  const nodeMap = new Map<NodeId, PointNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const adjacencySets = new Map<NodeId, Set<NodeId>>();
  for (const node of nodes) {
    adjacencySets.set(node.id, new Set<NodeId>());
  }

  const seenEdges = new Set<string>();
  for (const edge of edges) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode || edge.from === edge.to) {
      continue;
    }

    const edgeKey = getUndirectedEdgeKey(edge.from, edge.to);
    if (seenEdges.has(edgeKey)) {
      continue;
    }
    seenEdges.add(edgeKey);

    adjacencySets.get(edge.from)?.add(edge.to);
    adjacencySets.get(edge.to)?.add(edge.from);
  }

  const adjacency = new Map<NodeId, NodeId[]>();
  for (const node of nodes) {
    const neighbors = Array.from(adjacencySets.get(node.id) ?? []);
    neighbors.sort((left, right) => {
      const leftNode = nodeMap.get(left);
      const rightNode = nodeMap.get(right);

      if (!leftNode || !rightNode) {
        return left.localeCompare(right);
      }

      const leftAngle = angleForNeighbor(node, leftNode);
      const rightAngle = angleForNeighbor(node, rightNode);
      if (leftAngle !== rightAngle) {
        return leftAngle - rightAngle;
      }

      const leftDistance = (leftNode.x - node.x) ** 2 + (leftNode.y - node.y) ** 2;
      const rightDistance = (rightNode.x - node.x) ** 2 + (rightNode.y - node.y) ** 2;
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }

      return left.localeCompare(right);
    });

    adjacency.set(node.id, neighbors);
  }

  return adjacency;
}
