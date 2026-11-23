import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal } from '@/motion/primitives';
import { about } from '@/content/copy';
import { Panel } from './AboutStack';

/**
 * Scene 3 — Green Philosophy Scene panel.
 * Calm 100svh deep forest panel with the centred statement:
 * "That belief guides MERES." / "Nothing meaningful happens by accident."
 * Masked line reveal and one thin taupe hairline that draws under it.
 * Zero floating images.
 */
export function AboutGreenScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const beliefRef = useRef<HTMLParagraphElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const belief = beliefRef.current;
    const hairline = hairlineRef.current;
    if (!section || !headline || !belief || !hairline) return;

    if (isReduced()) return;

    const mm = gsap.matchMedia();
    let failsafeTimer: number | undefined;

    mm.add('(min-width: 768px)', () => {
      gsap.set(belief, { opacity: 0, y: 16 });
      gsap.set(hairline, { scaleX: 0, transformOrigin: '50% 50%' });

      const animHead = lineReveal(headline, { paused: true, auto: false });

      const tl = gsap.timeline({ paused: true });
      tl.to(belief, { opacity: 1, y: 0, duration: 0.75, ease: 'meres.out' }, 0);
      if (animHead) tl.add(animHead.paused(false), 0.15);
      tl.to(
        hairline,
        { scaleX: 1, duration: 0.85, ease: 'power3.out' },
        0.5
      );

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
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Panel
      id="about-philosophy"
      zIndex={4}
      background="var(--forest)"
      theme="dark"
      panelRef={sectionRef}
    >
      <div className="relative flex h-full min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-forest px-6 py-20 text-center text-linen sm:px-10 lg:px-16">
        {/* Subtle ambient gradient lighting */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(173,150,128,0.3) 0%, rgba(30,53,47,0.8) 55%, transparent 75%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center">
          <p
            ref={beliefRef}
            className="mb-6 font-sans text-xs uppercase tracking-[0.24em] text-taupe sm:text-sm"
          >
            {about.belief}
          </p>

          <h2
            ref={headlineRef}
            className="font-serif font-normal leading-[1.08] tracking-[-0.02em] text-linen"
            style={{ fontSize: 'clamp(2.2rem, 4.8vw, 4.5rem)' }}
          >
            {about.philosophy}
          </h2>

          {/* Thin taupe hairline drawing under the statement */}
          <div
            ref={hairlineRef}
            className="mt-8 h-[1px] w-28 bg-taupe/40 sm:mt-10 sm:w-36"
            aria-hidden="true"
          />
        </div>
      </div>
    </Panel>
  );
}
