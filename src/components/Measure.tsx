import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { useFullMotion } from '@/motion/hooks/useMedia';
import { scrollToTarget } from '@/app/lenis';
import { approach } from '@/content/copy';
import { ImageFrame } from './ImageFrame';
import { DraftingLines } from './DraftingLines';
import { MaterialPanel } from './MaterialPanel';
import { PanelWipeFrame, type WipeFrame } from './PanelWipeFrame';

const steps = approach.steps;
const label = (i: number) => `Go to step ${i + 1}: ${steps[i].title.replace(/\.$/, '')}`;

function ChangeAnnotation() {
  return (
    <MaterialPanel variant="walnut" className="absolute inset-0">
      <svg className="absolute inset-0 h-full w-full text-linen" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M60,330 L340,330 M60,318 L60,342 M340,318 L340,342 M52,338 L68,322 M332,338 L348,322" vectorEffect="non-scaling-stroke" />
        <path d="M60,250 L60,410 M340,250 L340,410" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" opacity="0.6" />
        <path d="M200,330 L240,200" vectorEffect="non-scaling-stroke" />
        <rect x="150" y="146" width="210" height="56" rx="2" fill="#F4EFE6" stroke="none" />
        <text x="255" y="181" fill="#1E1F1B" stroke="none" fontFamily="DM Sans, sans-serif" fontSize="17" fontWeight="500" textAnchor="middle">
          Approved in writing
        </text>
      </svg>
    </MaterialPanel>
  );
}

const frames: WipeFrame[] = [
  { crop: 'diningNook.book' },
  {
    key: 'range-drawing',
    node: (
      <>
        <ImageFrame crop="kitchenDetail.range" fill sizes="45vw" />
        <DraftingLines drawing="kitchen-elevation" className="absolute inset-0 z-[2] h-full w-full text-linen opacity-50" preserve="xMidYMid slice" />
      </>
    ),
  },
  { crop: 'kitchenWide.throughDoor' },
  { key: 'walnut-change', node: <ChangeAnnotation /> },
  { crop: 'secondKitchen.full' },
];

/** "The Measure" — a builder's tape that tracks progress through the five steps. */
export function Measure() {
  const full = useFullMotion();
  return full ? <MeasurePinned /> : <MeasureStacked />;
}

