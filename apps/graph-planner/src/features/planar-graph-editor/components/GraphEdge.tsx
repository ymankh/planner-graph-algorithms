import { memo } from 'react';
import { Line } from 'react-konva';
import type { Edge, PointNode } from 'graph-planner-algorithms';

type GraphEdgeProps = {
  edge: Edge;
  from: PointNode;
  to: PointNode;
};

function GraphEdgeComponent({ edge, from, to }: GraphEdgeProps) {
  return (
    <Line
      id={edge.id}
      points={[from.x, from.y, to.x, to.y]}
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

export const GraphEdge = memo(GraphEdgeComponent);
