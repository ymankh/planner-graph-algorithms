import { memo } from 'react';
import { Line } from 'react-konva';

type SelectedFaceOverlayProps = {
  points: number[];
  visible: boolean;
};

function SelectedFaceOverlayComponent({ points, visible }: SelectedFaceOverlayProps) {
  if (!visible || points.length < 6) {
    return null;
  }

  return (
    <Line
      points={points}
      closed
      fill="rgba(45, 212, 191, 0.18)"
      stroke="rgba(45, 212, 191, 0.55)"
      strokeWidth={2}
      lineJoin="round"
      tension={0}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
}

export const SelectedFaceOverlay = memo(SelectedFaceOverlayComponent);
