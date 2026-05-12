type PlanarityWarningProps = {
  show: boolean;
};

export function PlanarityWarning({ show }: PlanarityWarningProps) {
  if (!show) {
    return null;
  }

  return (
    <div role="alert" className="warning-banner">
      This drawing has crossing edges, so it is not planar as drawn. Region detection may be
      incorrect.
    </div>
  );
}
