import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal } from '@/motion/primitives';
import { Panel } from './AboutStack';
import { AboutPhoto } from './AboutPhoto';

interface FilmstripItem {
  id: string;
  widthClass: string;
  heightClass: string;
  orderPriority: number;
}

// 8 real registered architectural, craft, and workshop photographs:
// W1, W2, W3, P2, E2, E5, L1, K6 (zero swatches, zero linen/stone textures, zero duplicates).
// Centre-out reveal order: center frames (P2 & E2) first, expanding outward.
const FILMSTRIP_ITEMS: FilmstripItem[] = [
  { id: 'W1', widthClass: 'lg:w-[12.5vw]', heightClass: 'h-44 sm:h-48 lg:h-[28vh]', orderPriority: 6 },
  { id: 'W2', widthClass: 'lg:w-[13vw]', heightClass: 'h-40 sm:h-44 lg:h-[26vh]', orderPriority: 4 },
  { id: 'W3', widthClass: 'lg:w-[12.5vw]', heightClass: 'h-44 sm:h-48 lg:h-[28vh]', orderPriority: 2 },
  { id: 'P2', widthClass: 'lg:w-[13.5vw]', heightClass: 'h-50 sm:h-54 lg:h-[33vh]', orderPriority: 0 },
  { id: 'E2', widthClass: 'lg:w-[14vw]', heightClass: 'h-52 sm:h-56 lg:h-[35vh]', orderPriority: 1 },
  { id: 'E5', widthClass: 'lg:w-[12vw]', heightClass: 'h-44 sm:h-48 lg:h-[28vh]', orderPriority: 3 },
  { id: 'L1', widthClass: 'lg:w-[14vw]', heightClass: 'h-50 sm:h-54 lg:h-[33vh]', orderPriority: 5 },
  { id: 'K6', widthClass: 'lg:w-[11.5vw]', heightClass: 'h-40 sm:h-44 lg:h-[25vh]', orderPriority: 7 },
];

/**
 * Scene 6 — Cream Filmstrip panel.
 * Warm linen panel introducing "ALL SHADES OF CRAFT" / "Eddie Johnson's practice,
 * one detail at a time." above a bottom-aligned 8-frame portrait filmstrip of verified
 * workshop and architectural photographs. No swatches, no textures.
 * Directly follows sequence with zero gap.
 */
export function AboutFilmstrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const eyebrow = eyebrowRef.current;
    const headline = headlineRef.current;
    const track = trackRef.current;
    if (!section || !eyebrow || !headline || !track) return;

    if (isReduced()) return;

    const mm = gsap.matchMedia();
    let failsafeTimer: number | undefined;
    let observer: IntersectionObserver | undefined;

    mm.add('(min-width: 1024px)', () => {
      const animHead = lineReveal(headline, { paused: true, auto: false });
      const orderedFrames = [...FILMSTRIP_ITEMS]
        .map((item, idx) => ({ item, el: frameRefs.current[idx] }))
        .filter((pair): pair is { item: FilmstripItem; el: HTMLDivElement } => Boolean(pair.el))
        .sort((a, b) => a.item.orderPriority - b.item.orderPriority)
        .map((pair) => pair.el);

      gsap.set(eyebrow, { opacity: 0, y: 14 });
      gsap.set(orderedFrames, {
        clipPath: 'inset(100% 0 0 0)',
        y: 60,
      });

      const tl = gsap.timeline({ paused: true });
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: 'meres.out' }, 0);
      if (animHead) tl.add(animHead.paused(false), 0.1);
      tl.to(
        orderedFrames,
        {
          clipPath: 'inset(0% 0 0 0)',
          y: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'power4.out',
        },
        0.22,
      );

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
      });

      // Horizontal translateX tied to scroll (~ -8vw total)
      const driftTween = gsap.fromTo(
        track,
        { x: '0vw' },
        {
          x: '-8vw',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      );

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            failsafeTimer = window.setTimeout(() => {
              if (tl.progress() < 1) tl.progress(1);
            }, 3000);
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(section);

      return () => {
        if (failsafeTimer) window.clearTimeout(failsafeTimer);
        observer?.disconnect();
        driftTween.scrollTrigger?.kill();
        driftTween.kill();
        st.kill();
        tl.kill();
        animHead?.kill?.();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Panel
      id="about-craft"
      zIndex={6}
      background="var(--linen)"
      theme="light"
      panelRef={sectionRef}
    >
      <div
        data-panel-content
        className="relative flex h-full min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-linen pb-6 pt-24 text-ink sm:pb-8 sm:pt-28 lg:pb-8 lg:pt-24"
      >
        {/* Editorial header */}
        <div className="px-6 sm:px-10 lg:px-16">
          <p
            ref={eyebrowRef}
            className="mb-2 font-sans text-[11px] uppercase tracking-[0.22em] text-forest sm:text-xs"
          >
            ALL SHADES OF CRAFT
          </p>
          <h2
            ref={headlineRef}
            className="max-w-[22ch] font-serif font-normal leading-[1.08] tracking-[-0.02em] text-ink"
            style={{ fontSize: 'clamp(2rem, 3.8vw, 3.75rem)' }}
          >
            Eddie Johnson&apos;s practice, one detail at a time.
          </h2>
        </div>

        {/* Responsive portrait frames: 2/4-col editorial grid on mobile, lateral scrubbing filmstrip on desktop */}
        <div className="mt-8 w-full overflow-hidden pb-2 pt-2 lg:mt-0">
          <div
            ref={trackRef}
            className="about-filmstrip-row grid grid-cols-2 items-end gap-3 px-6 sm:grid-cols-4 sm:gap-4 sm:px-10 lg:flex lg:w-max lg:gap-4 lg:px-12 lg:will-change-transform xl:gap-5 xl:px-16"
          >
            {FILMSTRIP_ITEMS.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => {
                  frameRefs.current[idx] = el;
                }}
                className={`about-filmstrip-item w-full cursor-pointer overflow-hidden lg:shrink-0 ${item.widthClass} ${item.heightClass}`}
              >
                <AboutPhoto id={item.id} className="h-full w-full" cursorView />
              </div>
            ))}
          </div>
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
