import { memo, useMemo } from 'react';
import { FastLayer, Layer, Stage } from 'react-konva';
import type { Edge, Face, NodeId, PointNode } from 'graph-planner-algorithms';
import { GraphEdge } from './GraphEdge';
import { GraphNode } from './GraphNode';
import { SelectedFaceOverlay } from './SelectedFaceOverlay';

type GraphCanvasProps = {
  width: number;
  height: number;
  nodes: PointNode[];
  edges: Edge[];
  selectedNodeId: NodeId | null;
  selectedFace: Face | null;
  selectedFacePolygonPoints: number[];
  onCanvasClick: (x: number, y: number) => void;
  onNodeClick: (nodeId: NodeId) => void;
  onNodeDragEnd: (nodeId: NodeId, x: number, y: number) => void;
};

function GraphCanvasComponent({
  width,
  height,
  nodes,
  edges,
  selectedNodeId,
  selectedFace,
  selectedFacePolygonPoints,
  onCanvasClick,
  onNodeClick,
  onNodeDragEnd,
}: GraphCanvasProps) {
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node] as const)), [nodes]);

  return (
    <div className="canvas-frame">
      <Stage
        width={width}
        height={height}
        style={{ display: 'block' }}
        onMouseDown={(event) => {
          const stage = event.target.getStage();
          if (stage && event.target === stage) {
            const pointer = stage.getPointerPosition();
            if (pointer) {
              onCanvasClick(pointer.x, pointer.y);
            }
          }
        }}
        onTouchStart={(event) => {
          const stage = event.target.getStage();
          if (stage && event.target === stage) {
            const pointer = stage.getPointerPosition();
            if (pointer) {
              onCanvasClick(pointer.x, pointer.y);
            }
          }
        }}
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
