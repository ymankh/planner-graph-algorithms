import type { NodeId } from '../types/graph';

export function getUndirectedEdgeKey(a: NodeId, b: NodeId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getDirectedEdgeKey(from: NodeId, to: NodeId): string {
  return `${from}>${to}`;
}
