export type NodeId = string;

export type PointNode = {
  id: NodeId;
  x: number;
  y: number;
};

export type Edge = {
  id: string;
  from: NodeId;
  to: NodeId;
};

export type Face = {
  id: string;
  nodeIds: NodeId[];
  area: number;
  isOuter: boolean;
};
