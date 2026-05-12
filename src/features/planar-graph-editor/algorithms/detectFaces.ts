import type { Edge, Face, NodeId, PointNode } from '../types/graph';
import { buildAdjacency } from './buildAdjacency';
import { getDirectedEdgeKey } from './graphKeys';
import { polygonSignedArea } from './polygonArea';

const EPSILON = 1e-7;

function canonicalizeCycle(nodeIds: NodeId[]): string {
  const sequences: string[][] = [nodeIds, [...nodeIds].reverse()];
  let bestKey = '';
  let initialized = false;

  for (const sequence of sequences) {
    for (let offset = 0; offset < sequence.length; offset += 1) {
      const rotated = [...sequence.slice(offset), ...sequence.slice(0, offset)];
      const key = rotated.join('|');
      if (!initialized || key < bestKey) {
        bestKey = key;
        initialized = true;
      }
    }
  }

  return bestKey;
}

function uniqueNodeCount(nodeIds: NodeId[]): number {
  return new Set(nodeIds).size;
}

export function detectFaces(nodes: PointNode[], edges: Edge[]): Face[] {
  if (nodes.length === 0 || edges.length === 0) {
    return [];
  }

  const nodeMap = new Map<NodeId, PointNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const adjacency = buildAdjacency(nodes, edges);
  const visitedDirected = new Set<string>();
  const rawFaces: Array<{ nodeIds: NodeId[]; area: number }> = [];

  for (const node of nodes) {
    const neighbors = adjacency.get(node.id) ?? [];
    for (const neighbor of neighbors) {
      const startKey = getDirectedEdgeKey(node.id, neighbor);
      if (visitedDirected.has(startKey)) {
        continue;
      }

      const faceNodeIds: NodeId[] = [];
      let from = node.id;
      let to = neighbor;
      let safety = 0;

      while (true) {
        const currentKey = getDirectedEdgeKey(from, to);
        if (visitedDirected.has(currentKey)) {
          break;
        }

        visitedDirected.add(currentKey);
        faceNodeIds.push(from);

        const nextNeighbors = adjacency.get(to) ?? [];
        if (nextNeighbors.length === 0) {
          break;
        }

        const indexOfFrom = nextNeighbors.indexOf(from);
        if (indexOfFrom < 0) {
          break;
        }

        // Half-edge traversal:
        // at the destination vertex, take the neighbor immediately before the
        // incoming vertex in circular order. This keeps the walk consistently on
        // one side of the directed edge and traces a face boundary.
        const nextIndex = (indexOfFrom - 1 + nextNeighbors.length) % nextNeighbors.length;
        const nextNode = nextNeighbors[nextIndex];

        from = to;
        to = nextNode;
        safety += 1;

        if (from === node.id && to === neighbor) {
          break;
        }

        if (safety > edges.length * 4) {
          break;
        }
      }

      if (faceNodeIds.length < 3 || uniqueNodeCount(faceNodeIds) < 3) {
        continue;
      }

      const area = polygonSignedArea(faceNodeIds, nodeMap);
      if (Math.abs(area) <= EPSILON) {
        continue;
      }

      rawFaces.push({ nodeIds: faceNodeIds, area });
    }
  }

  const uniqueFaces = new Map<string, { nodeIds: NodeId[]; area: number }>();
  for (const face of rawFaces) {
    const key = canonicalizeCycle(face.nodeIds);
    if (!uniqueFaces.has(key)) {
      uniqueFaces.set(key, face);
    }
  }

  const faces = Array.from(uniqueFaces.entries()).map(([key, face]) => ({
    id: key,
    nodeIds: face.nodeIds,
    area: face.area,
    isOuter: false,
  }));

  if (faces.length === 0) {
    return [];
  }

  let outerFaceIndex = 0;
  let largestAbsArea = Math.abs(faces[0].area);
  for (let index = 1; index < faces.length; index += 1) {
    const absArea = Math.abs(faces[index].area);
    if (absArea > largestAbsArea) {
      largestAbsArea = absArea;
      outerFaceIndex = index;
    }
  }

  return faces
    .map((face, index) => ({
      ...face,
      isOuter: index === outerFaceIndex,
    }))
    .sort((left, right) => {
      if (left.isOuter !== right.isOuter) {
        return Number(left.isOuter) - Number(right.isOuter);
      }
      const leftArea = Math.abs(left.area);
      const rightArea = Math.abs(right.area);
      if (leftArea !== rightArea) {
        return rightArea - leftArea;
      }
      return left.id.localeCompare(right.id);
    });
}
