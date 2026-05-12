Create a performant React + TypeScript app using React Konva.

Goal:
Build an interactive planar graph editor where the user can place points, connect them with straight lines, detect all planar regions/faces, show them in a list, and highlight a selected region on the canvas.

The solution must be organized, reusable, and easy to repurpose in other apps. Do not put everything in one component.

File structure:

```txt
src/
  features/
    planar-graph-editor/
      components/
        PlanarGraphEditor.tsx
        GraphCanvas.tsx
        GraphNode.tsx
        GraphEdge.tsx
        SelectedFaceOverlay.tsx
        FaceList.tsx
        EditorToolbar.tsx
        PlanarityWarning.tsx

      hooks/
        usePlanarGraphEditor.ts
        useGraphDerivedData.ts

      algorithms/
        detectFaces.ts
        buildAdjacency.ts
        segmentIntersection.ts
        polygonArea.ts
        graphKeys.ts

      types/
        graph.ts

      utils/
        geometry.ts

      index.ts
```

Architecture requirements:

1. `types/graph.ts`
   Define reusable graph types only:

```ts
export type NodeId = string;

export type PointNode = {
  id: NodeId;
  x: number;
  y: number;
};

export type Edge = {
  id: string;
  from: NodeId;
  to: NodeId;
};

export type Face = {
  id: string;
  nodeIds: NodeId[];
  area: number;
  isOuter: boolean;
};
```

2. `algorithms/`
   All graph and geometry algorithms must be pure, framework-independent TypeScript functions.

They must not import React, React Konva, or UI code.

Required functions:

```ts
export function buildAdjacency(
  nodes: PointNode[],
  edges: Edge[]
): Map<NodeId, NodeId[]>;

export function detectFaces(
  nodes: PointNode[],
  edges: Edge[]
): Face[];

export function polygonSignedArea(
  faceNodeIds: NodeId[],
  nodeMap: Map<NodeId, PointNode>
): number;

export function hasEdgeCrossings(
  nodes: PointNode[],
  edges: Edge[]
): boolean;

export function getUndirectedEdgeKey(
  a: NodeId,
  b: NodeId
): string;

export function getDirectedEdgeKey(
  from: NodeId,
  to: NodeId
): string;
```

3. `hooks/`
   React-specific state and memoization should live in hooks.

`usePlanarGraphEditor.ts` should own only source-of-truth editor state:

* nodes
* edges
* selected node for connecting
* selected face id

It should expose reusable editor actions:

* add node
* move node
* connect nodes
* clear graph
* select face
* select node for connection

`useGraphDerivedData.ts` should compute derived data using `useMemo`:

* node map
* edge key set
* detected faces
* crossing warning
* selected face
* selected face polygon points

Do not store derived faces in React state unless absolutely necessary.

4. `components/`
   Components should be small, focused, and reusable.

Responsibilities:

* `PlanarGraphEditor.tsx`

  * Feature composition root.
  * Connect hooks with presentational components.
  * Should contain minimal logic.

* `GraphCanvas.tsx`

  * Renders the Konva stage/layer.
  * Handles canvas click for adding nodes.
  * Receives nodes, edges, selected face, and callbacks as props.

* `GraphNode.tsx`

  * Memoized node rendering.
  * Renders draggable circle and label.
  * Emits click and drag callbacks.

* `GraphEdge.tsx`

  * Memoized edge rendering.
  * Renders one line between two nodes.

* `SelectedFaceOverlay.tsx`

  * Draws the selected inner face polygon.
  * Should not know how faces are detected.

* `FaceList.tsx`

  * Renders detected regions.
  * Emits selected face id.

* `EditorToolbar.tsx`

  * Clear button.
  * Detect regions button if needed.
  * Basic instructions.

* `PlanarityWarning.tsx`

  * Shows warning when crossing edges exist.

5. `index.ts`
   Export reusable public API:

```ts
export { PlanarGraphEditor } from './components/PlanarGraphEditor';

export type {
  NodeId,
  PointNode,
  Edge,
  Face,
} from './types/graph';

export {
  detectFaces,
} from './algorithms/detectFaces';

export {
  buildAdjacency,
} from './algorithms/buildAdjacency';

export {
  hasEdgeCrossings,
} from './algorithms/segmentIntersection';
```

This should allow other apps to reuse:

* the full editor component
* only the face detection algorithm
* only the graph types
* only the geometry helpers

Core app requirements:

1. Canvas interaction

* Use `react-konva`.
* User can click empty canvas to create a point/node.
* Render each point as a draggable circle with a small label/id.
* User can connect two points by clicking point A, then point B.
* Render connections as straight lines.
* Prevent duplicate edges and self-edges.
* Add a “Clear” button.
* Add a “Detect regions” button.
* Show short help text explaining the interaction.

2. Data structures
   Use simple normalized structures optimized for lookup:

```ts
type NodeId = string;

type PointNode = {
  id: NodeId;
  x: number;
  y: number;
};

type Edge = {
  id: string;
  from: NodeId;
  to: NodeId;
};

type Face = {
  id: string;
  nodeIds: NodeId[];
  area: number;
  isOuter: boolean;
};
```