function MeasurePinned() {
  const ref = useRef<HTMLElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  useGSAP(
    () => {
      const root = ref.current!;
      const fill = root.querySelector<HTMLElement>('.ruler-fill')!;
      const marker = root.querySelector<HTMLElement>('.ruler-marker')!;
      const track = root.querySelector<HTMLElement>('.ruler-track')!;
      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
      st.current = ScrollTrigger.create({
        trigger: root.querySelector('.measure-stage'),
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(fill, { scaleX: p });
          gsap.set(marker, { x: p * track.offsetWidth });
          const s = Math.min(4, Math.floor(p * 5));
          if (s !== stepRef.current) {
            stepRef.current = s;
            setStep(s);
          }
        },
      });
    },
    { scope: ref },
  );

  // Step entrance: number slides in, headline line-reveals, body fades in.
  useGSAP(
    () => {
      const root = ref.current!;
      const block = root.querySelector<HTMLElement>(`.step-block[data-step="${step}"]`);
      if (!block) return;
      root.querySelectorAll<HTMLElement>('.step-block').forEach((b) => gsap.set(b, { autoAlpha: b === block ? 1 : 0 }));
      gsap.fromTo(block.querySelector('.step-num'), { xPercent: -30, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1, ease: 'meres.out' });
      const h = block.querySelector<HTMLElement>('.step-title')!;
      const split = SplitText.create(h, { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.09, ease: 'meres.out', delay: 0.1 });
      gsap.fromTo(block.querySelectorAll('.step-body p'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.3 });
    },
    { scope: ref, dependencies: [step], revertOnUpdate: true },
  );

  const goTo = (i: number) => {
    const t = st.current;
    if (!t) return;
    scrollToTarget(t.start + ((i + 0.5) / 5) * (t.end - t.start), { offset: 0 });
  };

  return (
    <section ref={ref} className="relative bg-linen" data-header-theme="light" aria-label="Our approach in five steps">
      <div className="measure-stage relative flex h-[100svh] flex-col overflow-hidden">
        <div className="wrap grid12 flex-1 items-center pt-[var(--header-h)]">
          <div className="relative col-span-6 h-[52vh]">
            {steps.map((s, i) => (
              <div key={s.title} className="step-block absolute inset-0 flex flex-col justify-center" data-step={i} style={{ visibility: i === 0 ? 'visible' : 'hidden' }} aria-hidden={i !== step}>
                <span className="step-num d1 mb-4 block leading-none text-transparent [-webkit-text-stroke:1px_var(--taupe)]" aria-hidden="true">
                  {i + 1}
                </span>
                <h2 className="step-title d3 max-w-[16ch]">{s.title}</h2>
                <div className="step-body body-copy mt-6 max-w-[54ch] text-[1.1875rem]">
                  {s.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-5 col-start-8">
            <PanelWipeFrame frames={frames} index={step} className="aspect-[4/5] max-h-[58vh] w-full" sizes="40vw" />
          </div>
        </div>

        {/* The ruler: bottom 20% */}
        <div className="wrap relative h-[20vh] min-h-[130px]">
          <div className="ruler-track relative mt-6 h-[70px] w-full">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-linen-deep">
              <div className="ruler-fill absolute inset-0 bg-green" />
            </div>
            <div className="absolute inset-x-0 top-0" aria-hidden="true">
              {Array.from({ length: 101 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute top-0 w-px bg-taupe"
                  style={{ left: `${i}%`, height: i % 10 === 0 ? 26 : i % 5 === 0 ? 16 : 9, opacity: i % 10 === 0 ? 0.9 : 0.55 }}
                />
              ))}
            </div>
            <div className="ruler-marker pointer-events-none absolute -top-[11px] left-0 z-[2] -ml-[9px] h-[24px] w-[18px] bg-forest" aria-hidden="true">
              <span className="absolute left-1/2 top-[5px] h-[9px] w-[2px] -translate-x-1/2 bg-linen" />
            </div>
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                className={`absolute top-8 -ml-[22px] grid h-[44px] w-[44px] place-items-center font-sans text-[1.1875rem] font-medium transition-colors duration-300 ${i === step ? 'text-green' : 'text-taupe-deep hover:text-ink'}`}
                style={{ left: `${((i + 0.5) / 5) * 100}%` }}
                aria-label={label(i)}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mobile / reduced motion: no pin; a vertical ruler on the left edge fills as the cards pass. */
function MeasureStacked() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = ref.current!;
      if (isReduced()) return;
      gsap.fromTo(
        root.querySelector('.vruler-fill'),
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root.querySelector('.vruler-list'), start: 'top 60%', end: 'bottom 60%', scrub: true } },
      );
      root.querySelectorAll<HTMLElement>('.vstep').forEach((el) =>
        gsap.from(el.querySelectorAll('.vfade'), { opacity: 0, y: 24, stagger: 0.1, duration: 0.9, scrollTrigger: { trigger: el, start: 'top 80%', once: true } }),
      );
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="section-pad relative bg-linen" data-header-theme="light" aria-label="Our approach in five steps">
      <div className="wrap">
        <ol className="vruler-list relative pl-12 md:pl-20">
          <span className="absolute bottom-0 left-3 top-0 w-[3px] bg-linen-deep md:left-6" aria-hidden="true">
            <span className="vruler-fill absolute inset-0 origin-top bg-green" />
          </span>
          {steps.map((s, i) => (
            <li key={s.title} className="vstep relative pb-20 last:pb-0">
              <span className="absolute -left-12 top-2 grid h-8 w-8 place-items-center bg-forest text-[1rem] font-medium text-linen md:-left-[3.6rem]" aria-hidden="true">
                {i + 1}
              </span>
              <span className="vfade d2 block leading-none text-transparent [-webkit-text-stroke:1px_var(--taupe)]" aria-hidden="true">
                {i + 1}
              </span>
              <h2 className="vfade d3 mt-2">{s.title}</h2>
              <div className="vfade body-copy mt-5">
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="vfade relative mt-8 aspect-[4/3] w-full overflow-hidden">
                {'crop' in frames[i] ? (
                  <ImageFrame crop={(frames[i] as { crop: Parameters<typeof ImageFrame>[0]['crop'] }).crop} fill sizes="100vw" />
                ) : (
                  (frames[i] as { node: React.ReactNode }).node
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
