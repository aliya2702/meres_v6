import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal } from '@/motion/primitives';
import { about } from '@/content/copy';
import { Panel } from './AboutStack';
import { AboutPhoto } from './AboutPhoto';

/**
 * Scene 2 — Split Scene panel.
 * Follows immediately after the Hero.
 * Left 40%: Client kitchen visualization (04-kitchen-detail) full bleed.
 * Right 60%: Forest panel with Eddie Johnson introduction.
 * Linen swatch (M2) completely removed; clean, balanced editorial typography.
 */
export function AboutSplitStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const forestRef = useRef<HTMLDivElement>(null);
  const k1Ref = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const forest = forestRef.current;
    const k1 = k1Ref.current;
    const headline = headlineRef.current;
    const para = paraRef.current;
    if (!section || !forest || !k1 || !headline || !para) return;

    if (isReduced()) return;

    const mm = gsap.matchMedia();
    let failsafeTimer: number | undefined;

    mm.add('(min-width: 1024px)', () => {
      gsap.set(forest, { clipPath: 'inset(0 0 0% 0)' });
      gsap.set(k1, { clipPath: 'inset(0% 0 0 0)' });

      const animHead = lineReveal(headline, { paused: true, auto: false });
      const animPara = lineReveal(para, { paused: true, auto: false });

      const tl = gsap.timeline({ paused: true });
      if (animHead) tl.add(animHead.paused(false), 0.1);
      if (animPara) tl.add(animPara.paused(false), 0.35);

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
      });

      const observer = new IntersectionObserver(
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
        observer.disconnect();
        st.kill();
        tl.kill();
        animHead?.kill?.();
        animPara?.kill?.();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Panel
      id="about-story"
      zIndex={2}
      background="var(--forest-deep)"
      theme="dark"
      panelRef={sectionRef}
    >
      <div className="relative flex h-full min-h-[100svh] w-full flex-col lg:flex-row">
        {/* Left 40%: Client kitchen detail full bleed */}
        <div
          ref={k1Ref}
          className="relative h-[50svh] w-full overflow-hidden bg-forest-deep lg:h-full lg:w-[42%]"
        >
          <AboutPhoto id="04-kitchen-detail" priority className="h-full w-full" />
        </div>

        {/* Right 58%: Forest panel with Eddie Johnson introduction, gracefully balanced */}
        <div
          ref={forestRef}
          className="relative flex min-h-[50svh] w-full flex-col justify-center overflow-hidden bg-forest px-6 py-16 text-linen sm:px-12 sm:py-20 lg:h-full lg:w-[58%] lg:px-20 lg:py-24 xl:px-24"
        >
          {/* Drifting radial mood blobs */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-24 -top-24 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
              style={{
                background: 'radial-gradient(circle, #1E352F 0%, rgba(30,53,47,0) 70%)',
              }}
            />
            <div
              className="absolute -bottom-24 -right-16 h-[30rem] w-[30rem] rounded-full opacity-35 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(173,150,128,0.45) 0%, rgba(173,150,128,0) 72%)',
              }}
            />
          </div>

          <div className="relative z-10 flex w-full max-w-xl flex-col items-start text-left">
            <h2
              ref={headlineRef}
              className="font-serif font-normal leading-[1.12] tracking-[-0.02em] text-linen"
              style={{ fontSize: 'clamp(1.75rem, 2.7vw, 3rem)' }}
            >
              {about.founder[0]}
            </h2>

            <div className="my-8 h-px w-20 bg-taupe/40 sm:my-10" aria-hidden="true" />

            <p
              ref={paraRef}
              className="font-sans text-base leading-relaxed text-linen/90 sm:text-lg sm:leading-relaxed"
            >
              {about.founder[1]}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
