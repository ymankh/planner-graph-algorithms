export type {
  Edge,
  Face,
  NodeId,
  PointNode,
} from './types/graph';

export {
  buildAdjacency,
} from './algorithms/buildAdjacency';

export {
  detectFaces,
} from './algorithms/detectFaces';

export {
  getDirectedEdgeKey,
  getUndirectedEdgeKey,
} from './algorithms/graphKeys';

export {
  polygonSignedArea,
} from './algorithms/polygonArea';

export {
  hasEdgeCrossings,
} from './algorithms/segmentIntersection';

export {
  buildPolygonPoints,
} from './utils/geometry';
