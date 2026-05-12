import type { Edge, NodeId, PointNode } from '../types/graph';
import { getUndirectedEdgeKey } from './graphKeys';

type Point = Pick<PointNode, 'x' | 'y'>;

const EPSILON = 1e-9;

function orientation(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function onSegment(a: Point, b: Point, c: Point): boolean {
  return (
    Math.min(a.x, c.x) - EPSILON <= b.x &&
    b.x <= Math.max(a.x, c.x) + EPSILON &&
    Math.min(a.y, c.y) - EPSILON <= b.y &&
    b.y <= Math.max(a.y, c.y) + EPSILON
  );
}

function segmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (
    ((o1 > EPSILON && o2 < -EPSILON) || (o1 < -EPSILON && o2 > EPSILON)) &&
    ((o3 > EPSILON && o4 < -EPSILON) || (o3 < -EPSILON && o4 > EPSILON))
  ) {
    return true;
  }

  if (Math.abs(o1) <= EPSILON && onSegment(p1, p2, q1)) return true;
  if (Math.abs(o2) <= EPSILON && onSegment(p1, q2, q1)) return true;
  if (Math.abs(o3) <= EPSILON && onSegment(p2, p1, q2)) return true;
  if (Math.abs(o4) <= EPSILON && onSegment(p2, q1, q2)) return true;

  return false;
}

export function hasEdgeCrossings(nodes: PointNode[], edges: Edge[]): boolean {
  const nodeMap = new Map<NodeId, PointNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const normalizedEdges = edges.filter((edge) => {
    if (edge.from === edge.to) {
      return false;
    }
    return Boolean(nodeMap.get(edge.from) && nodeMap.get(edge.to));
  });

  for (let first = 0; first < normalizedEdges.length; first += 1) {
    const edgeA = normalizedEdges[first];
    const nodeA1 = nodeMap.get(edgeA.from);
    const nodeA2 = nodeMap.get(edgeA.to);
    if (!nodeA1 || !nodeA2) {
      continue;
    }

    for (let second = first + 1; second < normalizedEdges.length; second += 1) {
      const edgeB = normalizedEdges[second];
      const nodeB1 = nodeMap.get(edgeB.from);
      const nodeB2 = nodeMap.get(edgeB.to);
      if (!nodeB1 || !nodeB2) {
        continue;
      }

      if (
        edgeA.from === edgeB.from ||
        edgeA.from === edgeB.to ||
        edgeA.to === edgeB.from ||
        edgeA.to === edgeB.to
      ) {
        continue;
      }

      if (getUndirectedEdgeKey(edgeA.from, edgeA.to) === getUndirectedEdgeKey(edgeB.from, edgeB.to)) {
        continue;
      }

      if (segmentsIntersect(nodeA1, nodeA2, nodeB1, nodeB2)) {
        return true;
      }
    }
  }

  return false;
}
