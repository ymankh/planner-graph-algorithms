import { useCallback, useEffect, useRef, useState } from 'react';
import type { Edge, PointNode } from 'graph-planner-algorithms';
import { useGraphDerivedData } from '../hooks/useGraphDerivedData';
import { usePlanarGraphEditor } from '../hooks/usePlanarGraphEditor';
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
  const {
    faces,
    hasCrossings,
    selectedFace,
    selectedFacePolygonPoints,
    analysisStatus,
    analysisError,
    detectRegions,
  } = useGraphDerivedData(nodes, edges, selectedFaceId);
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

  const handleNodeDragEnd = useCallback(
    (nodeId: string, x: number, y: number) => {
      moveNode(nodeId, x, y);
    },
    [moveNode],
  );

  const handleDetectRegions = useCallback(() => {
    detectRegions();
  }, [detectRegions]);

  return (
    <div className={['editor-shell', className ?? ''].filter(Boolean).join(' ')}>
      <div className="editor-shell__inner">
        <EditorToolbar
          onClear={clearGraph}
          onDetectRegions={handleDetectRegions}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          selectedNodeId={selectedNodeId}
          analysisStatus={analysisStatus}
        />

        <div className="main-grid">
          <div ref={stageShellRef} className="canvas-shell">
            <GraphCanvas
              width={size.width}
              height={size.height}
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              selectedFace={selectedFace}
              selectedFacePolygonPoints={selectedFacePolygonPoints}
              onCanvasClick={handleCanvasClick}
              onNodeClick={handleNodeClick}
              onNodeDragEnd={handleNodeDragEnd}
            />
          </div>

          <div className="sidebar-stack">
            <PlanarityWarning show={hasCrossings} />
            {analysisError ? (
              <div className="warning-banner" role="alert">
                {analysisError}
              </div>
            ) : null}
            <FaceList
              faces={faces}
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
                <li>3. Drag points to reshape the graph.</li>
                <li>4. Press Detect regions after edits, then select an inner region to highlight it.</li>
              </ul>
              <div className="help-note">
                Region detection runs in a worker so adding lots of points stays responsive.
              </div>
              <div className="help-note">
                Status: {analysisStatus}
                {analysisStatus === 'running' ? ' - calculating faces and crossings in the background.' : ''}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
