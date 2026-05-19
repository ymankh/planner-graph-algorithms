import { memo, useCallback, type ComponentProps } from 'react';
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

  const handleClick = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Group>['onClick']>>[0]) => {
      event.cancelBubble = true;
      onClick(node.id);
    },
    [node.id, onClick],
  );

  const handleTap = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Group>['onTap']>>[0]) => {
      event.cancelBubble = true;
      onClick(node.id);
    },
    [node.id, onClick],
  );

  const handleDragEnd = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Group>['onDragEnd']>>[0]) => {
      onDragEnd(node.id, event.target.x(), event.target.y());
    },
    [node.id, onDragEnd],
  );

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable
      listening
      perfectDrawEnabled={false}
      onClick={handleClick}
      onTap={handleTap}
      onDragEnd={handleDragEnd}
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

export const GraphNode = memo(
  GraphNodeComponent,
  (previous, next) =>
    previous.node.id === next.node.id &&
    previous.node.x === next.node.x &&
    previous.node.y === next.node.y &&
    previous.selected === next.selected &&
    previous.connecting === next.connecting &&
    previous.onClick === next.onClick &&
    previous.onDragEnd === next.onDragEnd,
);
