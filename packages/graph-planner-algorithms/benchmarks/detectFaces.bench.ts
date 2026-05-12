import { bench, describe } from 'vitest';
import { detectFaces, type Edge, type PointNode } from '../src';

function buildClosedFanGraph(edgeCount: number): { nodes: PointNode[]; edges: Edge[] } {
  if (edgeCount < 4) {
    throw new Error('edgeCount must be at least 4');
  }

  if (edgeCount === 4) {
    return buildCycleGraph(4);
  }

  const diagonalCount = Math.floor((edgeCount - 3) / 2);
  const outerVertexCount = edgeCount - diagonalCount;
  const nodes: PointNode[] = [];
  const edges: Edge[] = [];
  const radius = 240;
  const centerX = 300;
  const centerY = 300;

  for (let index = 0; index < outerVertexCount; index += 1) {
    const angle = (index / outerVertexCount) * Math.PI * 2;
    nodes.push({
      id: `n${index}`,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  for (let index = 0; index < outerVertexCount; index += 1) {
    const from = `n${index}`;
    const to = `n${(index + 1) % outerVertexCount}`;
    edges.push({ id: `e${edges.length}`, from, to });
  }

  for (let index = 2; index < 2 + diagonalCount; index += 1) {
    const from = 'n0';
    const to = `n${index}`;
    edges.push({ id: `e${edges.length}`, from, to });
  }

  return { nodes, edges };
}

function buildCycleGraph(edgeCount: number): { nodes: PointNode[]; edges: Edge[] } {
  const nodes: PointNode[] = [];
  const edges: Edge[] = [];
  const radius = 240;
  const centerX = 300;
  const centerY = 300;

  for (let index = 0; index < edgeCount; index += 1) {
    const angle = (index / edgeCount) * Math.PI * 2;
    nodes.push({
      id: `n${index}`,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  for (let index = 0; index < edgeCount; index += 1) {
    const from = `n${index}`;
    const to = `n${(index + 1) % edgeCount}`;
    edges.push({ id: `e${index}`, from, to });
  }

  return { nodes, edges };
}

function addBenchmark(edgeCount: number) {
  const graph = buildClosedFanGraph(edgeCount);
  const rooms = detectFaces(graph.nodes, graph.edges).filter((face) => !face.isOuter).length;

  bench(`detectFaces on ${edgeCount} edges (rooms: ${rooms})`, () => {
    detectFaces(graph.nodes, graph.edges);
  });
}

describe('detectFaces benchmark', () => {
  addBenchmark(4);
  addBenchmark(16);
  addBenchmark(50);
  addBenchmark(100);
  addBenchmark(1000);
});
