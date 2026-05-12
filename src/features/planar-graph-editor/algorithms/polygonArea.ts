import type { NodeId, PointNode } from '../types/graph';

export function polygonSignedArea(
  faceNodeIds: NodeId[],
  nodeMap: Map<NodeId, PointNode>,
): number {
  if (faceNodeIds.length < 3) {
    return 0;
  }

  let area = 0;
  for (let index = 0; index < faceNodeIds.length; index += 1) {
    const current = nodeMap.get(faceNodeIds[index]);
    const next = nodeMap.get(faceNodeIds[(index + 1) % faceNodeIds.length]);

    if (!current || !next) {
      return 0;
    }

    area += current.x * next.y - next.x * current.y;
  }

  return area / 2;
}
