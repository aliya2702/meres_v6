import { useEffect, useId, useRef } from 'react';

export type MaterialVariant = 'stone' | 'walnut' | 'linen' | 'plaster';

/**
 * Generated material surfaces — honest stand-ins where no photography exists.
 * Abstract textures (feTurbulence + feColorMatrix + feDisplacementMap) tinted only with palette
 * tokens. They are not pictures of homes, so they carry no visualization label.
 * The surface drifts on a slow 40s loop (cheap GPU transform of the oversized filtered layer),
 * and only while on screen.
 */
export function MaterialPanel({
  variant,
  className = '',
  animated = true,
  children,
}: {
  variant: MaterialVariant;
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const fid = `mat-${variant}-${id}`;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !animated) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting), {
      rootMargin: '0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [animated]);

  return (
    <div ref={ref} className={`material-panel overflow-hidden ${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} ${className}`} data-variant={variant} aria-hidden="true">
      <svg className="material-svg absolute" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>{filters[variant](fid)}</defs>
        <rect width="100%" height="100%" fill={bases[variant]} />
        <rect width="100%" height="100%" filter={`url(#${fid})`} fill={bases[variant]} />
      </svg>
      {children}
    </div>
  );
}

const bases: Record<MaterialVariant, string> = {
  stone: '#F4EFE6',
  walnut: '#2D372C',
  linen: '#E9DDCD',
  plaster: '#F4EFE6',
};

const filters: Record<MaterialVariant, (id: string) => JSX.Element> = {
  // Soft veined marble: ink veins at ~25% on linen.
  stone: (id) => (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.018" numOctaves={4} seed={11} result="veinNoise" />
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={3} result="warp" />
      <feDisplacementMap in="veinNoise" in2="warp" scale={90} xChannelSelector="R" yChannelSelector="G" result="warped" />
      <feColorMatrix in="warped" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="lum" />
      <feComponentTransfer in="lum" result="veinAlpha">
        <feFuncA type="table" tableValues="0 0 0 0.02 0.25 0.02 0 0 0.12 0 0" />
      </feComponentTransfer>
      <feFlood floodColor="#1E1F1B" result="ink" />
      <feComposite in="ink" in2="veinAlpha" operator="in" result="veins" />
      <feColorMatrix in="warp" type="matrix" values="0 0 0 0 0.639  0 0 0 0 0.573  0 0 0 0 0.525  0 0 0 0.16 0" result="cloud" />
      <feFlood floodColor="#F4EFE6" result="base" />
      <feMerge>
        <feMergeNode in="base" />
        <feMergeNode in="cloud" />
        <feMergeNode in="veins" />
      </feMerge>
    </filter>
  ),
  // Long grain: taupe-deep → forest-deep.
  walnut: (id) => (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0015 0.09" numOctaves={4} seed={5} result="grain" />
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves={2} seed={9} result="warp" />
      <feDisplacementMap in="grain" in2="warp" scale={60} xChannelSelector="G" yChannelSelector="R" result="g2" />
      <feComponentTransfer in="g2" result="contrast">
        <feFuncR type="linear" slope={1.9} intercept={-0.45} />
      </feComponentTransfer>
      <feColorMatrix
        in="contrast"
        type="matrix"
        values="0.443 0 0 0 0.122  0.345 0 0 0 0.149  0.326 0 0 0 0.125  0 0 0 0 1"
      />
    </filter>
  ),
  // Fine woven noise at 6% over linen-deep.
  linen: (id) => (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.05" numOctaves={2} seed={2} result="warp1" />
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.9" numOctaves={2} seed={4} result="weft" />
      <feBlend in="warp1" in2="weft" mode="multiply" result="weave" />
      <feColorMatrix in="weave" type="matrix" values="0 0 0 0 0.118  0 0 0 0 0.122  0 0 0 0 0.106  -1 0 0 0 1" result="dark" />
      <feComponentTransfer in="dark" result="weaveA">
        <feFuncA type="linear" slope={0.06} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="weaveA" />
      </feMerge>
    </filter>
  ),
  // Soft cloudy noise at 8%.
  plaster: (id) => (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={3} seed={8} result="cloud" />
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={1} seed={1} result="fine" />
      <feColorMatrix in="cloud" type="matrix" values="0 0 0 0 0.565  0 0 0 0 0.494  0 0 0 0 0.451  0 0 0 0.16 0" result="c" />
      <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0.118  0 0 0 0 0.122  0 0 0 0 0.106  0 0 0 0.05 0" result="f" />
      <feFlood floodColor="#F4EFE6" result="base" />
      <feMerge>
        <feMergeNode in="base" />
        <feMergeNode in="c" />
        <feMergeNode in="f" />
      </feMerge>
    </filter>
  ),
};
