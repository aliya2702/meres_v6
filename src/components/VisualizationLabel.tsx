import { ImageCaption } from './ImageCaption';

/** Quiet disclosure label. */
export function VisualizationLabel({ className = '', label }: { className?: string; label?: string }) {
  return <ImageCaption className={className} label={label} />;
}
