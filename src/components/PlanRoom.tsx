import { useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { drawLines, lineReveal } from '@/motion/primitives';
import { useFullMotion } from '@/motion/hooks/useMedia';
import { home } from '@/content/copy';
import type { CropKey } from '@/data/images';
import { DraftingLines, PLAN_VIEWBOX, planRooms } from './DraftingLines';
import { ImageFrame } from './ImageFrame';
import { MaterialPanel } from './MaterialPanel';
import { flipToFull } from './flipToFull';

type RoomId = (typeof planRooms)[number]['id'];
const roomCrop: Partial<Record<RoomId, CropKey>> = {
  kitchens: 'kitchenWide.island',
  'whole-home': 'wineBar.full',
};
// Destination opening frame for shared-element continuity
const destCrop: Partial<Record<RoomId, CropKey>> = {
  kitchens: 'kitchenHero.full',
  'whole-home': 'wineBar.full',
};
const destColor: Record<RoomId, string> = {
  kitchens: '#2D372C',
  bathrooms: '#E9DDCD',
  'whole-home': '#2D372C',
  'additions-custom-homes': '#F4EFE6',
};

export function RoomFill({ id, sizes = '30vw' }: { id: RoomId; sizes?: string }): ReactNode {
  if (id === 'kitchens' || id === 'whole-home') return <ImageFrame crop={roomCrop[id]!} fill sizes={sizes} />;
  if (id === 'bathrooms')
    return (
      <MaterialPanel variant="stone" className="absolute inset-0">
        <div className="caustic" />
        <div className="caustic b" />
      </MaterialPanel>
    );
  return (
    <MaterialPanel variant="plaster" className="absolute inset-0">
      <DraftingLines drawing="addition-section" className="room-drawing absolute inset-[10%] h-[80%] w-[80%] text-taupe-deep" />
    </MaterialPanel>
  );
}

const doorAt = (r: (typeof planRooms)[number]) =>
  `${(((r.door.x - r.x) / r.w) * 100).toFixed(1)}% ${(((r.door.y - r.y) / r.h) * 100).toFixed(1)}%`;

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** "The Plan Room" — services as a floor plan (Home). Desktop: tilted + pinned. Mobile: room cards. */
export function PlanRoom() {
  const full = useFullMotion();
  return full ? <PlanRoomPinned /> : <PlanRoomCards />;
}

function PlanRoomPinned() {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const services = home.change.services;

  useGSAP(
    () => {
      const root = ref.current!;
      const stage = root.querySelector<HTMLElement>('.plan-stage')!;
      const cam = root.querySelector<HTMLElement>('.plan-cam')!;
      const tilt = root.querySelector<HTMLElement>('.plan-tilt')!;
      const rooms = gsap.utils.toArray<HTMLElement>('.plan-room', root);
      const blocks = gsap.utils.toArray<HTMLElement>('.svc-block', root);
      const counter = root.querySelector<HTMLElement>('.svc-counter')!;
      const svg = root.querySelector('svg[data-drawing="plan"]');
      const newWing = root.querySelector('.room-drawing');

      lineReveal(root.querySelector<HTMLElement>('.plan-title'));
      drawLines(svg, { scroll: true, duration: 1.6, stagger: 0.03, start: 'top 75%' });
      gsap.from(root.querySelectorAll('.dl-text'), { opacity: 0, duration: 1, scrollTrigger: { trigger: svg, start: 'top 60%', once: true } });

      rooms.forEach((r) => gsap.set(r, { clipPath: `circle(0% at ${r.dataset.door})` }));
      gsap.set(blocks, { autoAlpha: 0 });
      blocks.forEach((b) => gsap.set(b.querySelectorAll('.svc-rise'), { yPercent: 110 }));
      const newWingDraw = drawLines(newWing, { paused: true, duration: 1.2 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            const i = Math.min(3, Math.floor(self.progress * 4.3));
            counter.textContent = `0${i + 1} / 04`;
          },
        },
      });

      planRooms.forEach((room, i) => {
        const at = i;
        const cx = (room.x + room.w / 2) / PLAN_VIEWBOX.w;
        const cy = (room.y + room.h / 2) / PLAN_VIEWBOX.h;
        tl.to(rooms[i], { clipPath: `circle(150% at ${rooms[i].dataset.door})`, duration: 0.6, ease: 'meres.inOut' }, at)
          .to(
            cam,
            {
              scale: 1 + 0.03 * (i + 1),
              xPercent: (0.5 - cx) * 12,
              yPercent: (0.5 - cy) * 10,
              duration: 0.8,
              ease: 'meres.inOut',
            },
            at,
          )
          .to(tilt, { rotateX: 38 - 9 * (i + 1), rotateZ: -8 + 1.6 * (i + 1), duration: 0.8, ease: 'meres.inOut' }, at);
        if (i > 0) {
          tl.to(blocks[i - 1], { autoAlpha: 0, y: -24, duration: 0.25 }, at);
        }
        tl.set(blocks[i], { autoAlpha: 1, y: 0 }, at + 0.15).to(
          blocks[i].querySelectorAll('.svc-rise'),
          { yPercent: 0, duration: 0.5, stagger: 0.08, ease: 'meres.out' },
          at + 0.15,
        );
        if (i === 3 && newWingDraw) tl.add(newWingDraw.paused(false), at + 0.3);
      });
      tl.to({}, { duration: 0.5 });

      // Hover lift
      rooms.forEach((r) => {
        const enter = () => gsap.to(r, { z: 20, boxShadow: '0 30px 40px -24px rgba(30,31,27,0.55)', duration: 0.45, ease: 'meres.soft' });
        const leave = () => gsap.to(r, { z: 0, boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.45, ease: 'meres.soft' });
        r.addEventListener('pointerenter', enter);
        r.addEventListener('pointerleave', leave);
      });
    },
    { scope: ref },
  );

  const go = (e: React.MouseEvent, id: RoomId) => {
    e.preventDefault();
    const crop = destCrop[id];
    flipToFull(e.currentTarget, { crop, color: destColor[id] }, () => navigate(`/services#${id}`));
  };

  return (
    <section ref={ref} className="plan-room-section relative bg-linen" data-header-theme="light" aria-labelledby="plan-title">
      <div className="plan-stage relative flex h-[100svh] items-center overflow-hidden">
        <div className="wrap grid12 w-full items-center">
          <div className="col-span-7 col-start-1 [perspective:1600px]">
            <div className="plan-cam relative mx-auto w-full max-w-[min(50vw,calc(62svh*1000/700))]" style={{ transformStyle: 'preserve-3d' }}>
              <div
                className="plan-tilt relative w-full text-taupe"
                style={{
                  aspectRatio: `${PLAN_VIEWBOX.w} / ${PLAN_VIEWBOX.h}`,
                  transform: 'perspective(1600px) rotateX(38deg) rotateZ(-8deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <DraftingLines drawing="plan" className="absolute inset-0 h-full w-full" />
                {planRooms.map((r, i) => (
                  <a
                    key={r.id}
                    href={`/services#${r.id}`}
                    onClick={(e) => go(e, r.id)}
                    className="plan-room group absolute block overflow-hidden"
                    data-door={doorAt(r)}
                    data-cursor="view"
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                      left: pct(r.x + 3, PLAN_VIEWBOX.w),
                      top: pct(r.y + 3, PLAN_VIEWBOX.h),
                      width: pct(r.w - 6, PLAN_VIEWBOX.w),
                      height: pct(r.h - 6, PLAN_VIEWBOX.h),
                    }}
                  >
                    <RoomFill id={r.id} />
                    <span className="absolute right-3 top-3 z-[4] text-[12px] font-medium uppercase tracking-[0.16em] text-linen [text-shadow:0_1px_8px_rgba(30,31,27,0.6)]">
                      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                        {r.label}
                      </span>
                    </span>
                    <span className="sr-only">{services[i].link}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-4 col-start-9 flex flex-col gap-8">
            <h2 id="plan-title" className="plan-title d3" data-reveal="manual">
              {home.change.headline}
            </h2>
            <p className="svc-counter eyebrow tabular-nums" aria-hidden="true">
              01 / 04
            </p>
            <div className="relative min-h-[22rem]">
              {services.map((s) => (
                <div key={s.id} className="svc-block absolute inset-x-0 top-0">
                  <h3 className="d3 overflow-hidden pb-1">
                    <span className="svc-rise block">{s.title}</span>
                  </h3>
                  <div className="mt-5 overflow-hidden">
                    <p className="svc-rise body-copy">{s.body}</p>
                  </div>
                  <div className="mt-4 overflow-hidden">
                    <Link to={`/services#${s.id}`} className="svc-rise link-draw is-underlined">
                      {s.link}
                      <Arrow />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const Arrow = () => (
  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d="M0 5h16M12 1l4 4-4 4" />
  </svg>
);

/** Corner ticks for a drafted border. */
export const DraftedCorners = ({ className = 'text-taupe' }: { className?: string }) => (
  <span className={`pointer-events-none absolute inset-0 z-[4] ${className}`} aria-hidden="true">
    <span className="absolute -left-2 -top-2 h-4 w-4 border-l border-t border-current" />
    <span className="absolute -right-2 -top-2 h-4 w-4 border-r border-t border-current" />
    <span className="absolute -bottom-2 -left-2 h-4 w-4 border-b border-l border-current" />
    <span className="absolute -bottom-2 -right-2 h-4 w-4 border-b border-r border-current" />
  </span>
);

/** Mobile / reduced-motion: four stacked room cards that fill as they enter view. */
function PlanRoomCards() {
  const ref = useRef<HTMLElement>(null);
  const services = home.change.services;
  useGSAP(
    () => {
      lineReveal(ref.current!.querySelector<HTMLElement>('.plan-title'));
      if (isReduced()) return;
      gsap.utils.toArray<HTMLElement>('.room-card-fill', ref.current).forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: `circle(0% at ${el.dataset.door})` },
          {
            clipPath: `circle(150% at ${el.dataset.door})`,
            duration: 1.3,
            ease: 'meres.inOut',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          },
        );
      });
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="section-pad relative bg-linen" data-header-theme="light" aria-labelledby="plan-title-m">
      <div className="wrap">
        <h2 id="plan-title-m" className="plan-title d2 max-w-[14ch]" data-reveal="manual">
          {home.change.headline}
        </h2>
        <ul className="mt-14 grid gap-16 md:grid-cols-2 md:gap-x-10">
          {services.map((s, i) => {
            const r = planRooms[i];
            return (
              <li key={s.id} className="flex flex-col gap-5">
                <div className="relative aspect-[4/3] border border-taupe/60">
                  <DraftedCorners />
                  <div className="room-card-fill absolute inset-0 overflow-hidden" data-door={doorAt(r)}>
                    <RoomFill id={r.id} sizes="(min-width:768px) 50vw, 100vw" />
                  </div>
                  <span className="eyebrow absolute -top-7 left-0">{`0${i + 1} — ${r.label}`}</span>
                </div>
                <h3 className="d4">{s.title}</h3>
                <p className="body-copy">{s.body}</p>
                <Link to={`/services#${s.id}`} className="link-draw is-underlined self-start">
                  {s.link}
                  <Arrow />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Compact, non-pinned index for the top of Services: four room tiles linking to their anchors. */
export function PlanRoomIndex() {
  const ref = useRef<HTMLUListElement>(null);
  useGSAP(
    () => {
      if (isReduced()) return;
      gsap.utils.toArray<HTMLElement>('.room-card-fill', ref.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: `circle(0% at ${el.dataset.door})` },
          {
            clipPath: `circle(150% at ${el.dataset.door})`,
            duration: 1.3,
            delay: i * 0.12,
            ease: 'meres.inOut',
            scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
          },
        );
      });
    },
    { scope: ref },
  );
  return (
    <ul ref={ref} className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4" aria-label="Services">
      {home.change.services.map((s, i) => {
        const r = planRooms[i];
        return (
          <li key={s.id}>
            <Link to={`/services#${s.id}`} className="group block" data-cursor="view">
              <div className="relative aspect-[4/5] border border-taupe/60 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-1.5">
                <DraftedCorners />
                <div className="room-card-fill absolute inset-0 overflow-hidden" data-door={doorAt(r)}>
                  <RoomFill id={r.id} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" />
                </div>
              </div>
              <span className="eyebrow mt-4 block">{`0${i + 1}`}</span>
              <span className="link-draw mt-1 text-[1.25rem]">{s.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
