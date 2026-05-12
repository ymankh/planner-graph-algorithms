import { describe, expect, it } from 'vitest';
import { buildAdjacency } from './buildAdjacency';
import { detectFaces } from './detectFaces';
import { hasEdgeCrossings } from './segmentIntersection';
import { polygonSignedArea } from './polygonArea';
import type { Edge, PointNode } from '../types/graph';

function node(id: string, x: number, y: number): PointNode {
  return { id, x, y };
}

function edge(id: string, from: string, to: string): Edge {
  return { id, from, to };
}

describe('detectFaces', () => {
  it('returns an outer face for a triangle and ignores duplicate, self, and missing edges', () => {
    const nodes = [node('a', 0, 0), node('b', 4, 0), node('c', 2, 3)];
    const edges = [
      edge('e1', 'a', 'b'),
      edge('e2', 'b', 'c'),
      edge('e3', 'c', 'a'),
      edge('duplicate', 'b', 'a'),
      edge('self', 'a', 'a'),
      edge('missing', 'a', 'z'),
    ];

    const adjacency = buildAdjacency(nodes, edges);
    expect(adjacency.get('a')).toEqual(['b', 'c']);
    expect(adjacency.get('b')).toEqual(['c', 'a']);
    expect(adjacency.get('c')).toEqual(['a', 'b']);

    const faces = detectFaces(nodes, edges);
    expect(faces).toHaveLength(1);
    expect(faces[0]?.isOuter).toBe(true);
    expect(new Set(faces[0]?.nodeIds)).toEqual(new Set(['a', 'b', 'c']));
    expect(Math.abs(faces[0]?.area ?? 0)).toBeCloseTo(6, 6);
  });

  it('detects two inner triangular faces and one outer face in a square with a diagonal', () => {
    const nodes = [
      node('a', 0, 0),
      node('b', 4, 0),
      node('c', 4, 4),
      node('d', 0, 4),
    ];

    const edges = [
      edge('ab', 'a', 'b'),
      edge('bc', 'b', 'c'),
      edge('cd', 'c', 'd'),
      edge('da', 'd', 'a'),
      edge('ac', 'a', 'c'),
    ];

    const faces = detectFaces(nodes, edges);
    expect(faces).toHaveLength(3);

    const outer = faces.find((face) => face.isOuter);
    const inner = faces.filter((face) => !face.isOuter);

    expect(outer).toBeDefined();
    expect(inner).toHaveLength(2);
    expect(Math.abs(outer?.area ?? 0)).toBeCloseTo(16, 6);
    expect(inner.map((face) => Math.abs(face.area)).sort((left, right) => left - right)).toEqual([
      8,
      8,
    ]);
    expect(inner.every((face) => face.nodeIds.length === 3)).toBe(true);
  });

  it('returns no regions for disconnected or degenerate input', () => {
    const nodes = [
      node('a', 0, 0),
      node('b', 3, 0),
      node('c', 6, 0),
      node('d', 10, 10),
    ];

    const edges = [
      edge('ab', 'a', 'b'),
      edge('bc', 'b', 'c'),
      edge('bad', 'a', 'missing'),
      edge('self', 'd', 'd'),
    ];

    expect(detectFaces(nodes, edges)).toEqual([]);
  });

  it('flags crossing edges', () => {
    const nodes = [
      node('a', 0, 0),
      node('b', 4, 4),
      node('c', 0, 4),
      node('d', 4, 0),
    ];

    const edges = [edge('ab', 'a', 'b'), edge('cd', 'c', 'd')];

    expect(hasEdgeCrossings(nodes, edges)).toBe(true);
  });

  it('does not flag non-crossing adjacent edges', () => {
    const nodes = [node('a', 0, 0), node('b', 4, 0), node('c', 4, 4)];
    const edges = [edge('ab', 'a', 'b'), edge('bc', 'b', 'c')];

    expect(hasEdgeCrossings(nodes, edges)).toBe(false);
  });

  it('computes signed polygon area using ordered node ids', () => {
    const nodes = [node('a', 0, 0), node('b', 4, 0), node('c', 4, 3)];
    const nodeMap = new Map(nodes.map((item) => [item.id, item] as const));

    expect(polygonSignedArea(['a', 'b', 'c'], nodeMap)).toBeCloseTo(6, 6);
    expect(polygonSignedArea(['a', 'c', 'b'], nodeMap)).toBeCloseTo(-6, 6);
  });
});
