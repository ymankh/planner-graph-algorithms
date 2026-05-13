# Graph Planner

Interactive planar graph editor and npm-ready planar graph algorithm package built with React, TypeScript, Vite, Konva, and React Konva.

Graph Planner lets you place points on a canvas, connect them with straight edges, detect planar regions, and highlight selected faces. The graph algorithms are kept separate from the React UI so they can be reused independently in other projects.

![Graph Planner preview](apps/graph-planner/src/assets/hero.png)

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
npm run build:package # Build the npm package files
npm run preview       # Preview the production build
npm run lint          # Run ESLint
npm run test          # Run Vitest tests
npm run test:watch    # Run Vitest in watch mode
npm run bench         # Run benchmarks
npm run bench:report  # Generate the face detection benchmark report
npm run pack:dry-run  # Preview the files that will be published to npm
```

## How To Use

1. Click empty canvas space to add a point.
2. Click one point, then another point, to create an edge.
3. Drag points to reshape the graph.
4. Press **Detect regions** after editing.
5. Select an inner region from the face list to highlight it on the canvas.

## Project Structure

```txt
apps/
  graph-planner/                 React, Vite, Konva editor app
    src/
      features/
        planar-graph-editor/
          components/            React and React Konva UI
          hooks/                 Editor state and app integration
          workers/               Background analysis worker

packages/
  graph-planner-algorithms/      Publishable npm package
    src/
      algorithms/                Pure graph and geometry algorithms
      types/                     Shared graph types
      utils/                     Geometry helpers
      index.ts                   Public package exports
```

## NPM Package

The framework-independent algorithms have their own package README:

- Package page: [graph-planner-algorithms](https://www.npmjs.com/package/graph-planner-algorithms)
- Local package docs: [packages/graph-planner-algorithms/README.md](packages/graph-planner-algorithms/README.md)

## Live Demo

 [planner-graph-algorithms-graph-plan.vercel.app](https://planner-graph-algorithms-graph-plan.vercel.app)

## Package Separation

The npm package lives in `packages/graph-planner-algorithms` and contains only pure TypeScript source. It does not import React, React DOM, Konva, React Konva, workers, or app components.

The React app lives in `apps/graph-planner` and imports the package through `graph-planner-algorithms`.

## Reusing The Editor Locally

The planar graph editor feature exposes the main component and re-exports the package algorithms from the app feature entry:

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
} from './apps/graph-planner/src/features/planar-graph-editor';
```

Use the full editor component:

```tsx
import { PlanarGraphEditor } from './apps/graph-planner/src/features/planar-graph-editor';

export function App() {
  return <PlanarGraphEditor />;
}
```

## Notes

- Face detection assumes straight-line edges and node coordinates in canvas space.
- Crossing edges are reported separately because face detection is intended for planar graphs.
- Derived graph data is not stored as source state; it is computed from nodes and edges.

## License

MIT
