import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal } from '@/motion/primitives';
import { about } from '@/content/copy';
import { trust } from '@/data/trust';
import { Panel } from './AboutStack';
import { Magnetic } from '../MagneticButton';

/**
 * Scene 7 — Closing CTA panel.
 * Calm, balanced centered layout with deep forest-to-teal gradient and soft drifting radial blobs.
 * Travertine stone tile frame (M4) completely removed; no empty hole.
 * Intention copy, Eastside service line, giant serif "Tell us what matters", and a magnetic
 * circular arrow button to /contact#project-inquiry.
 */
export function AboutClosing() {
  const sectionRef = useRef<HTMLElement>(null);
  const intentionRef = useRef<HTMLParagraphElement>(null);
  const servesRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);

  const servesText =
    trust.serviceTowns.length > 0
      ? `Serving ${trust.serviceTowns.join(', ')}.`
      : about.serves;

  useEffect(() => {
    const section = sectionRef.current;
    const intention = intentionRef.current;
    const serves = servesRef.current;
    const headline = headlineRef.current;
    const ctaWrap = ctaWrapRef.current;
    if (!section || !intention || !serves || !headline || !ctaWrap) return;

    if (isReduced()) return;

    const mm = gsap.matchMedia();
    let failsafeTimer: number | undefined;
    let observer: IntersectionObserver | undefined;

    mm.add('(min-width: 768px)', () => {
      const animHead = lineReveal(headline, { paused: true, auto: false });

      gsap.set([intention, serves], { opacity: 0, y: 16 });
      gsap.set(ctaWrap, { scale: 0.85, opacity: 0 });

      const tl = gsap.timeline({ paused: true });
      tl.to([intention, serves], { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'meres.out' }, 0.1)
        .to(ctaWrap, { scale: 1, opacity: 1, duration: 0.75, ease: 'meres.out' }, 0.35);

      if (animHead) tl.add(animHead.paused(false), 0.15);

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
      });

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
        st.kill();
        tl.kill();
        animHead?.kill?.();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Panel
      id="about-closing"
      zIndex={7}
      background="var(--forest)"
      theme="dark"
      panelRef={sectionRef}
    >
      <div
        data-panel-content
        className="relative flex h-full min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-6 py-20 text-center text-linen sm:px-12 lg:px-16"
        style={{
          background: 'linear-gradient(135deg, var(--forest) 0%, #243831 55%, #1E352F 100%)',
        }}
      >
        {/* Drifting radial mood blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/4 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(173,150,128,0.28) 0%, rgba(173,150,128,0) 70%)',
            }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 h-[38rem] w-[38rem] rounded-full opacity-50 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #172B26 0%, rgba(23,43,38,0) 72%)',
            }}
          />
        </div>

        {/* Calm, beautifully balanced centered editorial composition */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center">
          {/* Supporting intention sentence from about.remaining[2] */}
          <p
            ref={intentionRef}
            className="max-w-[42ch] font-sans text-base leading-relaxed text-linen/90 sm:text-lg sm:leading-relaxed"
          >
            {about.remaining[2]}
          </p>

          {/* Eastside / service area line */}
          <p
            ref={servesRef}
            className="mt-4 font-sans text-xs uppercase tracking-[0.22em] text-linen/60"
          >
            {servesText}
          </p>

          {/* Giant serif title */}
          <h2
            ref={headlineRef}
            className="mt-8 font-serif font-normal leading-[0.96] tracking-[-0.025em] text-linen"
            style={{ fontSize: 'clamp(3.2rem, 7.8vw, 7.5rem)' }}
          >
            <span className="block">Tell us</span>
            <span className="block">what matters</span>
          </h2>

          {/* Magnetic circular arrow button to /contact#project-inquiry */}
          <div ref={ctaWrapRef} className="mt-10 sm:mt-12">
            <Magnetic>
              <Link
                to="/contact#project-inquiry"
                data-about-cursor="cta"
                aria-label="Tell us what matters — begin your project inquiry"
                className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(232,222,206,0.45)] bg-[rgba(35,45,34,0.3)] text-linen transition-colors duration-300 hover:border-linen hover:bg-linen hover:text-forest sm:h-24 sm:w-24"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.3}
                  className="h-6 w-6 sm:h-7 sm:w-7"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </Panel>
  );
}
