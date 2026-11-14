import { useRef } from 'react';
import { gsap, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal, focusPull, focusPullOnce } from '@/motion/primitives';
import { entrance } from '@/motion/entrance';
import { useFullMotion } from '@/motion/hooks/useMedia';
import { about } from '@/content/copy';
import { Page } from '@/components/Page';
import { ImageFrame } from '@/components/ImageFrame';
import { PrimaryCTA } from '@/components/PrimaryCTA';
import { LiquidStage } from '@/webgl/LiquidStage';

// The most restrained page: parallax speeds are halved and the only pin is the Focus Pull.
export default function About() {
  return (
    <Page>
      <Opening />
      <Founder />
      <Philosophy />
      <Remaining />
    </Page>
  );
}

function Opening() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const root = ref.current!;
      const anim = lineReveal(root.querySelector<HTMLElement>('h1'), { paused: true, auto: false, stagger: 0.12 });
      const eyebrow = root.querySelector('.eyebrow');
      const frame = root.querySelector('.about-portrait');
      if (!isReduced()) {
        gsap.set(eyebrow, { opacity: 0, y: 12 });
        gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' });
      }
      const off = entrance.on(
        contextSafe!(() => {
          anim?.play();
          if (isReduced()) return;
          gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: 'meres.out' });
          gsap.to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'meres.inOut', delay: 0.15 });
        }),
      );
      return () => off();
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative bg-linen pt-[calc(var(--header-h)+clamp(40px,8vh,100px))]" data-header-theme="light" aria-labelledby="about-title">
      <div className="wrap grid12 items-end gap-y-14 pb-[var(--section-pad)]">
        <div className="col-span-12 lg:col-span-6">
          <p className="eyebrow mb-6">{about.eyebrow}</p>
          <h1 id="about-title" className="d1 max-w-[9ch]" data-reveal="manual">
            {about.headline}
          </h1>
        </div>
        <div className="col-span-10 col-start-3 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
          <ImageFrame
            crop="kitchenDetail.full"
            objectPosition="72% 40%"
            ratio="3 / 4"
            className="about-portrait"
            sizes="(min-width:1024px) 40vw, 80vw"
            priority
            parallax={0.2}
          />
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="relative bg-linen" data-header-theme="light">
      <div className="wrap grid12 gap-y-10 pb-[var(--section-pad)]" data-parallax-trigger="">
        <div className="body-copy col-span-12 md:col-span-6 lg:col-span-4 lg:col-start-2" data-reveal="stagger">
          {about.founder.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="relative col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-7">
          <p className="d4" data-scrub-text="">
            {about.cabinet}
          </p>
          <p className="body-copy mt-8" data-reveal="fade">
            {about.purpose}
          </p>
          {/* Overlaps the column edge, Springs-portrait style */}
          <div className="mt-12 w-[62%] md:-ml-[22%] lg:-ml-[34%] lg:w-[min(56%,420px)]" data-parallax="0.8">
            <ImageFrame crop="kitchenHero.stools" ratio="4 / 5" sizes="(min-width:1024px) 26vw, 60vw" reveal="mask-up" parallax={0.2} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** 6.5 — the site's quietest and most important beat. */
function Philosophy() {
  const ref = useRef<HTMLElement>(null);
  const full = useFullMotion();
  useGSAP(
    () => {
      const root = ref.current!;
      const line = root.querySelector<HTMLElement>('.philo-line');
      const mask = root.querySelector<HTMLElement>('.philo-mask');
      if (full && line) {
        // Pins for 150vh: focus pull, then a full viewport of stillness.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.querySelector('.philo-stage'), start: 'top top', end: '+=150%', pin: true, scrub: 0.6 },
        });
        focusPull(tl, line, { at: 0, inDur: 0.34 });
        tl.to({}, { duration: 0.66 }); // ≈ one full viewport with nothing moving
      } else {
        focusPullOnce(line, 'top 70%');
      }
      lineReveal(root.querySelector<HTMLElement>('.philo-belief'));
      if (mask && !isReduced()) {
        gsap.fromTo(
          mask,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: mask, start: 'top 95%', end: 'top 25%', scrub: 0.8 } },
        );
      }
    },
    { scope: ref, dependencies: [full], revertOnUpdate: true },
  );
  return (
    <section ref={ref} className="relative bg-linen" data-header-theme="light" aria-label="Philosophy">
      <div className="philo-stage flex h-[100svh] items-center justify-center overflow-hidden">
        <h2 className="philo-line d2 wrap max-w-[16ch] text-center will-change-[filter]">{about.philosophy}</h2>
      </div>
      <div className="wrap pb-[var(--section-pad)] text-center">
        <p className="philo-belief d3" data-reveal="manual">
          {about.belief}
        </p>
        <div className="philo-mask mx-auto mt-[clamp(56px,10vh,120px)] max-w-[1200px]">
          <LiquidStage frames={['diningNook.full']} className="aspect-[1672/941] w-full" sizes="(min-width:1240px) 1200px, 100vw" />
        </div>
      </div>
    </section>
  );
}

function Remaining() {
  return (
    <section className="relative bg-linen" data-header-theme="light">
      <div className="wrap grid12 gap-y-12 pb-[var(--section-pad)]">
        <div className="body-copy col-span-12 lg:col-span-6 lg:col-start-4" data-reveal="stagger">
          {about.remaining.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-4">
          <p className="d4" data-reveal="lines">
            {about.serves}
          </p>
          <div className="mt-12" data-reveal="fade">
            <PrimaryCTA />
          </div>
        </div>
      </div>
    </section>
  );
}
