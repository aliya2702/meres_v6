import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import type { CropKey } from '@/data/images';
import { ImageFrame } from './ImageFrame';

export type WipeFrame = { crop: CropKey } | { node: ReactNode; key: string };

/**
 * Panel Wipe: a solid panel grows across the frame (clip-path), the content swaps to the next
 * frame at the midpoint while it is covered, then the panel clears on the far side.
 */
export function PanelWipeFrame({
  frames,
  index,
  panel = 'forest',
  className = '',
  sizes = '50vw',
}: {
  frames: WipeFrame[];
  index: number;
  panel?: 'forest' | 'linen';
  className?: string;
  sizes?: string;
}) {
  const [shown, setShown] = useState(index);
  const panelRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (index === shown) return;
    const p = panelRef.current;
    if (!p || isReduced()) {
      setShown(index);
      return;
    }
    tl.current?.progress(1).kill();
    tl.current = gsap
      .timeline()
      .fromTo(p, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'meres.inOut' })
      .call(() => setShown(index))
      .to(p, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.65, ease: 'meres.inOut' }, '+=0.05');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => () => void tl.current?.kill(), []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {frames.map((f, i) => (
        // Hidden frames also get opacity 0: SVG filters that generate their own pixels
        // (feTurbulence/feFlood) still paint under visibility:hidden in Chromium.
        <div
          key={'crop' in f ? f.crop : f.key}
          className="absolute inset-0"
          style={{ visibility: i === shown ? 'visible' : 'hidden', opacity: i === shown ? 1 : 0 }}
          aria-hidden={i !== shown}
        >
          {'crop' in f ? <ImageFrame crop={f.crop} fill sizes={sizes} parallax={0} /> : f.node}
        </div>
      ))}
      <div
        ref={panelRef}
        className={`absolute inset-0 z-[5] ${panel === 'forest' ? 'bg-forest' : 'bg-linen-deep'}`}
        style={{ clipPath: 'inset(0% 100% 0% 0%)' }}
        aria-hidden="true"
      />
    </div>
  );
}
