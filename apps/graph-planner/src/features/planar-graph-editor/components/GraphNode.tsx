import { memo } from 'react';
import { Circle, Group, Text } from 'react-konva';
import type { PointNode } from 'graph-planner-algorithms';

type GraphNodeProps = {
  node: PointNode;
  selected: boolean;
  connecting: boolean;
  onClick: (nodeId: string) => void;
  onDragEnd: (nodeId: string, x: number, y: number) => void;
};

function GraphNodeComponent({ node, selected, connecting, onClick, onDragEnd }: GraphNodeProps) {
  const fill = selected ? '#f97316' : connecting ? '#22c55e' : '#38bdf8';

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable
      listening
      perfectDrawEnabled={false}
      onClick={(event) => {
        event.cancelBubble = true;
        onClick(node.id);
      }}
      onTap={(event) => {
        event.cancelBubble = true;
        onClick(node.id);
      }}
      onDragEnd={(event) => {
        onDragEnd(node.id, event.target.x(), event.target.y());
      }}
    >
      <Circle
        x={0}
        y={0}
        radius={9}
        fill={fill}
        stroke={selected ? '#fed7aa' : '#cffafe'}
        strokeWidth={2}
        perfectDrawEnabled={false}
      />
      <Text
        x={-18}
        y={12}
        width={36}
        align="center"
        text={node.id}
        fontSize={11}
        fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace"
        fill="#e2e8f0"
        listening={false}
        perfectDrawEnabled={false}
      />
    </Group>
  );
}

export const GraphNode = memo(GraphNodeComponent);
