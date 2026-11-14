import { useRef } from 'react';
import { useGSAP } from '@/motion/gsap';
import { stackSection, lineReveal } from '@/motion/primitives';
import { entrance } from '@/motion/entrance';
import { approach } from '@/content/copy';
import { Page } from '@/components/Page';
import { ImageFrame } from '@/components/ImageFrame';
import { PrimaryCTA } from '@/components/PrimaryCTA';
import { Measure } from '@/components/Measure';

export default function Approach() {
  return (
    <Page>
      <Opening />
      <IntroCard />
      <Measure />
      <Begin />
    </Page>
  );
}

function Opening() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = ref.current!;
      const h1 = root.querySelector<HTMLElement>('h1');
      const anim = lineReveal(h1, { paused: true, auto: false, stagger: 0.12 });
      const off = entrance.on(() => anim?.play());
      stackSection(root, {
        inner: root.querySelector<HTMLElement>('[data-stack-inner]'),
        shade: root.querySelector<HTMLElement>('[data-stack-shade]'),
        headline: h1,
      });
      return () => off();
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative h-[100svh] overflow-hidden bg-forest text-linen" data-header-theme="dark" aria-labelledby="approach-title">
      <div data-stack-inner className="absolute inset-0">
        <ImageFrame crop="kitchenDetail.faucet" fill sizes="100vw" priority parallax={0.4} vignette>
          <div className="absolute inset-0 z-[1] bg-forest-deep/30" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-forest-deep/70 via-transparent to-transparent" />
        </ImageFrame>
        <div className="wrap absolute inset-x-0 bottom-0 z-[3] pb-[clamp(56px,12vh,140px)]">
          <h1 id="approach-title" className="d1 max-w-[10ch]" data-reveal="manual">
            {approach.opening.headline}
          </h1>
        </div>
      </div>
      <div data-stack-shade className="pointer-events-none absolute inset-0 z-[5] bg-forest-deep opacity-0" />
    </section>
  );
}

function IntroCard() {
  const o = approach.opening;
  return (
    <section className="relative z-[2] bg-linen" data-header-theme="light">
      <div className="wrap section-pad grid12 gap-y-10">
        <p className="d4 col-span-12 max-w-[24ch] lg:col-span-5" data-reveal="lines">
          {o.paragraphs[0]}
        </p>
        <p className="d4 col-span-12 lg:col-span-6 lg:col-start-7" data-scrub-text="">
          {o.paragraphs[1]}
        </p>
      </div>
    </section>
  );
}

function Begin() {
  const b = approach.begin;
  return (
    <section className="relative overflow-hidden bg-linen" data-header-theme="light" aria-labelledby="begin-title">
      <div className="wrap section-pad grid12 items-center gap-y-14" data-parallax-trigger="">
        <div className="col-span-12 lg:col-span-6">
          <h2 id="begin-title" className="d2" data-reveal="lines">
            {b.headline}
          </h2>
          <div className="body-copy mt-10" data-reveal="stagger">
            {b.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-12" data-reveal="fade">
            <PrimaryCTA />
          </div>
        </div>
        <div className="col-span-8 col-start-3 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9" data-parallax="1.4">
          <ImageFrame crop="diningNook.book" ratio="4 / 5" sizes="(min-width:1024px) 30vw, 60vw" reveal="mask-up" parallax={0.4} />
        </div>
      </div>
    </section>
  );
}
