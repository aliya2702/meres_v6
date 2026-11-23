import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/motion/gsap';
import { entrance } from '@/motion/entrance';
import { useAppState } from '@/app/store';
import { ENABLE_INTRO } from '@/config';
import { Logo } from './Logo';

const KEY = 'meres:intro-seen';

export const shouldShowPreloader = () => {
  if (!ENABLE_INTRO) return false;
  try {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(KEY) !== '1';
  } catch {
    return false;
  }
};

/**
 * First visit per session only (if ENABLE_INTRO is true).
 * Runs for at most 0.8s, never on route changes or hash navigation,
 * never when prefers-reduced-motion is set, and never blocks scrolling or content.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const lock = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const { setIntroDone } = useAppState();

  useGSAP(
    () => {
      const el = root.current!;
      const wrap = lock.current!;
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {
        /* private mode */
      }
      const headerLogo = document.querySelector<HTMLElement>('.header-logo');
      const target = headerLogo?.querySelector<HTMLElement>('.logo-lockup');
      gsap.set(headerLogo, { opacity: 0 });

      const SCALE = 3.2;
      gsap.set(wrap, { scale: SCALE, transformOrigin: '50% 50%' });
      const paths = wrap.querySelectorAll('.mark-path');
      const letters = wrap.querySelectorAll('.logo-letter');

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        safety.kill();
        gsap.set(headerLogo, { opacity: 1 });
        setIntroDone(true);
        setGone(true);
        // Run outside this component's GSAP context (it is about to unmount).
        window.setTimeout(onDone, 0);
      };

      // Failsafe: at most 0.8s total duration
      const safety = gsap.delayedCall(0.8, () => {
        if (!entrance.fired) entrance.fire();
        finish();
      });

      const tl = gsap.timeline();
      tl.fromTo(
        paths,
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.18, stagger: 0.04, ease: 'meres.out' },
      )
        .from(letters, { yPercent: 110, duration: 0.25, stagger: 0.03, ease: 'meres.out' }, 0.05)
        .add('flip', 0.4)
        .call(() => entrance.fire(), [], 'flip')
        .to(el, { backgroundColor: 'rgba(244,239,230,0)', duration: 0.25, ease: 'meres.inOut' }, 'flip')
        .to(
          wrap,
          {
            duration: 0.35,
            ease: 'meres.inOut',
            scale: 1,
            x: () => {
              if (!target) return 0;
              const t = target.getBoundingClientRect();
              const w = wrap.getBoundingClientRect();
              return t.left + t.width / 2 - (w.left + w.width / 2);
            },
            y: () => {
              if (!target) return 0;
              const t = target.getBoundingClientRect();
              const w = wrap.getBoundingClientRect();
              return t.top + t.height / 2 - (w.top + w.height / 2);
            },
          },
          'flip',
        )
        .to(
          wrap,
          {
            color: () => (headerLogo ? getComputedStyle(headerLogo).color : '#F4EFE6'),
            duration: 0.15,
            ease: 'meres.soft',
          },
          'flip+=0.2',
        )
        .call(finish);

      return () => safety.kill();
    },
    { scope: root },
  );

  if (gone) return null;
  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-[160] grid place-items-center bg-linen"
      aria-hidden="true"
    >
      <div ref={lock} className="text-forest">
        <Logo />
      </div>
    </div>
  );
}
