import { memo } from 'react';
import type { Face } from '../types/graph';

type FaceListProps = {
  faces: Face[];
  selectedFaceId: string | null;
  onSelectFace: (faceId: string) => void;
};

function FaceListComponent({ faces, selectedFaceId, onSelectFace }: FaceListProps) {
  return (
    <section className="panel panel--faces">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">
            Regions
          </h2>
          <p className="panel-subtitle">
            Click an inner region to highlight it on the canvas.
          </p>
        </div>
        <span className="count-pill">
          {faces.length}
        </span>
      </div>

      <div className="face-list">
        {faces.length === 0 ? (
          <div className="empty-state">
            No regions detected yet.
          </div>
        ) : (
          faces.map((face) => {
            const isSelected = selectedFaceId === face.id;
            const area = Math.abs(face.area).toFixed(2);
            const nodeList = face.nodeIds.join(' → ');

            return (
              <button
                key={face.id}
                type="button"
                disabled={face.isOuter}
                onClick={() => {
                  if (!face.isOuter) {
                    onSelectFace(face.id);
                  }
                }}
                className={[
                  'face-item',
                  face.isOuter
                    ? 'face-item--outer'
                    : isSelected
                      ? 'face-item--selected'
                      : 'face-item--inner',
                ].join(' ')}
              >
                <div className="face-item__header">
                  <div className="face-item__id">{face.id}</div>
                  <div className="face-badge">
                    {face.isOuter ? 'Outer' : 'Inner'}
                  </div>
                </div>
                <div className="face-item__body">
                  <div>
                    <span className="muted-label">Node order:</span> {nodeList}
                  </div>
                  <div>
                    <span className="muted-label">Area:</span> {area}
                  </div>
                  {face.isOuter ? (
                    <div className="outer-note">
                      Outer regions are not colored.
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

export const FaceList = memo(FaceListComponent);
