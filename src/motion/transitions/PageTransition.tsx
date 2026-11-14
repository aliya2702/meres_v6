import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigationType, type Location } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { entrance } from '@/motion/entrance';
import { getLenis, scrollToHash, scrollToTarget } from '@/app/lenis';
import { useAppState } from '@/app/store';

/*
 * "Plaster Wipe" page transition.
 * A linen panel with a soft wavy leading edge rises over the page (450ms), the route swaps,
 * scroll is set (top / anchor / restored position on back-forward), ScrollTrigger refreshes,
 * then the panel continues up and clears (450ms). The new hero starts 150ms before it clears.
 * Forest variant when navigating to Contact. Reduced motion: 200ms crossfade.
 */

type Edge = { t0: number; t1: number; t2: number; t3: number; b0: number; b1: number; b2: number; b3: number };
const shape = (e: Edge) =>
  `M0,${e.t0} C30,${e.t1} 70,${e.t2} 100,${e.t3} L100,${e.b3} C70,${e.b2} 30,${e.b1} 0,${e.b0} Z`;

export function PageTransition({ children }: { children: (loc: Location) => ReactNode }) {
  const location = useLocation();
  const navType = useNavigationType();
  const { setMenuOpen } = useAppState();
  const [display, setDisplay] = useState(location);
  const [phase, setPhase] = useState<'idle' | 'covering' | 'swapped'>('idle');
  const overlay = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const memory = useRef(new Map<string, number>());
  const first = useRef(true);
  const edge = useRef<Edge>({ t0: 100, t1: 100, t2: 100, t3: 100, b0: 100, b1: 100, b2: 100, b3: 100 });

  const paint = () => path.current?.setAttribute('d', shape(edge.current));

  // 1) Location changed → cover, then swap.
  useEffect(() => {
    if (phase !== 'idle') return;
    if (location.pathname === display.pathname) {
      if (location.key !== display.key) {
        setDisplay(location);
        // same page: anchor or plain re-click
        window.setTimeout(() => {
          if (!scrollToHash(location.hash)) {
            if (!location.hash) scrollToTarget(0, { offset: 0 });
          }
        }, 60);
      }
      return;
    }
    memory.current.set(display.key, window.scrollY);
    setPhase('covering');
    const el = overlay.current!;
    const forest = location.pathname.startsWith('/contact');
    el.dataset.variant = forest ? 'forest' : 'linen';
    getLenis()?.stop();
    const reduced = isReduced();
    gsap.set(el, { visibility: 'visible', opacity: 1, pointerEvents: 'auto' });
    const done = () => {
      setMenuOpen(false);
      entrance.reset();
      setDisplay(location);
      setPhase('swapped');
    };
    if (reduced) {
      Object.assign(edge.current, { t0: 0, t1: 0, t2: 0, t3: 0, b0: 100, b1: 100, b2: 100, b3: 100 });
      paint();
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none', onComplete: done });
      return;
    }
    // Leading edge rises from below the screen as a soft wave and arrives flat at the top.
    const prog = { p: 0 };
    gsap.to(prog, {
      p: 1,
      duration: 0.45,
      ease: 'meres.inOut',
      onUpdate: () => {
        const y = 112 - 112 * prog.p;
        const amp = Math.sin(Math.PI * prog.p) * 16;
        Object.assign(edge.current, { t0: y, t1: y - amp, t2: y + amp * 0.55, t3: y - amp * 0.2, b0: 112, b1: 112, b2: 112, b3: 112 });
        paint();
      },
      onComplete: done,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, phase]);

  // 2) New page mounted (its useGSAP layout effects have already run) → scroll, refresh, uncover.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (phase !== 'swapped') return;
    const el = overlay.current!;
    const saved = navType === 'POP' ? memory.current.get(display.key) : undefined;
    const lenis = getLenis();
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });

    const finish = () => {
      lenis?.start();
      ScrollTrigger.refresh();
      if (display.hash) scrollToHash(display.hash, true);
      else if (saved) scrollToTarget(saved, { immediate: true, offset: 0 });
      const reduced = isReduced();
      if (reduced) {
        entrance.fire();
        gsap.to(el, {
          opacity: 0,
          duration: 0.2,
          ease: 'none',
          onComplete: () => {
            gsap.set(el, { visibility: 'hidden', pointerEvents: 'none' });
            setPhase('idle');
          },
        });
        return;
      }
      const prog = { p: 0 };
      gsap.delayedCall(0.3, () => entrance.fire()); // hero begins 150ms before the panel clears
      gsap.to(prog, {
        p: 1,
        duration: 0.45,
        ease: 'meres.inOut',
        onUpdate: () => {
          const y = 100 - 112 * prog.p;
          const amp = Math.sin(Math.PI * prog.p) * 14;
          Object.assign(edge.current, { t0: -12, t1: -12, t2: -12, t3: -12, b0: y, b1: y + amp * 0.4, b2: y - amp, b3: y + amp * 0.15 });
          paint();
        },
        onComplete: () => {
          gsap.set(el, { visibility: 'hidden', pointerEvents: 'none' });
          setPhase('idle');
        },
      });
    };
    // Wait two frames so layout (and SplitText) settle before measuring.
    requestAnimationFrame(() => requestAnimationFrame(finish));
  }, [display.key, phase, navType]);

  // Never leave the overlay stuck: if something interrupts, clear it after 2.5s.
  useEffect(() => {
    if (phase === 'idle') return;
    const t = window.setTimeout(() => {
      if (overlay.current) gsap.set(overlay.current, { visibility: 'hidden', pointerEvents: 'none' });
      getLenis()?.start();
      entrance.fire();
      setPhase('idle');
    }, 2500);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <>
      {children(display)}
      <div ref={overlay} className="page-wipe pointer-events-none fixed inset-0 z-[150]" style={{ visibility: 'hidden' }} aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={path} d={shape(edge.current)} />
        </svg>
      </div>
    </>
  );
}
