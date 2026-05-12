# graph-planner-algorithms

Pure TypeScript utilities for working with straight-line planar graphs.

This package contains only graph data types and geometry algorithms. It has no React, React DOM, Konva, React Konva, browser worker, or UI dependency.

## Install

```bash
npm i graph-planner-algorithms
```

## Quick Example

```ts
import {
  detectFaces,
  hasEdgeCrossings,
  type Edge,
  type PointNode,
} from 'graph-planner-algorithms';

const nodes: PointNode[] = [
  { id: 'a', x: 0, y: 0 },
  { id: 'b', x: 4, y: 0 },
  { id: 'c', x: 4, y: 4 },
  { id: 'd', x: 0, y: 4 },
  { id: 'e', x: 2, y: 2 },
];

const edges: Edge[] = [
  { id: 'ab', from: 'a', to: 'b' },
  { id: 'bc', from: 'b', to: 'c' },
  { id: 'cd', from: 'c', to: 'd' },
  { id: 'da', from: 'd', to: 'a' },
  { id: 'ae', from: 'a', to: 'e' },
  { id: 'be', from: 'b', to: 'e' },
  { id: 'ce', from: 'c', to: 'e' },
  { id: 'de', from: 'd', to: 'e' },
];

if (hasEdgeCrossings(nodes, edges)) {
  throw new Error('The graph is not planar as drawn.');
}

const faces = detectFaces(nodes, edges);
const innerFaces = faces.filter((face) => !face.isOuter);
```

## Data Model

### `NodeId`

```ts
type NodeId = string;
```

Unique node identifier. Edge endpoints reference nodes by this value.

### `PointNode`

```ts
type PointNode = {
  id: NodeId;
  x: number;
  y: number;
};
```

A graph vertex with 2D coordinates. Coordinates can use any consistent Cartesian or canvas coordinate system.

### `Edge`

```ts
type Edge = {
  id: string;
  from: NodeId;
  to: NodeId;
};
```

An undirected straight-line edge between two nodes. The `id` is caller-owned metadata. The algorithms treat `{ from: 'a', to: 'b' }` and `{ from: 'b', to: 'a' }` as the same edge for adjacency and face detection.

### `Face`

```ts
type Face = {
  id: string;
  nodeIds: NodeId[];
  area: number;
  isOuter: boolean;
};
```

A detected region boundary.

- `id`: stable canonical key derived from the face node cycle.
- `nodeIds`: ordered node ids around the boundary.
- `area`: signed polygon area from the ordered boundary.
- `isOuter`: `true` for the unbounded outside face.

Use `Math.abs(face.area)` when you need display area.

## API

### `detectFaces(nodes, edges)`

```ts
function detectFaces(nodes: PointNode[], edges: Edge[]): Face[];
```

Detects faces in a straight-line graph using half-edge traversal.

Behavior:

- Ignores self edges.
- Ignores edges that reference missing nodes.
- Deduplicates undirected duplicate edges.
- Removes degenerate regions with fewer than three unique nodes.
- Marks the largest absolute-area face as `isOuter: true`.
- Sorts inner faces before the outer face.

Important assumptions:

- Edges are straight line segments between node coordinates.
- The graph should be planar as drawn. Use `hasEdgeCrossings` before `detectFaces` if input may contain crossing edges.
- Face boundaries are returned as node ids, not coordinate arrays.

Example:

```ts
const faces = detectFaces(nodes, edges);
const selectableFaces = faces.filter((face) => !face.isOuter);
```

### `buildAdjacency(nodes, edges)`

```ts
function buildAdjacency(
  nodes: PointNode[],
  edges: Edge[],
): Map<NodeId, NodeId[]>;
```

Builds an undirected adjacency map from graph data.

The returned neighbor arrays are sorted by geometric angle around each node using `Math.atan2`. This order is required by the face traversal algorithm and is also useful for custom planar graph tools.

Behavior:

- Includes every input node as a key.
- Uses an empty array for isolated nodes.
- Ignores self edges, missing-node edges, and duplicate undirected edges.

Example:

```ts
const adjacency = buildAdjacency(nodes, edges);
const neighborsOfA = adjacency.get('a') ?? [];
```

### `hasEdgeCrossings(nodes, edges)`

```ts
function hasEdgeCrossings(nodes: PointNode[], edges: Edge[]): boolean;
```

Returns `true` when any pair of non-adjacent edges intersects.

Behavior:

- Ignores edge pairs that share an endpoint.
- Ignores self edges and edges with missing endpoints.
- Treats duplicate undirected edges as non-crossings.
- Uses an `O(E^2)` pairwise segment intersection check.

Example:

```ts
if (hasEdgeCrossings(nodes, edges)) {
  console.warn('Face detection may be invalid for this drawing.');
}
```

### `polygonSignedArea(faceNodeIds, nodeMap)`

```ts
function polygonSignedArea(
  faceNodeIds: NodeId[],
  nodeMap: Map<NodeId, PointNode>,
): number;
```

Computes signed polygon area using the shoelace formula.

Returns:

- Positive or negative area depending on vertex order.
- `0` if fewer than three ids are provided.
- `0` if any referenced node is missing from `nodeMap`.

Example:

```ts
const nodeMap = new Map(nodes.map((node) => [node.id, node]));
const signedArea = polygonSignedArea(['a', 'b', 'c'], nodeMap);
const displayArea = Math.abs(signedArea);
```

### `buildPolygonPoints(nodeIds, nodeMap)`

```ts
function buildPolygonPoints(
  nodeIds: NodeId[],
  nodeMap: Map<NodeId, PointNode>,
): number[];
```

Converts ordered node ids into a flat coordinate array:

```ts
[x1, y1, x2, y2, x3, y3]
```

This is useful for canvas libraries such as Konva, but the function itself has no canvas dependency.

Returns an empty array if any referenced node is missing.

### `getUndirectedEdgeKey(a, b)`

```ts
function getUndirectedEdgeKey(a: NodeId, b: NodeId): string;
```

Returns a normalized key for an undirected edge:

```ts
getUndirectedEdgeKey('b', 'a') === getUndirectedEdgeKey('a', 'b');
```

The key format is currently `min|max`.

### `getDirectedEdgeKey(from, to)`

```ts
function getDirectedEdgeKey(from: NodeId, to: NodeId): string;
```

Returns a directional half-edge key. This is useful when tracking traversal state.

The key format is currently `from>to`.

## Exports

```ts
export type { NodeId, PointNode, Edge, Face };

export {
  buildAdjacency,
  buildPolygonPoints,
  detectFaces,
  getDirectedEdgeKey,
  getUndirectedEdgeKey,
  hasEdgeCrossings,
  polygonSignedArea,
};
```

## Package Contents

The published npm package includes only:

- `dist`
- `LICENSE`
- `README.md`

React app code, Konva components, assets, workers, and app build output are not included.

## License

MIT

## Development

```bash
npm run test
npm run build
npm run pack:dry-run
```
