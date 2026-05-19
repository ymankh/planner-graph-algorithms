import { memo, useCallback, useMemo, type ComponentProps } from 'react';
import { FastLayer, Layer, Line, Stage } from 'react-konva';
import {
  buildPolygonPoints,
  type Edge,
  type Face,
  type NodeId,
  type PointNode,
} from 'graph-planner-algorithms';
import { GraphEdge } from './GraphEdge';
import { GraphNode } from './GraphNode';
import { SelectedFaceOverlay } from './SelectedFaceOverlay';

type GraphCanvasProps = {
  width: number;
  height: number;
  nodes: PointNode[];
  edges: Edge[];
  selectedNodeId: NodeId | null;
  faces: Face[];
  selectedFaceId: string | null;
  selectedFace: Face | null;
  hoveredFaceId: string | null;
  selectedFacePolygonPoints: number[];
  onCanvasClick: (x: number, y: number) => void;
  onNodeClick: (nodeId: NodeId) => void;
  onNodeDragEnd: (nodeId: NodeId, x: number, y: number) => void;
  onFaceHover: (faceId: string | null) => void;
  onFaceClick: (faceId: string) => void;
};

type RoomFacePolygon = {
  face: Face;
  points: number[];
};

type RoomFaceOverlayProps = {
  polygon: RoomFacePolygon;
  active: boolean;
  onHover: (faceId: string | null) => void;
  onClick: (faceId: string) => void;
};

const RoomFaceOverlay = memo(function RoomFaceOverlay({
  polygon,
  active,
  onHover,
  onClick,
}: RoomFaceOverlayProps) {
  const handleMouseEnter = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Line>['onMouseEnter']>>[0]) => {
      const stage = event.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'pointer';
      }
      onHover(polygon.face.id);
    },
    [onHover, polygon.face.id],
  );

  const handleMouseLeave = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Line>['onMouseLeave']>>[0]) => {
      const stage = event.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'default';
      }
      onHover(null);
    },
    [onHover],
  );

  const handleClick = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Line>['onClick']>>[0]) => {
      event.cancelBubble = true;
      onClick(polygon.face.id);
    },
    [onClick, polygon.face.id],
  );

  const handleTap = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Line>['onTap']>>[0]) => {
      event.cancelBubble = true;
      onClick(polygon.face.id);
    },
    [onClick, polygon.face.id],
  );

  return (
    <Line
      points={polygon.points}
      closed
      fill={active ? 'rgba(251, 191, 36, 0.24)' : 'rgba(45, 212, 191, 0.01)'}
      stroke={active ? 'rgba(251, 191, 36, 0.9)' : 'rgba(45, 212, 191, 0)'}
      strokeWidth={active ? 3 : 1}
      lineJoin="round"
      listening
      perfectDrawEnabled={false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTap={handleTap}
    />
  );
});

function GraphCanvasComponent({
  width,
  height,
  nodes,
  edges,
  selectedNodeId,
  faces,
  selectedFaceId,
  selectedFace,
  hoveredFaceId,
  selectedFacePolygonPoints,
  onCanvasClick,
  onNodeClick,
  onNodeDragEnd,
  onFaceHover,
  onFaceClick,
}: GraphCanvasProps) {
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node] as const)), [nodes]);
  const roomFacePolygons = useMemo(
    () =>
      faces
        .filter((face) => !face.isOuter)
        .map((face) => ({
          face,
          points: buildPolygonPoints(face.nodeIds, nodeMap),
        }))
        .filter((polygon) => polygon.points.length >= 6),
    [faces, nodeMap],
  );
  const stageStyle = useMemo(() => ({ display: 'block' as const }), []);

  const addNodeFromStageEvent = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Stage>['onMouseDown']>>[0]) => {
      const stage = event.target.getStage();
      if (stage && event.target === stage) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          onCanvasClick(pointer.x, pointer.y);
        }
      }
    },
    [onCanvasClick],
  );

  const handleStageTouchStart = useCallback(
    (event: Parameters<NonNullable<ComponentProps<typeof Stage>['onTouchStart']>>[0]) => {
      const stage = event.target.getStage();
      if (stage && event.target === stage) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          onCanvasClick(pointer.x, pointer.y);
        }
      }
    },
    [onCanvasClick],
  );

  return (
    <div className="canvas-frame">
      <Stage
        width={width}
        height={height}
        style={stageStyle}
        onMouseDown={addNodeFromStageEvent}
        onTouchStart={handleStageTouchStart}
      >
        <FastLayer listening={false}>
          <SelectedFaceOverlay
            points={selectedFacePolygonPoints}
            visible={Boolean(selectedFace && !selectedFace.isOuter)}
          />

          {edges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) {
              return null;
            }

            return <GraphEdge key={edge.id} edge={edge} from={from} to={to} />;
          })}
        </FastLayer>
        <Layer>
          {roomFacePolygons.map((polygon) => (
            <RoomFaceOverlay
              key={polygon.face.id}
              polygon={polygon}
              active={polygon.face.id === hoveredFaceId || polygon.face.id === selectedFaceId}
              onHover={onFaceHover}
              onClick={onFaceClick}
            />
          ))}
        </Layer>
        <Layer>
          {nodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              connecting={selectedNodeId === node.id}
              onClick={onNodeClick}
              onDragEnd={onNodeDragEnd}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export const GraphCanvas = memo(GraphCanvasComponent);
