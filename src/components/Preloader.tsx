import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/motion/gsap';
import { entrance } from '@/motion/entrance';
import { useAppState } from '@/app/store';
import { Logo } from './Logo';

const KEY = 'meres:intro-seen';

export const shouldShowPreloader = () => {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(KEY) !== '1';
  } catch {
    return false;
  }
};

/**
 * First visit per session only. The mark's five paths reveal one after another while MERES rises,
 * then the lockup flips into its place in the header as the hero sequence begins (≤ 1.6s).
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

      // Safety: the handoff never waits on assets; if anything stalls, release the page.
      const safety = gsap.delayedCall(4, () => {
        if (!entrance.fired) entrance.fire();
        finish();
      });
      const tl = gsap.timeline();
      tl.fromTo(
        paths,
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.34, stagger: 0.09, ease: 'meres.out' },
      )
        .from(letters, { yPercent: 110, duration: 0.6, stagger: 0.05, ease: 'meres.out' }, 0.1)
        .add('flip', 0.85)
        .call(() => entrance.fire(), [], 'flip')
        .to(el, { backgroundColor: 'rgba(244,239,230,0)', duration: 0.5, ease: 'meres.inOut' }, 'flip')
        .to(
          wrap,
          {
            duration: 0.5,
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
        // Hold in the header slot (in forest) until the hero photograph has opened beneath it,
        // then match the header's colour and hand over.
        .to(
          wrap,
          {
            color: () => (headerLogo ? getComputedStyle(headerLogo).color : '#F4EFE6'),
            duration: 0.6,
            ease: 'meres.soft',
          },
          'flip+=1.05',
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
