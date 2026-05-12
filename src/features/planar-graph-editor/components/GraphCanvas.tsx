import { memo } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import type { Edge, Face, NodeId, PointNode } from '../types/graph';
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
  onNodeDragMove: (nodeId: NodeId, x: number, y: number) => void;
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
  onNodeDragMove,
}: GraphCanvasProps) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node] as const));

  return (
    <div className="canvas-frame">
      <Stage width={width} height={height} style={{ display: 'block' }}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#07111f"
            onMouseDown={(event) => {
              const stage = event.target.getStage();
              const pointer = stage?.getPointerPosition();
              if (pointer) {
                onCanvasClick(pointer.x, pointer.y);
              }
            }}
            onTouchStart={(event) => {
              const stage = event.target.getStage();
              const pointer = stage?.getPointerPosition();
              if (pointer) {
                onCanvasClick(pointer.x, pointer.y);
              }
            }}
          />

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

          {nodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              connecting={selectedNodeId === node.id}
              onClick={onNodeClick}
              onDragMove={onNodeDragMove}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export const GraphCanvas = memo(GraphCanvasComponent);
