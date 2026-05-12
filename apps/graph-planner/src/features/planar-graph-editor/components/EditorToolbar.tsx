type EditorToolbarProps = {
  onClear: () => void;
  onDetectRegions: () => void;
  nodeCount: number;
  edgeCount: number;
  selectedNodeId: string | null;
  analysisStatus: 'idle' | 'running' | 'ready' | 'error';
};

export function EditorToolbar({
  onClear,
  onDetectRegions,
  nodeCount,
  edgeCount,
  selectedNodeId,
  analysisStatus,
}: EditorToolbarProps) {
  const isRunning = analysisStatus === 'running';

  return (
    <header className="editor-toolbar">
      <div className="toolbar-layout">
        <div className="toolbar-copy">
          <div>
            <h1 className="toolbar-title">Planar Graph Editor</h1>
            <p className="toolbar-description">
              Click empty canvas to add a node, click one node then another to connect them,
              and drag nodes to reshape the embedding.
            </p>
          </div>
          <div className="toolbar-stats">
            <span className="toolbar-pill">
              Nodes: {nodeCount}
            </span>
            <span className="toolbar-pill">
              Edges: {edgeCount}
            </span>
            <span className="toolbar-pill">
              {selectedNodeId ? `Connecting from ${selectedNodeId}` : 'No node selected'}
            </span>
            <span className={[
              'toolbar-pill',
              isRunning ? 'toolbar-pill--running' : '',
            ].join(' ')}>
              {isRunning ? 'Calculating regions...' : `Analysis: ${analysisStatus}`}
            </span>
          </div>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            onClick={onDetectRegions}
            className="button button--primary"
            disabled={isRunning}
          >
            {isRunning ? 'Working...' : 'Detect regions'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="button button--danger"
          >
            Clear
          </button>
        </div>
      </div>
    </header>
  );
}
