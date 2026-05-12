/// <reference lib="webworker" />

import {
  detectFaces,
  hasEdgeCrossings,
  type Edge,
  type Face,
  type PointNode,
} from 'graph-planner-algorithms';

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

type WorkerMessage = AnalysisRequest;

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const request = event.data;

  try {
    const faces = detectFaces(request.nodes, request.edges);
    const hasCrossings = hasEdgeCrossings(request.nodes, request.edges);

    const response: AnalysisResult = {
      type: 'result',
      requestId: request.requestId,
      graphSignature: request.graphSignature,
      faces,
      hasCrossings,
    };

    self.postMessage(response);
  } catch (error) {
    const response: AnalysisFailure = {
      type: 'error',
      requestId: request.requestId,
      graphSignature: request.graphSignature,
      message: error instanceof Error ? error.message : 'Failed to analyze graph',
    };
    self.postMessage(response);
  }
});
