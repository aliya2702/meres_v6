import { forwardRef } from 'react';
import { Mark } from './Mark';

// Interim lockup: approved mark + "MERES" set in DM Sans 500, uppercase, 0.32em tracking.
// TODO: replace text with official MERES wordmark SVG when supplied
export const Logo = forwardRef<HTMLSpanElement, { className?: string; markClass?: string }>(function Logo(
  { className = '', markClass = 'h-[30px] w-auto' },
  ref,
) {
  return (
    <span ref={ref} className={`logo-lockup inline-flex items-center gap-3 ${className}`}>
      <Mark className={`logo-mark ${markClass}`} />
      <span className="logo-word inline-flex overflow-hidden font-sans font-medium uppercase text-[15px] leading-none tracking-[0.32em]" aria-hidden="true">
        {'MERES'.split('').map((l, i) => (
          <span key={i} className="logo-letter inline-block">
            {l}
          </span>
        ))}
      </span>
      <span className="sr-only">MERES</span>
    </span>
  );
});
