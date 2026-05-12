import { performance } from 'node:perf_hooks';
import { detectFaces, type Edge, type PointNode } from '../src';

type BenchRow = {
  edges: number;
  rooms: number;
  iterations: number;
  meanMs: number;
  opsPerSec: number;
};

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

function measure(fn: () => void, targetMs = 250): { iterations: number; meanMs: number; opsPerSec: number } {
  let iterations = 0;
  let elapsed = 0;

  while (iterations < 10 || elapsed < targetMs) {
    const start = performance.now();
    fn();
    elapsed += performance.now() - start;
    iterations += 1;
  }

  const meanMs = elapsed / iterations;
  const opsPerSec = 1000 / meanMs;

  return { iterations, meanMs, opsPerSec };
}

function run() {
  const edgeCounts = [4, 16, 50, 100, 1000];
  const rows: BenchRow[] = [];

  for (const edges of edgeCounts) {
    const graph = buildClosedFanGraph(edges);
    const rooms = detectFaces(graph.nodes, graph.edges).filter((face) => !face.isOuter).length;

    detectFaces(graph.nodes, graph.edges);
    const result = measure(() => {
      detectFaces(graph.nodes, graph.edges);
    });

    rows.push({
      edges,
      rooms,
      iterations: result.iterations,
      meanMs: Number(result.meanMs.toFixed(4)),
      opsPerSec: Number(result.opsPerSec.toFixed(2)),
    });
  }

  console.table(rows);
}

run();
