import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from '@/motion/gsap';
import { isFinePointer, isReduced } from '@/motion/tokens';

/** Magnetic pull (0.25, max 12px). Used only on the primary CTA and the Menu button. */
export function Magnetic({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || isReduced() || window.innerWidth < 1024) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'meres.soft' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'meres.soft' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
      xTo(gsap.utils.clamp(-12, 12, dx));
      yTo(gsap.utils.clamp(-12, 12, dy));
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  return (
    <span ref={ref} className={`inline-flex ${className}`}>
      {children}
    </span>
  );
}
