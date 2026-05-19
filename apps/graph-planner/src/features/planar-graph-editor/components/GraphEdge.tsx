import { memo, useMemo } from 'react';
import { Line } from 'react-konva';
import type { Edge, PointNode } from 'graph-planner-algorithms';

type GraphEdgeProps = {
  edge: Edge;
  from: PointNode;
  to: PointNode;
};

function GraphEdgeComponent({ edge, from, to }: GraphEdgeProps) {
  const points = useMemo(() => [from.x, from.y, to.x, to.y], [from.x, from.y, to.x, to.y]);

  return (
    <Line
      id={edge.id}
      points={points}
      stroke="#67e8f9"
      strokeWidth={2}
      lineCap="round"
      lineJoin="round"
      opacity={0.85}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
}

export const GraphEdge = memo(
  GraphEdgeComponent,
  (previous, next) =>
    previous.edge.id === next.edge.id &&
    previous.from.x === next.from.x &&
    previous.from.y === next.from.y &&
    previous.to.x === next.to.x &&
    previous.to.y === next.to.y,
);
