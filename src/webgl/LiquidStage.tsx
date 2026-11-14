import { useEffect, useRef, useState } from 'react';
import { crops, images, type CropKey } from '@/data/images';
import { ImageFrame } from '@/components/ImageFrame';
import { VisualizationLabel } from '@/components/VisualizationLabel';
import { isReduced } from '@/motion/tokens';
import type { LiquidImage as LiquidImageT } from './LiquidImage';

const canUseWebGL = () =>
  typeof window !== 'undefined' && !isReduced() && window.innerWidth >= 768;

const sourceFor = async (key: CropKey) => {
  const { toLiquidSource } = await import('./LiquidImage');
  const c = crops[key];
  const img = images[c.imageKey];
  return toLiquidSource(img.webp1672, c.objectPosition, c.scale);
};

/**
 * Shows one of several crops. On desktop (≥768px, motion allowed, WebGL available) it renders
 * Liquid Light and dissolves between crops; otherwise it crossfades plain ImageFrames (600ms).
 * The WebGL module is lazy-loaded and only initialised when the stage scrolls into view.
 */
export function LiquidStage({
  frames,
  index = 0,
  ripple = false,
  className = '',
  sizes = '100vw',
  priority,
  vignette,
}: {
  frames: CropKey[];
  index?: number;
  ripple?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  vignette?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const liquid = useRef<LiquidImageT | null>(null);
  const [gl, setGl] = useState(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const el = host.current;
    if (!el || !canUseWebGL()) return;
    let cancelled = false;
    let inst: LiquidImageT | null = null;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || inst || cancelled) return;
        io.disconnect();
        const mod = await import('./LiquidImage');
        if (cancelled || !mod.webglAvailable()) return;
        const src = await sourceFor(frames[indexRef.current]);
        if (cancelled) return;
        inst = new mod.LiquidImage(el, src, { ripple, idle: 1 });
        liquid.current = inst;
        inst.ready.then(() => !cancelled && setGl(true));
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      inst?.destroy();
      liquid.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!liquid.current) return;
    sourceFor(frames[index]).then((s) => liquid.current?.transitionTo(s, 0.9));
  }, [index, frames]);

  return (
    <div ref={host} className={`liquid-stage relative overflow-hidden ${vignette ? 'forest-vignette' : ''} ${className}`}>
      {frames.map((f, i) => (
        <div
          key={f}
          className="absolute inset-0 transition-opacity duration-[600ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0, visibility: gl && i !== index ? 'hidden' : undefined }}
          aria-hidden={i !== index}
        >
          <ImageFrame crop={f} fill sizes={sizes} priority={priority && i === 0} label={false} />
        </div>
      ))}
      <VisualizationLabel />
    </div>
  );
}
