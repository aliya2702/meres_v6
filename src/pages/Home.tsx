import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { entrance } from '@/motion/entrance';
import { lineReveal, fadeUp, stackSection, scrubText, focusPullOnce, drawLines } from '@/motion/primitives';
import { useFullMotion } from '@/motion/hooks/useMedia';
import { home } from '@/content/copy';
import { Page } from '@/components/Page';
import { ImageFrame } from '@/components/ImageFrame';
import { VisualizationLabel } from '@/components/VisualizationLabel';
import { DraftingLines } from '@/components/DraftingLines';
import { PrimaryCTA } from '@/components/PrimaryCTA';
import { PlanRoom, Arrow } from '@/components/PlanRoom';
import { LiquidStage } from '@/webgl/LiquidStage';
import { SpacesInFocus } from '@/components/SpacesInFocus';
import { SPACES_IN_FOCUS_AFTER_PLAN_ROOM } from '@/config';
import { trust } from '@/data/trust';

export default function Home() {
  return (
    <Page>
      <Hero />
      <Details />
      <Together />
      <PlanRoom />
      {SPACES_IN_FOCUS_AFTER_PLAN_ROOM && <SpacesInFocus />}
      <DriftField />
      <Testimonials />
      <Closing />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* 6.1 "Drawn, then Built"                                             */
/* ------------------------------------------------------------------ */
const ISLAND = { x1: 160, x2: 1622, y1: 488, y2: 898 };

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const full = useFullMotion();

  useGSAP(
    (_, contextSafe) => {
      const root = ref.current!;
      const media = root.querySelector<HTMLElement>('.hero-media')!;
      const zoom = root.querySelector<HTMLElement>('.hero-zoom')!;
      const breathe = root.querySelector<HTMLElement>('.hero-breathe')!;
      const svg = root.querySelector<SVGSVGElement>('.hero-lines')!;
      const eyebrow = root.querySelector<HTMLElement>('.hero-eyebrow')!;
      const h1 = root.querySelector<HTMLElement>('.hero-h1')!;
      const rest = root.querySelectorAll<HTMLElement>('.hero-rest');
      const reduced = isReduced();
      const k = window.matchMedia('(min-width: 768px)').matches ? 1 : 0.75; // mobile at 75% duration

      const islandInset = () => {
        const W = media.clientWidth;
        const H = media.clientHeight;
        const s = Math.max(W / 1672, H / 941);
        const ox = (W - 1672 * s) / 2;
        const oy = (H - 941 * s) / 2;
        const l = ((ox + ISLAND.x1 * s) / W) * 100;
        const r = ((W - (ox + ISLAND.x2 * s)) / W) * 100;
        const t = ((oy + ISLAND.y1 * s) / H) * 100;
        const b = ((H - (oy + ISLAND.y2 * s)) / H) * 100;
        const c = (v: number) => Math.max(0, Math.min(100, v)).toFixed(2);
        return `inset(${c(t)}% ${c(r)}% ${c(b)}% ${c(l)}%)`;
      };

      gsap.set([eyebrow, h1], { visibility: 'visible' });
      const paths = gsap.utils.toArray<SVGPathElement>(svg.querySelectorAll('[data-draw]'));
      const lens = paths.map((p) => p.getTotalLength() + 1);

      if (reduced) {
        gsap.set(svg, { opacity: 0.15, color: '#F4EFE6' });
        const tl = gsap.timeline({ paused: true }).from([eyebrow, h1, ...rest], { opacity: 0, duration: 0.2, ease: 'none' });
        return entrance.on(() => tl.play());
      }

      paths.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] }));
      gsap.set(media, { clipPath: islandInset(), autoAlpha: 0 });
      gsap.set(zoom, { scale: 1.18 });
      gsap.set(eyebrow, { opacity: 0, y: 16 });
      gsap.set(rest, { opacity: 0, y: 24 });

      const h1Anim = lineReveal(h1, { paused: true, stagger: 0.12, duration: 1.0, auto: false });

      const tl = gsap.timeline({ paused: true });
      // 0–1000ms: the room is drafted
      const groups: [string, number][] = [
        ['.dl-walls', 0],
        ['.dl-window', 0.08],
        ['.dl-cabinets', 0.18],
        ['.dl-island', 0.38],
        ['.dl-stools', 0.48],
        ['.dl-pendants', 0.58],
        ['.dl-dims', 0.78],
      ];
      groups.forEach(([sel, at]) => {
        const g = svg.querySelectorAll(`${sel} [data-draw]`);
        if (g.length) tl.to(g, { strokeDashoffset: 0, duration: 0.42 * k, stagger: 0.04 * k, ease: 'meres.inOut' }, at * k);
      });
      tl.from(svg.querySelectorAll('.dl-text'), { opacity: 0, duration: 0.3 * k }, 0.85 * k);
      // 900–2200ms: the drawing becomes the room
      tl.to(media, { autoAlpha: 1, duration: 0.25 * k, ease: 'none' }, 0.9 * k)
        .to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3 * k, ease: 'meres.inOut' }, 0.9 * k)
        .to(zoom, { scale: 1, duration: 1.3 * k, ease: 'meres.inOut' }, 0.9 * k)
        .to(svg, { opacity: 0.15, color: '#F4EFE6', duration: 1.0 * k, ease: 'meres.inOut' }, 1.2 * k)
        // 1700–2700ms: eyebrow + headline
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.8 * k, ease: 'meres.out' }, 1.7 * k);
      if (h1Anim) tl.add(h1Anim.paused(false), 1.78 * k);
      // 2500–3100ms: supporting copy + CTA
      tl.to(rest, { opacity: 1, y: 0, duration: 0.6 * k, stagger: 0.08, ease: 'meres.out' }, 2.5 * k);
      // Idle: the photo breathes
      tl.add(() => {
        gsap.to(breathe, { scale: 1.03, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }, 2.2 * k);

      // On scroll: the hero pins, the next section stacks over it and the drawing draws back out.
      const stack = stackSection(root, {
        inner: root.querySelector<HTMLElement>('[data-stack-inner]'),
        shade: root.querySelector<HTMLElement>('[data-stack-shade]'),
        headline: root.querySelector<HTMLElement>('.hero-copy'),
      });
      tl.add(
        contextSafe!(() => {
          if (!stack) return;
          gsap.fromTo(
            paths,
            { strokeDashoffset: 0 },
            {
              strokeDashoffset: (i: number) => lens[i],
              ease: 'none',
              immediateRender: false,
              scrollTrigger: { trigger: root, start: 'top top', end: () => `+=${window.innerHeight * 0.8}`, scrub: 0.6 },
            },
          );
        }),
      );

      const off = entrance.on(() => tl.play());
      return () => off();
    },
    { scope: ref, dependencies: [full], revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      className="hero relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-forest-deep md:block md:h-[100svh]"
      data-header-theme="dark"
      aria-labelledby="hero-title"
    >
      <div data-stack-inner className="relative flex h-full min-h-[100svh] w-full flex-col justify-end overflow-hidden md:block md:min-h-0">
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <div className="hero-media absolute inset-0 overflow-hidden">
            <div className="hero-zoom absolute inset-0">
              <div className="hero-breathe absolute inset-0">
                <LiquidStage frames={['kitchenHero.full']} ripple priority className="absolute inset-0 h-full w-full" />
              </div>
            </div>
            {/* 55% ink gradient scrim: headline block sits at bottom-left over dark scrim so text never overlaps bright areas */}
            <div
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{
                background:
                  'linear-gradient(to top, rgba(30,31,27,0.92) 0%, rgba(30,31,27,0.78) 32%, rgba(30,31,27,0.55) 55%, rgba(30,31,27,0.18) 78%, transparent 100%)',
              }}
            />
          </div>
          <DraftingLines
            drawing="kitchen-elevation"
            className="hero-lines pointer-events-none absolute inset-0 z-[3] h-full w-full text-taupe"
            preserve="xMidYMid slice"
          />
        </div>

        <div className="hero-copy relative z-[4] w-full pt-20 md:absolute md:inset-x-0 md:bottom-0 md:pt-0">
          <div className="wrap pb-12 pt-6 text-linen md:pb-[clamp(48px,9vh,110px)] md:pt-10">
            <p className="hero-eyebrow eyebrow mb-4 !text-linen/80 md:mb-6" data-reveal="manual">
              {home.hero.eyebrow}
            </p>
            <h1 id="hero-title" className="hero-h1 d1 max-w-[11ch] text-linen" data-reveal="manual">
              {home.hero.headline}
            </h1>
            <div className="mt-6 flex flex-col gap-6 md:mt-8 md:gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="hero-rest body-copy max-w-[46ch] text-linen/90">{home.hero.supporting}</p>
              <div className="hero-rest">
                <PrimaryCTA tone="dark" className="hero-cta" />
              </div>
            </div>
          </div>
        </div>
        <div data-stack-shade className="pointer-events-none absolute inset-0 z-[6] bg-forest-deep opacity-0" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* "The details are personal." — a quiet beat: single clean frame      */
/* ------------------------------------------------------------------ */
function Details() {
  const d = home.details;
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isHovered = useRef(false);

  const items = [
    { text: d.moments[0], crop: 'kitchenDetail.full' as const, objectPosition: '60% 50%' },
    { text: d.moments[1], crop: 'kitchenHero.full' as const, objectPosition: '50% 50%' },
    { text: d.moments[2], crop: 'diningNook.full' as const, objectPosition: '50% 50%' },
  ];

  // Auto-advance visibility observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-advance every 3s while visible, pause on hover, reduced-motion shows line 1 statically
  useEffect(() => {
    if (!isVisible || isReduced()) return;
    const interval = setInterval(() => {
      if (!isHovered.current) {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible, items.length]);

  return (
    <section
      ref={sectionRef}
      className="section-pad relative z-[2] bg-linen"
      data-header-theme="light"
      aria-labelledby="details-title"
      onPointerEnter={() => {
        isHovered.current = true;
      }}
      onPointerLeave={() => {
        isHovered.current = false;
      }}
    >
      <div className="wrap">
        <h2 id="details-title" className="d2 max-w-[12ch]" data-reveal="lines">
          {d.headline}
        </h2>

        {/* Desktop: lines on left (54%), single 4:3 frame on right (42%), gap >= 24px. Mobile: frame above lines at full width */}
        <div className="mt-[clamp(56px,10vh,120px)] flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Three lines (on mobile: below frame; on desktop: left side) */}
          <div className="order-2 w-full lg:order-1 lg:max-w-[54%]">
            <ul className="flex flex-col">
              {items.map((item, i) => {
                const isActive = activeIndex === i;
                return (
                  <li key={item.text} className="border-t border-[var(--hairline)] py-7 md:py-9">
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      onFocus={() => setActiveIndex(i)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`w-full text-left transition-opacity duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
                        isActive ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                      }`}
                    >
                      <p className="d4" data-reveal="lines">
                        {item.text}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Single landscape frame with 4:3 aspect ratio (on mobile: above lines; on desktop: right side ~5 cols) */}
          <div className="order-1 w-full lg:order-2 lg:w-[42%] lg:max-w-[560px]">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-linen-deep shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              {items.map((item, i) => {
                const isActive = activeIndex === i;
                return (
                  <div
                    key={item.crop}
                    className={`absolute inset-0 transition-opacity ease-out ${
                      isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                    }`}
                    style={{ transitionDuration: '800ms' }}
                  >
                    <div
                      className="h-full w-full transition-transform ease-out"
                      style={{
                        transitionDuration: '800ms',
                        transform: isActive ? 'scale(1)' : 'scale(1.05)',
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <ImageFrame
                        crop={item.crop}
                        fill
                        sizes="(min-width:1024px) 42vw, 100vw"
                        objectPosition={item.objectPosition}
                        label={false}
                      />
                    </div>
                  </div>
                );
              })}
              <VisualizationLabel />
            </div>
          </div>
        </div>

        {/* Clear gutter > 48px separating imagery from supporting narrative */}
        <div className="grid12 mt-[clamp(96px,16vh,220px)] gap-y-8">
          <p className="d4 col-span-12 max-w-[22ch] lg:col-span-5" data-reveal="lines">
            {d.direction}
          </p>
          <p className="body-copy col-span-12 lg:col-span-6 lg:col-start-7" data-reveal="fade">
            {d.paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* "An understanding of how it comes together." — Expand to Scene      */
/* ------------------------------------------------------------------ */
function Together() {
  const ref = useRef<HTMLElement>(null);
  const full = useFullMotion();
  const t = home.together;

  useGSAP(
    () => {
      const root = ref.current!;
      const scene = root.querySelector<HTMLElement>('.expand-scene');
      const scale = root.querySelector<HTMLElement>('.expand-scene .img-scale');
      const card = root.querySelector<HTMLElement>('.together-card');
      const shade = root.querySelector<HTMLElement>('.expand-shade');
      lineReveal(root.querySelector<HTMLElement>('.together-title'));
      fadeUp(root.querySelector('.together-founder'));
      scrubText(root.querySelector<HTMLElement>('.together-scrub'));
      drawLines(root.querySelector('.card-dim'), { scroll: true, duration: 1.6 });

      if (!full || !scene || !scale || !card) return;
      // A small mug frame grows into the full-bleed scene; the text card rises over it.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.querySelector('.expand-stage'), start: 'top top', end: '+=140%', pin: true, scrub: 0.7 },
      });
      tl.fromTo(scene, { clipPath: 'inset(40% 4% 9% 71%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'meres.inOut', duration: 1 }, 0)
        .fromTo(scale, { scale: 2.2 }, { scale: 1, ease: 'meres.inOut', duration: 1 }, 0)
        .fromTo(card, { y: () => window.innerHeight * 0.32 }, { y: () => -window.innerHeight * 0.04, ease: 'none', duration: 1.1 }, 0)
        .fromTo(shade, { opacity: 0 }, { opacity: 0.35, ease: 'none', duration: 1 }, 0.2);
    },
    { scope: ref, dependencies: [full], revertOnUpdate: true },
  );

  return (
    <section ref={ref} className="on-dark relative z-[3] bg-forest text-linen" data-header-theme="dark" aria-labelledby="together-title">
      {full ? (
        <div className="expand-stage relative h-[100svh] overflow-hidden">
          <div className="expand-scene absolute inset-0" style={{ clipPath: 'inset(40% 4% 9% 71%)' }}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="img-scale absolute inset-0" style={{ transformOrigin: '92% 72%', transform: 'scale(2.2)' }}>
                <ImageFrame crop="kitchenDetail.full" fill sizes="100vw" label={false} vignette />
              </div>
            </div>
            <span className="viz-label">Concept visualization</span>
            <div className="expand-shade absolute inset-0 bg-forest-deep opacity-0" />
          </div>
          <div className="wrap relative z-[2] flex h-full items-center">
            <div className="together-card relative max-w-[min(46rem,52vw)] bg-forest/95 p-[clamp(28px,4vw,64px)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]">
              <TogetherCardInner t={t} />
            </div>
          </div>
        </div>
      ) : (
        <div className="wrap section-pad">
          <ImageFrame crop="kitchenDetail.full" sizes="100vw" reveal="mask-up" vignette parallax={0.4} />
          <div className="together-card relative -mt-16 ml-auto mr-0 max-w-[40rem] bg-forest p-7 md:-mt-28 md:p-12">
            <TogetherCardInner t={t} />
          </div>
        </div>
      )}
      <div className="wrap pb-[var(--section-pad)] pt-[clamp(48px,8vh,96px)]">
        <div className="grid12 gap-y-10">
          <p className="together-scrub d4 col-span-12 lg:col-span-8 lg:col-start-3">{t.questions}</p>
          <p className="body-copy col-span-12 text-linen/85 lg:col-span-6 lg:col-start-5" data-reveal="fade">
            {t.relationships}
          </p>
        </div>
      </div>
    </section>
  );
}

function TogetherCardInner({ t }: { t: typeof home.together }) {
  return (
    <>
      <svg className="card-dim absolute -left-6 top-0 hidden h-full w-4 text-linen/40 md:block" viewBox="0 0 16 400" preserveAspectRatio="none" fill="none" stroke="currentColor" aria-hidden="true">
        <path data-draw="" d="M8,0 L8,400" vectorEffect="non-scaling-stroke" />
        <path data-draw="" d="M2,6 L14,-6 M0,0 L16,0" vectorEffect="non-scaling-stroke" />
        <path data-draw="" d="M2,406 L14,394 M0,400 L16,400" vectorEffect="non-scaling-stroke" />
      </svg>
      <h2 id="together-title" className="together-title d3">
        {t.headline}
      </h2>
      <p className="together-founder body-copy mt-8 text-linen/90">{t.founder}</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* "You should understand what you're saying yes to." — Transparency   */
/* ------------------------------------------------------------------ */
function DriftField() {
  const ref = useRef<HTMLElement>(null);
  const y = home.yes;

  useGSAP(
    () => {
      const root = ref.current!;
      if (isReduced()) return;
      lineReveal(root.querySelector<HTMLElement>('#yes-title'));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-linen py-[clamp(96px,16vh,180px)]" data-header-theme="light" aria-labelledby="yes-title">
      <div className="wrap relative">
        <div className="mx-auto max-w-[64rem] text-center">
          <h2 id="yes-title" className="d3" data-reveal="lines">
            {y.headline}
          </h2>

          {/* 3 numbered steps: 3 columns on desktop with hairline, stacked on mobile */}
          <div className="mt-14 grid grid-cols-1 gap-8 text-left md:grid-cols-3 md:gap-0">
            {y.steps.map((st, i) => (
              <div
                key={st.num}
                className={`relative px-6 py-8 md:px-8 ${
                  i > 0 ? 'border-t border-[var(--hairline)] md:border-l md:border-t-0' : ''
                }`}
                data-mask="mask-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span className="eyebrow mb-3 block font-sans text-taupe-deep">{st.num}</span>
                <h3 className="d4 mb-3 font-serif font-normal text-ink">{st.title}</h3>
                <p className="body-copy text-[1.0625rem] leading-relaxed text-ink/80">{st.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-[2] mx-auto mt-[clamp(64px,10vh,120px)] max-w-[36rem] text-center">
          <p className="d4 italic" data-reveal="lines">
            {y.terminology}
          </p>
          <Link to="/approach" className="link-draw is-underlined mt-8" data-reveal="fade">
            {y.link}
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  if (!trust.testimonials || trust.testimonials.length === 0) return null;
  return (
    <section className="section-pad relative z-[2] bg-linen" data-header-theme="light" aria-label="Client testimonials">
      <div className="wrap">
        <p className="eyebrow mb-4">TESTIMONIALS</p>
        <h2 className="d3 mb-12 max-w-[14ch]">Conversations and completed work.</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {trust.testimonials.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex flex-col justify-between border-t border-[var(--hairline)] pt-6">
              <blockquote className="body-copy italic text-ink/90">“{item.quote}”</blockquote>
              <div className="mt-6">
                <p className="font-medium text-ink">{item.name}</p>
                <p className="text-sm text-taupe-deep">{item.project}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* "What should feel different when you come home?" — closing chapter  */
/* ------------------------------------------------------------------ */
function Closing() {
  const ref = useRef<HTMLElement>(null);
  const c = home.closing;
  useGSAP(
    () => {
      const root = ref.current!;
      focusPullOnce(root.querySelector<HTMLElement>('.start-with'), 'top 80%');
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="on-dark relative z-[2] bg-forest text-linen" data-header-theme="dark" aria-labelledby="closing-title">
      <div className="wrap section-pad">
        <div className="grid12 items-center gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <h2 id="closing-title" className="d2 max-w-[13ch]" data-reveal="lines">
              {c.headline}
            </h2>
            <p className="body-copy mt-10 text-linen/85" data-reveal="fade">
              {c.paragraph}
            </p>
            <p className="start-with d2 mt-14 origin-left will-change-[filter]">{c.start}</p>
            <div className="mt-12" data-reveal="fade">
              <PrimaryCTA tone="dark" />
              {trust.serviceTowns.length > 0 ? (
                <p className="mt-4 text-sm text-linen/75">Serving {trust.serviceTowns.join(', ')}</p>
              ) : (
                <p className="mt-4 text-sm text-linen/75">MERES serves homeowners across Seattle’s Eastside.</p>
              )}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="forest-vignette relative aspect-[4/5] w-full overflow-hidden bg-forest-deep">
              <ImageFrame crop="diningNook.garden" fill sizes="(min-width:1024px) 40vw, 100vw" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
