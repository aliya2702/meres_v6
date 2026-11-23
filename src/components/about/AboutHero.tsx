import { useEffect, useRef } from 'react';
import { gsap } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal } from '@/motion/primitives';
import { scrollToHash } from '@/app/lenis';
import { Panel } from './AboutStack';
import { AboutPhoto } from './AboutPhoto';

/**
 * Scene 1 — Hero panel.
 * Full-bleed twilight residence (E1) scaling softly 1.15 -> 1 on load,
 * monumental serif title "About" with masked line reveal bottom-left,
 * bobbing down-arrow cue bottom-right.
 * Header readable over it, text starts at least 96px below the top.
 */
export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const title = titleRef.current;
    const cue = cueRef.current;
    if (!section || !bg || !title || !cue) return;

    if (isReduced()) return;

    const ctx = gsap.context(() => {
      gsap.set(bg, { scale: 1.15, transformOrigin: '50% 50%' });
      gsap.set(cue, { opacity: 0, y: 14 });

      const animTitle = lineReveal(title, { paused: true, auto: false });

      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(bg, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
      if (animTitle) tl.add(animTitle.paused(false), 0.18);
      tl.to(cue, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.45);

      const failsafeId = window.setTimeout(() => {
        if (tl.progress() < 1) tl.progress(1);
      }, 3000);

      return () => window.clearTimeout(failsafeId);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <Panel
      id="about-hero"
      zIndex={1}
      background="var(--forest)"
      theme="dark"
      panelRef={sectionRef}
    >
      <div
        data-panel-content
        className="relative flex h-full min-h-[100svh] w-full flex-col justify-end overflow-hidden"
      >
        <div ref={bgRef} className="absolute inset-0">
          <AboutPhoto id="E1" priority className="h-full w-full" />
        </div>

        {/* Bottom-left ink scrim keeping display typography legible */}
        <div
          aria-hidden="true"
          className="about-scrim-bl pointer-events-none absolute inset-0 z-10"
        />

        <div className="relative z-20 flex w-full items-end justify-between px-6 pb-10 pt-28 sm:px-10 sm:pb-12 sm:pt-32 lg:px-16 lg:pb-14 lg:pt-36">
          <div className="max-w-full">
            <h1
              ref={titleRef}
              className="font-serif font-normal leading-[0.94] tracking-[-0.025em] text-linen"
              style={{ fontSize: 'clamp(4rem, 11.5vw, 9.5rem)' }}
            >
              About
            </h1>
          </div>

          <button
            ref={cueRef}
            type="button"
            onClick={() => scrollToHash('#about-story')}
            aria-label="Scroll to next section"
            className="about-arrow-bob group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-linen/40 bg-forest/40 text-linen backdrop-blur-sm transition-colors hover:border-linen hover:bg-forest/70 sm:h-14 sm:w-14"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.35}
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5"
            >
              <path d="M12 5v14m0 0-5-5m5 5 5-5" />
            </svg>
          </button>
        </div>

        <div
          data-panel-dim
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 bg-forest-deep opacity-0"
        />
      </div>
    </Panel>
  );
}
