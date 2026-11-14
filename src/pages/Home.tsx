import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger, useGSAP } from '@/motion/gsap';
import { isReduced, isDesktop } from '@/motion/tokens';
import { entrance } from '@/motion/entrance';
import { lineReveal, fadeUp, stackSection, scrubText, focusPullOnce, drawLines } from '@/motion/primitives';
import { useFullMotion } from '@/motion/hooks/useMedia';
import { home } from '@/content/copy';
import { Page } from '@/components/Page';
import { ImageFrame } from '@/components/ImageFrame';
import { DraftingLines } from '@/components/DraftingLines';
import { PrimaryCTA } from '@/components/PrimaryCTA';
import { PlanRoom, Arrow } from '@/components/PlanRoom';
import { PanelWipeFrame } from '@/components/PanelWipeFrame';
import { LiquidStage } from '@/webgl/LiquidStage';

export default function Home() {
  return (
    <Page>
      <Hero />
      <Details />
      <Together />
      <PlanRoom />
      <DriftField />
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
      className="hero relative overflow-hidden bg-linen md:h-[100svh]"
      data-header-theme="dark"
      aria-labelledby="hero-title"
    >
      <div data-stack-inner className="relative h-full w-full">
        <div className="relative h-[62svh] w-full md:absolute md:inset-0 md:h-full">
          <div className="hero-media absolute inset-0 overflow-hidden">
            <div className="hero-zoom absolute inset-0">
              <div className="hero-breathe absolute inset-0">
                <LiquidStage frames={['kitchenHero.full']} ripple priority className="absolute inset-0 h-full w-full" />
              </div>
            </div>
            {/* soft forest gradient under the text for contrast */}
            <div
              className="pointer-events-none absolute inset-0 z-[2] hidden md:block"
              style={{ background: 'linear-gradient(20deg, rgba(31,38,32,0.82) 0%, rgba(31,38,32,0.45) 38%, rgba(31,38,32,0) 64%)' }}
            />
          </div>
          <DraftingLines
            drawing="kitchen-elevation"
            className="hero-lines pointer-events-none absolute inset-0 z-[3] h-full w-full text-taupe"
            preserve="xMidYMid slice"
          />
        </div>

        <div className="hero-copy relative z-[4] md:absolute md:inset-x-0 md:bottom-0">
          <div className="wrap pb-14 pt-10 text-ink md:pb-[clamp(48px,9vh,110px)] md:text-linen">
            <p className="hero-eyebrow eyebrow mb-6 !text-taupe-deep md:!text-linen/80" data-reveal="manual">
              {home.hero.eyebrow}
            </p>
            <h1 id="hero-title" className="hero-h1 d1 max-w-[11ch]" data-reveal="manual">
              {home.hero.headline}
            </h1>
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="hero-rest body-copy max-w-[46ch] md:text-linen/90">{home.hero.supporting}</p>
              <div className="hero-rest">
                <PrimaryCTA tone="inherit" className="hero-cta" />
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
/* "The details are personal." — a quiet beat: no pin, only reveals   */
/* ------------------------------------------------------------------ */
function Details() {
  const d = home.details;
  const pairs = [
    { text: d.moments[0], crop: 'kitchenHero.stools' as const, pos: 'lg:right-[24%] lg:top-[-8%] lg:w-[min(19vw,340px)]' },
    { text: d.moments[1], crop: 'kitchenWide.island' as const, pos: 'lg:right-[0%] lg:top-[20%] lg:w-[min(17vw,300px)]' },
    { text: d.moments[2], crop: 'diningNook.full' as const, pos: 'lg:right-[17%] lg:top-[66%] lg:w-[min(24vw,440px)]' },
  ];
  return (
    <section className="section-pad relative z-[2] bg-linen" data-header-theme="light" aria-labelledby="details-title">
      <div className="wrap">
        <h2 id="details-title" className="d2 max-w-[12ch]" data-reveal="lines">
          {d.headline}
        </h2>

        <div className="relative mt-[clamp(56px,10vh,120px)]" data-parallax-trigger="">
          <ul className="relative z-[2] flex flex-col lg:w-[52%]">
            {pairs.map((p) => (
              <li key={p.text} className="border-t border-[var(--hairline)] py-7 md:py-9">
                <p className="d4" data-reveal="lines">
                  {p.text}
                </p>
              </li>
            ))}
          </ul>
          {/* small floating images, drifting faster than the text */}
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:mt-0 lg:block">
            {pairs.map((p, i) => (
              <div key={p.crop} className={`lg:absolute ${p.pos} ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`} data-parallax="1.6">
                <ImageFrame crop={p.crop} ratio={i === 1 ? '4 / 5' : '5 / 4'} sizes="(min-width:1024px) 28vw, 50vw" reveal="mask-up" parallax={0.4} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid12 mt-[clamp(72px,14vh,180px)] gap-y-8">
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
      <h2 id="together-title" className="together-title d3" data-reveal="manual">
        {t.headline}
      </h2>
      <p className="together-founder body-copy mt-8 text-linen/90">{t.founder}</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* "You should understand what you're saying yes to." — Drift Field    */
/* ------------------------------------------------------------------ */
function DriftField() {
  const ref = useRef<HTMLElement>(null);
  const y = home.yes;
  const frames = [
    { crop: 'wineBar.arch' as const, speed: 0.6, cls: 'lg:left-[2%] lg:top-[4%] lg:w-[min(14vw,260px)]', ratio: '3 / 4', blur: true },
    { crop: 'secondKitchen.chandelier' as const, speed: 1.0, cls: 'lg:right-[4%] lg:top-[14%] lg:w-[min(16vw,300px)]', ratio: '4 / 5' },
    { crop: 'kitchenHero.pendants' as const, speed: 1.5, cls: 'lg:left-[5%] lg:top-[50%] lg:w-[min(15vw,290px)]', ratio: '5 / 4' },
    { crop: 'kitchenDetail.faucet' as const, speed: 2.1, cls: 'lg:right-[1%] lg:top-[66%] lg:w-[min(13vw,240px)]', ratio: '3 / 4', blur: true },
  ];
  useGSAP(
    () => {
      const root = ref.current!;
      if (isReduced()) return;
      // The paragraph fades from its top edge as it leaves.
      root.querySelectorAll<HTMLElement>('.drift-text > *').forEach((el) => {
        gsap.to(el, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 20%', end: 'top -2%', scrub: true },
        });
      });
      if (isDesktop()) {
        root.querySelectorAll<HTMLElement>('[data-blur]').forEach((el) => gsap.set(el, { filter: 'blur(2px)' }));
      }
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative overflow-hidden bg-linen" data-header-theme="light" aria-labelledby="yes-title">
      <div className="wrap relative py-[clamp(120px,22vh,280px)]" data-parallax-trigger="">
        <div className="pointer-events-none mb-16 grid grid-cols-2 gap-4 lg:absolute lg:inset-0 lg:mb-0 lg:block" aria-hidden="false">
          {frames.map((f) => (
            <div key={f.crop} className={`lg:absolute ${f.cls}`} data-parallax={String(f.speed)} data-blur={f.blur ? '' : undefined}>
              <ImageFrame crop={f.crop} ratio={f.ratio} sizes="(min-width:1024px) 22vw, 50vw" reveal="mask-up" />
            </div>
          ))}
        </div>
        <div className="drift-text relative z-[2] mx-auto max-w-[36rem] text-center">
          <h2 id="yes-title" className="d3" data-reveal="lines">
            {y.headline}
          </h2>
          {y.paragraphs.map((p) => (
            <p key={p} className="body-copy mx-auto mt-8" data-reveal="fade">
              {p}
            </p>
          ))}
        </div>
        <div className="relative z-[2] mx-auto mt-[clamp(72px,12vh,140px)] max-w-[36rem] text-center">
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

/* ------------------------------------------------------------------ */
/* "What should feel different when you come home?" — closing chapter  */
/* ------------------------------------------------------------------ */
function Closing() {
  const ref = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const c = home.closing;
  useGSAP(
    () => {
      const root = ref.current!;
      focusPullOnce(root.querySelector<HTMLElement>('.start-with'), 'top 80%');
      ScrollTrigger.create({
        trigger: root,
        start: 'top 15%',
        onEnter: () => setIdx(1),
        onLeaveBack: () => setIdx(0),
      });
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="on-dark relative bg-forest text-linen" data-header-theme="dark" aria-labelledby="closing-title">
      <div data-stack-inner className="wrap section-pad">
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
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div data-mask="mask-up">
              <PanelWipeFrame
                frames={[{ crop: 'diningNook.garden' }, { crop: 'diningNook.full' }]}
                index={idx}
                panel="linen"
                className="forest-vignette aspect-[4/5] w-full"
                sizes="(min-width:1024px) 40vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
      <div data-stack-shade className="pointer-events-none absolute inset-0 bg-forest-deep opacity-0" />
    </section>
  );
}
