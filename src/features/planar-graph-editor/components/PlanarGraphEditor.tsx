import { useCallback, useEffect, useRef, useState } from 'react';
import { useGraphDerivedData } from '../hooks/useGraphDerivedData';
import { usePlanarGraphEditor } from '../hooks/usePlanarGraphEditor';
import type { Edge, PointNode } from '../types/graph';
import { GraphCanvas } from './GraphCanvas';
import { EditorToolbar } from './EditorToolbar';
import { FaceList } from './FaceList';
import { PlanarityWarning } from './PlanarityWarning';

type PlanarGraphEditorProps = {
  initialNodes?: PointNode[];
  initialEdges?: Edge[];
  className?: string;
};

export function PlanarGraphEditor({
  initialNodes,
  initialEdges,
  className,
}: PlanarGraphEditorProps) {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedFaceId,
    addNode,
    moveNode,
    connectNodes,
    clearGraph,
    selectFace,
    selectNodeForConnection,
  } = usePlanarGraphEditor({ initialNodes, initialEdges });
  const derived = useGraphDerivedData(nodes, edges, selectedFaceId);
  const stageShellRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 620 });

  useEffect(() => {
    const element = stageShellRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.max(640, Math.floor(rect.width)),
        height: Math.max(520, Math.floor(rect.height)),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      addNode(x, y);
    },
    [addNode],
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (selectedNodeId === null) {
        selectNodeForConnection(nodeId);
        return;
      }

      if (selectedNodeId === nodeId) {
        selectNodeForConnection(null);
        return;
      }

      connectNodes(selectedNodeId, nodeId);
      selectNodeForConnection(null);
    },
    [connectNodes, selectNodeForConnection, selectedNodeId],
  );

  const handleNodeDragMove = useCallback(
    (nodeId: string, x: number, y: number) => {
      moveNode(nodeId, x, y);
    },
    [moveNode],
  );

  const handleDetectRegions = useCallback(() => {
    const firstInnerFace = derived.faces.find((face) => !face.isOuter) ?? null;
    selectFace(firstInnerFace?.id ?? null);
  }, [derived.faces, selectFace]);

  return (
    <div className={['editor-shell', className ?? ''].filter(Boolean).join(' ')}>
      <div className="editor-shell__inner">
        <EditorToolbar
          onClear={clearGraph}
          onDetectRegions={handleDetectRegions}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          selectedNodeId={selectedNodeId}
        />

        <div className="main-grid">
          <div ref={stageShellRef} className="canvas-shell">
            <GraphCanvas
              width={size.width}
              height={size.height}
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              selectedFace={derived.selectedFace}
              selectedFacePolygonPoints={derived.selectedFacePolygonPoints}
              onCanvasClick={handleCanvasClick}
              onNodeClick={handleNodeClick}
              onNodeDragMove={handleNodeDragMove}
            />
          </div>

          <div className="sidebar-stack">
            <PlanarityWarning show={derived.hasCrossings} />
            <FaceList
              faces={derived.faces}
              selectedFaceId={selectedFaceId}
              onSelectFace={selectFace}
            />

            <section className="help-panel">
              <h2 className="panel-title">
                Help
              </h2>
              <ul className="help-list">
                <li>1. Click empty space to add a point.</li>
                <li>2. Click one point and then another to connect them.</li>
                <li>3. Drag points to reshape the graph and update the regions.</li>
                <li>4. Select an inner region in the list to highlight it.</li>
              </ul>
              <div className="help-note">
                Derived data is recomputed from the current nodes and edges; no face state is
                stored separately.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
