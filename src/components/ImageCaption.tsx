/**
 * Quiet, honest disclosure caption (11-12px, bottom-left, on a scrim, never over text).
 * Never shown on images narrower than 160px.
 */
export function ImageCaption({
  label = 'Concept visualization',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  if (!label) return null;
  return (
    <div
      className={`pointer-events-none absolute bottom-4 left-4 z-[4] hidden min-[160px]:flex items-center ${className}`}
      aria-hidden="true"
    >
      <span className="rounded bg-black/45 px-2 py-0.5 font-sans text-[11px] md:text-[12px] font-normal leading-none tracking-normal text-linen/90 backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
