import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPolygonPoints,
  getUndirectedEdgeKey,
  type Edge,
  type Face,
  type NodeId,
  type PointNode,
} from 'graph-planner-algorithms';

type AnalysisStatus = 'idle' | 'running' | 'ready' | 'error';

type AnalysisRequest = {
  type: 'analyze';
  requestId: number;
  graphSignature: string;
  nodes: PointNode[];
  edges: Edge[];
};

type AnalysisResult = {
  type: 'result';
  requestId: number;
  graphSignature: string;
  faces: Face[];
  hasCrossings: boolean;
};

type AnalysisFailure = {
  type: 'error';
  requestId: number;
  graphSignature: string;
  message: string;
};

type WorkerMessage = AnalysisResult | AnalysisFailure;

function isResultMessage(message: WorkerMessage): message is AnalysisResult {
  return message.type === 'result';
}

function buildGraphSignature(nodes: PointNode[], edges: Edge[]): string {
  const nodeSignature = nodes
    .map((node) => `${node.id}:${node.x.toFixed(3)},${node.y.toFixed(3)}`)
    .join('|');
  const edgeSignature = edges.map((edge) => `${edge.id}:${edge.from}-${edge.to}`).join('|');
  return `${nodeSignature}#${edgeSignature}`;
}

export function useGraphDerivedData(
  nodes: PointNode[],
  edges: Edge[],
  selectedFaceId: string | null,
) {
  const graphSignature = useMemo(() => buildGraphSignature(nodes, edges), [edges, nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<NodeId, PointNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  const edgeKeySet = useMemo(() => {
    const keys = new Set<string>();
    for (const edge of edges) {
      keys.add(getUndirectedEdgeKey(edge.from, edge.to));
    }
    return keys;
  }, [edges]);

  const [result, setResult] = useState<{
    graphSignature: string;
    faces: Face[];
    hasCrossings: boolean;
  } | null>(null);
  const [pendingGraphSignature, setPendingGraphSignature] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<{ graphSignature: string; message: string } | null>(
    null,
  );

  const workerRef = useRef<Worker | null>(null);
  const latestRequestIdRef = useRef(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/planarGraphAnalysis.worker.ts', import.meta.url),
      { type: 'module' },
    );

    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.requestId !== latestRequestIdRef.current) {
        return;
      }

      if (!isResultMessage(message)) {
        setAnalysisError({
          graphSignature: message.graphSignature,
          message: message.message,
        });
        setPendingGraphSignature(null);
        return;
      }

      setResult({
        graphSignature: message.graphSignature,
        faces: message.faces,
        hasCrossings: message.hasCrossings,
      });
      setAnalysisError(null);
      setPendingGraphSignature(null);
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const detectRegions = useCallback(() => {
    const worker = workerRef.current;
    if (!worker) {
      return;
    }

    const nextRequestId = requestIdRef.current + 1;
    requestIdRef.current = nextRequestId;
    latestRequestIdRef.current = nextRequestId;
    setPendingGraphSignature(graphSignature);
    setAnalysisError(null);

    const request: AnalysisRequest = {
      type: 'analyze',
      requestId: nextRequestId,
      graphSignature,
      nodes,
      edges,
    };

    worker.postMessage(request);
  }, [edges, graphSignature, nodes]);

  const validResult = result?.graphSignature === graphSignature ? result : null;
  const analysisStatus: AnalysisStatus =
    pendingGraphSignature === graphSignature
      ? 'running'
      : analysisError?.graphSignature === graphSignature
        ? 'error'
        : validResult
          ? 'ready'
          : 'idle';

  const selectedFace = useMemo<Face | null>(() => {
    if (!selectedFaceId || !validResult) {
      return null;
    }

    return validResult.faces.find((face) => face.id === selectedFaceId) ?? null;
  }, [selectedFaceId, validResult]);

  const selectedFacePolygonPoints = useMemo(() => {
    if (!selectedFace || selectedFace.isOuter) {
      return [];
    }

    return buildPolygonPoints(selectedFace.nodeIds, nodeMap);
  }, [nodeMap, selectedFace]);

  return {
    nodeMap,
    edgeKeySet,
    faces: validResult?.faces ?? [],
    hasCrossings: validResult?.hasCrossings ?? false,
    selectedFace,
    selectedFacePolygonPoints,
    analysisStatus,
    analysisError: analysisError?.graphSignature === graphSignature ? analysisError.message : null,
    detectRegions,
  };
}
