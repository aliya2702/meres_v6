import markRaw from '../../public/brand/meres-mark.svg?raw';

// The approved MERES bull/R mark, rendered from the supplied /public/brand/meres-mark.svg
// (shapes untouched; fills are currentColor so CSS sets the colour). Inlined so its five
// paths can be revealed individually by the preloader and the form success state.
const viewBox = /viewBox="([^"]+)"/.exec(markRaw)?.[1] ?? '0 0 100 100';
const inner = markRaw
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<path /g, '<path class="mark-path" ');

export function Mark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
