# Graph Planner

Interactive planar graph editor built with React, TypeScript, Vite, Konva, and React Konva.

Graph Planner lets you place points on a canvas, connect them with straight edges, detect planar regions, and highlight selected faces. The graph algorithms are kept separate from the React UI so they can be reused independently in other projects.

![Graph Planner preview](src/assets/hero.png)

## Features

- Add, drag, and connect graph nodes on a Konva canvas.
- Detect inner and outer planar faces from an undirected embedded graph.
- Highlight selected regions directly on the canvas.
- Warn when edges cross and the graph is no longer planar.
- Run graph analysis in a web worker to keep the editor responsive.
- Reusable pure TypeScript graph utilities for face detection, adjacency building, polygon area, edge keys, and crossing detection.

## Tech Stack

- React 19
- TypeScript
- Vite
- Konva and React Konva
- Vitest
- ESLint

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev           # Start Vite development server
npm run build         # Type-check and build for production
npm run preview       # Preview the production build
npm run lint          # Run ESLint
npm run test          # Run Vitest tests
npm run test:watch    # Run Vitest in watch mode
npm run bench         # Run benchmarks
npm run bench:report  # Generate the face detection benchmark report
```

## How To Use

1. Click empty canvas space to add a point.
2. Click one point, then another point, to create an edge.
3. Drag points to reshape the graph.
4. Press **Detect regions** after editing.
5. Select an inner region from the face list to highlight it on the canvas.

## Project Structure

```txt
src/
  features/
    planar-graph-editor/
      algorithms/   Pure graph and geometry algorithms
      components/   React and React Konva UI components
      hooks/        Editor state and derived graph analysis hooks
      types/        Shared graph types
      utils/        Geometry helpers
      workers/      Background graph analysis worker
      index.ts      Public feature exports
```

## Reusing The Editor

The planar graph editor feature exposes the main component, shared types, and core algorithms from:

```ts
import {
  PlanarGraphEditor,
  detectFaces,
  buildAdjacency,
  hasEdgeCrossings,
  polygonSignedArea,
  buildPolygonPoints,
  type PointNode,
  type Edge,
  type Face,
} from './features/planar-graph-editor';
```

Use the full editor component:

```tsx
import { PlanarGraphEditor } from './features/planar-graph-editor';

export function App() {
  return <PlanarGraphEditor />;
}
```

Or reuse only the algorithms:

```ts
import { detectFaces, type Edge, type PointNode } from './features/planar-graph-editor';

const nodes: PointNode[] = [
  { id: 'a', x: 120, y: 120 },
  { id: 'b', x: 320, y: 120 },
  { id: 'c', x: 220, y: 280 },
];

const edges: Edge[] = [
  { id: 'a-b', from: 'a', to: 'b' },
  { id: 'b-c', from: 'b', to: 'c' },
  { id: 'a-c', from: 'a', to: 'c' },
];

const faces = detectFaces(nodes, edges);
```

## Notes

- Face detection assumes straight-line edges and node coordinates in canvas space.
- Crossing edges are reported separately because face detection is intended for planar graphs.
- Derived graph data is not stored as source state; it is computed from nodes and edges.
