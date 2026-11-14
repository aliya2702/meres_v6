import { useEffect, useRef } from 'react';
import { gsap } from '@/motion/gsap';
import { isFinePointer, isReduced } from '@/motion/tokens';

/** 6px linen dot (difference blend). Grows to a 64px "View" ring over linked images; filled dot over the CTA. */
export function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isFinePointer() || isReduced() || window.innerWidth < 1024) {
      el.style.display = 'none';
      return;
    }
    const xTo = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3' });
    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.style.opacity = '1';
        shown = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as HTMLElement;
      let state = 'default';
      if (t.closest('input, textarea, select, [contenteditable]')) state = 'hidden';
      else if (t.closest('[data-cursor="view"]')) state = 'view';
      else if (t.closest('[data-cursor="cta"]')) state = 'cta';
      if (el.dataset.state !== state) el.dataset.state = state;
    };
    const leave = () => {
      el.style.opacity = '0';
      shown = false;
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);
  return (
    <div ref={ref} className="cursor-dot" data-state="default" style={{ opacity: 0 }} aria-hidden="true">
      <span className="dot" />
      <span className="cursor-label">View</span>
    </div>
  );
}
