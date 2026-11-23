import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { stackSection, drawLines, focusPullOnce, lineReveal, scrubText } from '@/motion/primitives';
import { services } from '@/content/copy';
import { scrollToTarget } from '@/app/lenis';
import { images, type CropKey } from '@/data/images';
import { Page } from '@/components/Page';
import { ImageFrame } from '@/components/ImageFrame';
import { DraftingLines } from '@/components/DraftingLines';
import { PrimaryCTA } from '@/components/PrimaryCTA';
import { PlanRoomIndex, DraftedCorners } from '@/components/PlanRoom';
import { LiquidStage } from '@/webgl/LiquidStage';

const chapters = [
  { id: services.kitchens.id, label: services.kitchens.title },
  { id: services.bathrooms.id, label: services.bathrooms.title },
  { id: services.wholeHome.id, label: services.wholeHome.title },
  { id: services.additions.id, label: services.additions.title },
];

export default function Services() {
  return (
    <Page>
      <Opening />
      <Chapters />
      <ServicesClosing />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
function Opening() {
  const o = services.opening;
  return (
    <section className="relative overflow-hidden bg-linen pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]" data-header-theme="light" aria-labelledby="services-title">
      <DraftingLines
        drawing="plan"
        autoDraw
        className="pointer-events-none absolute right-[-8%] top-[6%] w-[min(78vw,1100px)] text-taupe opacity-40"
        strokeWidth={1}
      />
      <div className="wrap relative">
        <h1 id="services-title" className="d1 max-w-[12ch]" data-reveal="lines">
          {o.headline}
        </h1>
        <div className="grid12 mt-[clamp(56px,9vh,110px)] gap-y-6">
          <div className="body-copy col-span-12 lg:col-span-6 lg:col-start-7" data-reveal="stagger">
            {o.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <div className="pb-[var(--section-pad)] pt-[clamp(72px,12vh,150px)]">
          <PlanRoomIndex />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapters + sticky index                                             */
/* ------------------------------------------------------------------ */
function Chapters() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const root = ref.current!;
      const sections = gsap.utils.toArray<HTMLElement>('.chapter', root);
      const bars = gsap.utils.toArray<HTMLElement>('.idx-bar', root);
      const index = root.querySelector<HTMLElement>('.chapter-index');
      sections.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: s,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        });
        if (bars[i]) {
          gsap.fromTo(
            bars[i],
            { scaleY: 0 },
            { scaleY: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top 55%', end: 'bottom 55%', scrub: true } },
          );
        }
      });
      if (index) {
        gsap.set(index, { autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: root,
          start: 'top 40%',
          end: 'bottom 60%',
          onToggle: (self) => gsap.to(index, { autoAlpha: self.isActive ? 1 : 0, duration: 0.45 }),
        });
      }
    },
    { scope: ref },
  );

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) scrollToTarget(el);
  };

  return (
    <div ref={ref} className="chapters relative">
      {/* Desktop: fixed index on the left */}
      <nav aria-label="Service chapters" className="chapter-index fixed left-[var(--margin)] top-1/2 z-[40] hidden -translate-y-1/2 lg:block">
        <ul className="flex flex-col gap-4">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => jump(c.id)}
                className={`group flex min-h-[44px] items-center gap-4 text-left transition-colors duration-500 ${active === i ? 'text-green' : 'text-taupe-deep hover:text-ink'}`}
                aria-current={active === i ? 'true' : undefined}
              >
                <span className="relative h-10 w-[2px] overflow-hidden bg-[var(--hairline)]">
                  <span className="idx-bar absolute inset-0 origin-top bg-green" style={{ transform: 'scaleY(0)' }} />
                </span>
                <span className="eyebrow !tracking-[0.13em] !text-current">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile/tablet: horizontal scroll-snapping chip bar under the header */}
      <nav aria-label="Service chapters" className="sticky top-0 z-[40] border-b border-[var(--hairline)] bg-linen/95 backdrop-blur lg:hidden">
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-[var(--margin)] py-3 [scrollbar-width:none]">
          {chapters.map((c, i) => (
            <li key={c.id} className="snap-start">
              <button
                type="button"
                onClick={() => jump(c.id)}
                className={`min-h-[44px] whitespace-nowrap rounded-[2px] border px-4 text-[1.1875rem] transition-colors ${active === i ? 'border-green bg-green text-linen' : 'border-[var(--hairline)] text-ink'}`}
                aria-current={active === i ? 'true' : undefined}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Kitchens />
      <Bathrooms />
      <WholeHome />
      <Additions />
    </div>
  );
}

/** Chapter shell: cropped decorative word + readable h2, stacked over the previous chapter. */
function Chapter({
  id,
  title,
  n,
  children,
  bg = 'bg-linen',
  stack = true,
  background,
}: {
  id: string;
  title: string;
  n: number;
  children: React.ReactNode;
  bg?: string;
  stack?: boolean;
  background?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = ref.current!;
      lineReveal(root.querySelector<HTMLElement>('.chapter-h2'));
      if (!isReduced()) {
        gsap.from(root.querySelector('.crop-word'), {
          xPercent: 8,
          opacity: 0,
          duration: 1.6,
          ease: 'meres.out',
          scrollTrigger: { trigger: root, start: 'top 75%', once: true },
        });
        // 2px green hairline grows across the seam as this chapter arrives
        const seam = root.querySelector('.chapter-seam');
        if (seam && n > 1)
          gsap.fromTo(seam, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true } });
      }
      if (stack) {
        stackSection(root, {
          inner: root.querySelector<HTMLElement>('[data-stack-inner]'),
          shade: root.querySelector<HTMLElement>('[data-stack-shade]'),
        });
      }
    },
    { scope: ref },
  );
  return (
    <section ref={ref} id={id} className={`chapter relative overflow-x-clip ${bg}`} data-header-theme="light" aria-labelledby={`${id}-title`}>
      <div data-stack-inner className="relative">
        {background}
        <div className="relative">
          <div className="wrap pt-[var(--section-pad)] lg:pl-[calc(var(--margin)+var(--index-w))]">
            <span aria-hidden="true" className="crop-word text-right text-taupe/45">
              {title}
            </span>
            <p className="eyebrow mt-6">{`Chapter 0${n}`}</p>
            <h2 id={`${id}-title`} className="chapter-h2 d3 mt-3" data-reveal="manual">
              {title}
            </h2>
          </div>
          {children}
        </div>
      </div>
      <div data-stack-shade className="pointer-events-none absolute inset-0 z-[8] bg-forest-deep opacity-0" />
      <div className="chapter-seam absolute inset-x-0 top-0 z-[9] h-[2px] origin-left bg-green" style={{ transform: 'scaleX(0)' }} aria-hidden="true" />
    </section>
  );
}

