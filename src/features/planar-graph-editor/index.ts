export { PlanarGraphEditor } from './components/PlanarGraphEditor';

export type { NodeId, PointNode, Edge, Face } from './types/graph';

export { detectFaces } from './algorithms/detectFaces';

export { buildAdjacency } from './algorithms/buildAdjacency';

export { hasEdgeCrossings } from './algorithms/segmentIntersection';

export { polygonSignedArea } from './algorithms/polygonArea';

export { buildPolygonPoints } from './utils/geometry';
