import { bench, describe } from 'vitest';
import type { Edge, PointNode } from '../src/features/planar-graph-editor/types/graph';
import { detectFaces } from '../src/features/planar-graph-editor/algorithms/detectFaces';

function buildTriangulatedGrid(size: number): { nodes: PointNode[]; edges: Edge[] } {
  const nodes: PointNode[] = [];
  const edges: Edge[] = [];
  const nodeId = (x: number, y: number) => `n${x}_${y}`;
  const edgeId = (a: string, b: string) => `${a}__${b}`;

  for (let y = 0; y <= size; y += 1) {
    for (let x = 0; x <= size; x += 1) {
      nodes.push({ id: nodeId(x, y), x: x * 40, y: y * 40 });
    }
  }

  for (let y = 0; y <= size; y += 1) {
    for (let x = 0; x <= size; x += 1) {
      if (x < size) {
        const from = nodeId(x, y);
        const to = nodeId(x + 1, y);
        edges.push({ id: edgeId(from, to), from, to });
      }
      if (y < size) {
        const from = nodeId(x, y);
        const to = nodeId(x, y + 1);
        edges.push({ id: edgeId(from, to), from, to });
      }
      if (x < size && y < size) {
        const from = nodeId(x, y);
        const to = nodeId(x + 1, y + 1);
        edges.push({ id: edgeId(from, to), from, to });
      }
    }
  }

  return { nodes, edges };
}

const graph = buildTriangulatedGrid(12);

describe('detectFaces benchmark', () => {
  bench('detectFaces on a 12x12 triangulated grid', () => {
    detectFaces(graph.nodes, graph.edges);
  });
});
