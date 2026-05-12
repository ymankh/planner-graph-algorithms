import type { NodeId, PointNode } from '../types/graph';

export function buildPolygonPoints(
  nodeIds: NodeId[],
  nodeMap: Map<NodeId, PointNode>,
): number[] {
  const points: number[] = [];

  for (const nodeId of nodeIds) {
    const node = nodeMap.get(nodeId);
    if (!node) {
      return [];
    }
    points.push(node.x, node.y);
  }

  return points;
}