/* ---------- Kitchens: sticky Liquid stage + drag strip ---------- */
const kitchenFrames: CropKey[] = ['kitchenWide.full'];
const stripCrops: CropKey[] = [
  'secondKitchen.chandelier',
  'kitchenDetail.faucet',
  'kitchenHero.stools',
  'kitchenDetail.mug',
];

function Kitchens() {
  const k = services.kitchens;
  const col = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: col.current,
        start: 'top 45%',
        end: 'bottom 55%',
        onUpdate: (self) => setIdx(Math.min(kitchenFrames.length - 1, Math.floor(self.progress * kitchenFrames.length))),
      });
      gsap.utils.toArray<HTMLElement>('.k-para', col.current).forEach((p) =>
        gsap.from(p, { opacity: 0, y: 30, duration: 1, ease: 'meres.out', scrollTrigger: { trigger: p, start: 'top 75%', once: true } }),
      );
    },
    { scope: col },
  );
  return (
    <Chapter id={k.id} title={k.title} n={1}>
      <div className="wrap grid12 mt-[clamp(40px,8vh,100px)] gap-y-10 lg:pl-[calc(var(--margin)+var(--index-w))]">
        <div ref={col} className="col-span-12 lg:col-span-5">
          {k.paragraphs.map((p, i) => (
            <div key={p} className="flex min-h-[44vh] items-center py-8 lg:min-h-[78vh]">
              <p className={`k-para ${i === 0 ? 'd4' : 'body-copy'}`}>{p}</p>
            </div>
          ))}
        </div>
        <div className="col-span-12 row-start-1 lg:col-span-7 lg:row-start-auto">
          <div className="lg:sticky lg:top-[12vh]">
            <LiquidStage frames={kitchenFrames} index={idx} className="aspect-[4/3] w-full lg:aspect-auto lg:h-[76vh]" sizes="(min-width:1024px) 55vw, 100vw" />
          </div>
        </div>
      </div>
      <DragStrip />
    </Chapter>
  );
}

