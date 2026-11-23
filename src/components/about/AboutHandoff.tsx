import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal } from '@/motion/primitives';
import { about } from '@/content/copy';
import { Panel } from './AboutStack';
import { AboutPhoto } from './AboutPhoto';

/**
 * Scene 3 — Two-Image Handoff panel.
 * Client concept visualizations hand off from walnut kitchen island (01-kitchen-hero)
 * to sunlit garden dining nook (03-dining-nook).
 * Overlaid with the 4 sentences of cabinet craft and living purpose.
 * Uses a single responsive layer set across all viewports to avoid duplicate DOM images.
 */
export function AboutHandoff() {
  const sectionRef = useRef<HTMLElement>(null);
  const k1WrapRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const d1WrapRef = useRef<HTMLDivElement>(null);
  const textCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const k1Wrap = k1WrapRef.current;
    const curtain = curtainRef.current;
    const d1Wrap = d1WrapRef.current;
    const textCard = textCardRef.current;
    if (!section || !k1Wrap || !curtain || !d1Wrap || !textCard) return;

    if (isReduced()) return;

    const mm = gsap.matchMedia();
    let failsafeTimer: number | undefined;

    mm.add('(min-width: 320px)', () => {
      gsap.set(curtain, { xPercent: 0 });
      gsap.set(k1Wrap, { scale: 0.96, transformOrigin: '30% 50%' });
      gsap.set(d1Wrap, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(textCard, { opacity: 0, y: 24 });

      const anim = lineReveal(textCard, { paused: true, auto: false });

      const tl = gsap.timeline({ paused: true });
      tl.to(curtain, { xPercent: 100, duration: 0.95, ease: 'power3.inOut' }, 0)
        .to(k1Wrap, { scale: 1.04, duration: 1.35, ease: 'power2.out' }, 0)
        .to(d1Wrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power3.inOut' }, 0.55)
        .to(textCard, { opacity: 1, y: 0, duration: 0.85, ease: 'meres.out' }, 0.7);

      if (anim) tl.add(anim.paused(false), 0.75);

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
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Panel
      id="about-handoff"
      zIndex={3}
      background="var(--forest-deep)"
      theme="dark"
      panelRef={sectionRef}
    >
      <div className="relative h-full min-h-[100svh] w-full overflow-hidden bg-forest-deep">
        {/* Layered responsive hand-off reveal */}
        <div className="absolute inset-0 h-full w-full">
          {/* Base image: 01-kitchen-hero */}
          <div ref={k1WrapRef} className="absolute inset-0 h-full w-full will-change-transform">
            <AboutPhoto id="01-kitchen-hero" className="h-full w-full" />
          </div>

          {/* Curtain wipe layer */}
          <div
            ref={curtainRef}
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-forest-deep will-change-transform"
          />

          {/* Incoming reveal: 03-dining-nook with clipping */}
          <div
            ref={d1WrapRef}
            className="absolute inset-0 z-20 h-full w-full overflow-hidden will-change-[clip-path]"
          >
            <AboutPhoto id="03-dining-nook" className="h-full w-full" />
          </div>
        </div>

        {/* Editorial text card displaying the 4 sentences */}
        <div
          ref={textCardRef}
          className="relative z-30 mx-6 mb-10 mt-auto rounded-[2px] bg-forest/90 p-6 text-linen shadow-2xl backdrop-blur-md sm:mx-10 sm:mb-12 sm:p-8 lg:absolute lg:bottom-12 lg:left-14 lg:m-0 lg:max-w-xl"
        >
          <div className="space-y-3 font-serif text-base leading-relaxed text-linen/95 sm:text-lg sm:leading-relaxed">
            <p className="block">A beautiful cabinet should feel right when you reach into it.</p>
            <p className="block">An island should leave room for the way people gather.</p>
            <p className="block">
              A material deserves consideration for how it will feel under your hand and change with use.
            </p>
          </div>
          <div className="mt-5 border-t border-linen/20 pt-4">
            <p className="font-sans text-xs uppercase tracking-[0.16em] text-taupe sm:text-sm">
              {about.purpose}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