Internally, use:

* `Map<NodeId, PointNode>` for node lookup.
* `Map<NodeId, Set<NodeId>>` during adjacency construction.
* `Map<NodeId, NodeId[]>` for sorted adjacency.
* `Set<string>` for edge existence checks using normalized edge keys like `minId|maxId`.
* `Set<string>` for visited directed half-edges using keys like `from>to`.

3. Face detection algorithm
   Implement face detection using a half-edge / DCEL-style traversal.

Important:

* Do not enumerate all cycles.
* Detect only planar faces/regions.
* Assume the graph is planar as drawn, but add crossing detection warnings.
* Time complexity after adjacency construction should be close to `O(V + E log D)`, where `D` is max node degree, due to sorting neighbors by angle.
* Face traversal itself should be `O(E)`.

Algorithm instructions:

* Build adjacency from the edges.
* For each node, sort its neighbors by geometric angle around the node using:

```ts
Math.atan2(neighbor.y - node.y, neighbor.x - node.x)
```

* Treat each undirected edge as two directed half-edges.
* For every directed edge `(u, v)` that has not been visited:

  * Start a new face walk.
  * Add `u` to the face boundary.
  * Mark `(u, v)` as visited.
  * At vertex `v`, find the index of `u` in `v`’s sorted neighbor list.
  * Select the next neighbor using a consistent rule:

    * To walk one side of the directed edge, use the neighbor immediately before `u` in circular order.
    * Example:

```ts
const nextIndex = (indexOfU - 1 + neighbors.length) % neighbors.length;
const w = neighbors[nextIndex];
```

* Continue with directed edge `(v, w)`.
* Stop when the traversal returns to the starting directed edge.
* Store each completed walk as a face.
* Compute polygon signed area using the shoelace formula.
* Mark the outer face as `isOuter: true`.

  * Prefer detecting the outer face as the face with the largest absolute area.
  * Inner regions should have `isOuter: false`.
* Remove invalid faces with fewer than 3 unique vertices.
* Deduplicate faces if needed by canonicalizing their node id cycle.

4. Performance requirements

* Keep geometry and graph algorithms in pure utility functions.
* Use `useMemo` for:

  * node map
  * edge key set
  * computed faces
  * crossing warnings
  * selected face polygon points
* Use `useCallback` for event handlers.
* Avoid unnecessary re-renders of all nodes/edges when selection changes.
* Split rendering into memoized components:

  * `GraphNode`
  * `GraphEdge`
  * `SelectedFaceOverlay`
  * `FaceList`
* Use `React.memo` where appropriate.
* Keep face detection pure and deterministic.
* Avoid storing derived data in React state unless necessary.
* Store only source-of-truth state:

  * nodes
  * edges
  * currently selected node for connecting
  * selected face id
* Recompute derived faces from nodes/edges.

5. Segment crossing detection
   Add a basic line segment intersection algorithm:

* Check every pair of edges.
* Ignore pairs sharing a node.
* Use orientation / cross-product tests.
* If any two non-adjacent edges intersect, show a warning:
  “This drawing has crossing edges, so it is not planar as drawn. Region detection may be incorrect.”
* Keep this as a separate utility function.
* It can be `O(E²)` for now, but structure it so it can later be replaced by a sweep-line algorithm.

6. Region list

* Show a sidebar list of detected faces.
* Each item should show:

  * region id
  * ordered node ids
  * absolute area rounded to two decimals
  * whether it is outer or inner
* Clicking an inner region selects it.
* Clicking the outer region should either do nothing or show that the outer face cannot be colored.

7. Region highlighting

* When a region is selected, draw a filled Konva polygon over that region.
* Build polygon points from the selected face’s ordered node ids.
* Use a transparent fill so nodes and edges remain visible.
* Do not fill the outer face.
* Keep the overlay behind nodes and edges but above the stage background.

8. Edge cases
   Handle:

* no nodes
* isolated nodes
* edges with missing nodes
* disconnected planar components
* duplicate edges
* dragging nodes after faces are detected
* very small or near-zero area faces

9. Reusability rules

* Do not couple face detection to React or Konva.
* Do not couple graph algorithms to UI state.
* Keep algorithms importable in any TypeScript app.
* Keep components configurable by props where reasonable.
* Make `PlanarGraphEditor` usable as a drop-in component.
* Export all reusable types and algorithms from `index.ts`.
* Prefer pure functions over hidden side effects.
* Avoid global mutable state.
* Avoid hardcoding app-specific names outside the feature folder.

10. Code style

* Provide the full code for all files.
* Use functional components and hooks.
* Use TypeScript.
* Use Tailwind classes for layout if available.
* Do not use external graph libraries.
* Keep the code readable but optimized.
* Include comments explaining the half-edge face traversal algorithm, especially how the next directed edge is selected from the sorted neighbor order.
* Make the implementation easy to extend later with line-splitting, snapping, undo/redo, spatial indexing, and a proper DCEL structure.