function DragStrip() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      lastT = performance.now();
      v = 0;
      gsap.killTweensOf(el);
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const now = performance.now();
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startLeft - dx;
      v = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      el.releasePointerCapture(e.pointerId);
      el.classList.remove('is-dragging');
      // momentum
      const target = el.scrollLeft - v * 420;
      if (!isReduced()) gsap.to(el, { scrollLeft: target, duration: 1.1, ease: 'meres.out' });
    };
    const onClick = (e: MouseEvent) => {
      if (moved) e.preventDefault();
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, []);
  return (
    <div className="pb-[var(--section-pad)] pt-[clamp(56px,10vh,120px)]">
      <div className="wrap mb-6 flex items-end justify-between lg:pl-[calc(var(--margin)+var(--index-w))]">
        <p className="eyebrow">Details · drag to explore</p>
      </div>
      <div
        ref={ref}
        className="drag-strip flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--margin)] pb-4 [scrollbar-width:thin] lg:snap-none lg:pl-[calc(var(--margin)*2+var(--index-w))]"
        tabIndex={0}
        role="region"
        aria-label="Kitchen details, scroll horizontally"
        data-lenis-prevent-touch=""
      >
        {stripCrops.map((c) => (
          <div key={c} className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[min(30vw,520px)]">
            <ImageFrame crop={c} ratio="4 / 3" sizes="(min-width:1024px) 30vw, 78vw" />
          </div>
        ))}
        <div className="w-[var(--margin)] shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}

/* ---------- Bathrooms: no photographs ---------- */
function Bathrooms() {
  const b = services.bathrooms;
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const root = ref.current!;
      const svg = root.querySelector('svg[data-drawing="bath-elevation"]');
      drawLines(svg, { scroll: true, duration: 2.2, stagger: 0.03, start: 'top 70%' });
      gsap.utils.toArray<HTMLElement>('.b-para', root).forEach((p) =>
        gsap.from(p, { opacity: 0, y: 24, duration: 1, scrollTrigger: { trigger: p, start: 'top 82%', once: true } }),
      );
      focusPullOnce(root.querySelector<HTMLElement>('.b-focus'), 'top 78%');
    },
    { scope: ref },
  );
  return (
    <Chapter
      id={b.id}
      title={b.title}
      n={2}
      bg="bg-linen"
    >
      <div ref={ref} className="wrap grid12 gap-y-12 pb-[var(--section-pad)] pt-[clamp(40px,8vh,100px)] lg:pl-[calc(var(--margin)+var(--index-w))]">
        <div className="col-span-12 flex flex-col gap-8 lg:col-span-5">
          {b.paragraphs.map((p) => (
            <p key={p} className="b-para body-copy bg-linen/80 p-6 backdrop-blur-[2px] md:p-8">
              {p}
            </p>
          ))}
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="relative bg-linen/60 p-4 backdrop-blur-[1px]">
            <DraftedCorners className="text-taupe-deep" />
            <DraftingLines drawing="bath-elevation" className="h-auto w-full text-taupe-deep" />
          </div>
        </div>
        <p className="b-focus d3 col-span-12 mt-10 max-w-[22ch] origin-left lg:col-span-9">{b.focus}</p>
      </div>
    </Chapter>
  );
}

/* ---------- Whole-home: dining nook in a clean 4:3 frame ---------- */
function WholeHome() {
  const w = services.wholeHome;
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const root = ref.current!;
      gsap.utils.toArray<HTMLElement>('.wh-para', root).forEach((p) =>
        gsap.from(p, { opacity: 0, y: 24, duration: 1, scrollTrigger: { trigger: p, start: 'top 80%', once: true } }),
      );
    },
    { scope: ref },
  );
  return (
    <Chapter id={w.id} title={w.title} n={3}>
      <div ref={ref}>
        <div className="wrap grid12 mt-[clamp(40px,8vh,100px)] gap-y-10 lg:pl-[calc(var(--margin)+var(--index-w))]">
          <div className="wh-col col-span-12 lg:col-span-5">
            {w.paragraphs.map((p, i) => (
              <div key={p} className="flex min-h-[36vh] items-center py-6 lg:min-h-[48vh]">
                <p className={`wh-para ${i === 0 ? 'd4' : 'body-copy'}`}>{p}</p>
              </div>
            ))}
          </div>
          <div className="col-span-12 row-start-1 lg:col-span-7 lg:row-start-auto">
            <div className="relative overflow-hidden lg:sticky lg:top-[16vh]">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[2px] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                <ImageFrame crop="diningNook.full" fill sizes="(min-width:1024px) 55vw, 100vw" />
              </div>
            </div>
          </div>
        </div>
        {/* A quiet beat on linen */}
        <div className="wrap py-[clamp(120px,24vh,280px)] text-center">
          <p className="d3 mx-auto max-w-[20ch]" data-reveal="lines">
            {w.quiet}
          </p>
        </div>
      </div>
    </Chapter>
  );
}

/* ---------- Additions & custom homes: site → section, no photographs ---------- */
function Additions() {
  const a = services.additions;
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const root = ref.current!;
      const site = root.querySelector('svg[data-drawing="site"]');
      const section = root.querySelector('svg[data-drawing="addition-section"]');
      gsap.utils.toArray<HTMLElement>('.ad-para', root).forEach((p) =>
        gsap.from(p, { opacity: 0, y: 24, duration: 1, scrollTrigger: { trigger: p, start: 'top 82%', once: true } }),
      );
      const siteTl = drawLines(site, { paused: true, duration: 1.6, stagger: 0.05 });
      // existing house first, then the new wing grows beside it
      const existing = drawLines(section, { paused: true, duration: 1.2, stagger: 0.04, selector: '.dl-ground [data-draw], .dl-existing [data-draw]' });
      const wing = drawLines(section, { paused: true, duration: 1.6, stagger: 0.12, selector: '.dl-newwing [data-draw], .dl-dims [data-draw]' });
      if (!siteTl) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 70%', once: true } });
      tl.add(siteTl.paused(false), 0);
      if (existing) tl.add(existing.paused(false), 0.9);
      if (wing) tl.add(wing.paused(false), 2.0);
      tl.from(root.querySelectorAll('.dl-text'), { opacity: 0, duration: 0.8 }, 2.6);
    },
    { scope: ref },
  );
  return (
    <Chapter id={a.id} title={a.title} n={4} stack={false} bg="bg-linen">
      <div ref={ref} className="wrap grid12 gap-y-14 pb-[var(--section-pad)] pt-[clamp(40px,8vh,100px)] lg:pl-[calc(var(--margin)+var(--index-w))]">
        <div className="col-span-12 grid gap-8 md:grid-cols-2">
          <figure className="relative border border-taupe/50 p-4">
            <DraftedCorners />
            <DraftingLines drawing="site" className="h-auto w-full text-taupe-deep" />
          </figure>
          {images.exterior?.status === 'client' ? (
            <figure className="relative min-h-[240px] overflow-hidden border border-taupe/50">
              <ImageFrame crop="exterior.full" fill sizes="(min-width:768px) 50vw, 100vw" />
            </figure>
          ) : (
            <figure className="relative border border-taupe/50 p-4">
              <DraftedCorners />
              <DraftingLines drawing="addition-section" className="h-auto w-full text-taupe-deep" />
            </figure>
          )}
        </div>
        <div className="col-span-12 flex flex-col gap-8 lg:col-span-6">
          {a.paragraphs.map((p) => (
            <p key={p} className="ad-para body-copy">
              {p}
            </p>
          ))}
        </div>
        <p className="ad-para d4 col-span-12 max-w-[26ch] lg:col-span-5 lg:col-start-8 lg:self-end">{a.permitting}</p>
      </div>
    </Chapter>
  );
}

/* ------------------------------------------------------------------ */
function ServicesClosing() {
  const c = services.closing;
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => scrubText(ref.current!.querySelector<HTMLElement>('.sc-scrub')), { scope: ref });
  return (
    <section ref={ref} className="on-dark relative bg-forest text-linen" data-header-theme="dark" aria-labelledby="sc-title">
      <div data-stack-shade className="pointer-events-none absolute inset-0 z-[3] bg-forest-deep opacity-0" />
      <div className="wrap section-pad">
        <div className="grid12 gap-y-10">
          <h2 id="sc-title" className="d2 col-span-12 max-w-[14ch] lg:col-span-7" data-reveal="lines">
            {c.headline}
          </h2>
          <div className="col-span-12 flex flex-col gap-8 lg:col-span-7 lg:col-start-6">
            <p className="body-copy text-linen/85" data-reveal="fade">
              {c.paragraphs[0]}
            </p>
            <p className="sc-scrub d4">{c.paragraphs[1]}</p>
            <p className="body-copy text-linen/85" data-reveal="fade">
              {c.paragraphs[2]}
            </p>
            <div className="mt-6" data-reveal="fade">
              <PrimaryCTA tone="dark" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

