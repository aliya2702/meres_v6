import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { useAppState } from '@/app/store';
import { getLenis } from '@/app/lenis';
import { nav, serviceAnchors, philosophy } from '@/content/copy';
import { trust } from '@/data/trust';
import type { CropKey } from '@/data/images';
import { ImageFrame } from './ImageFrame';
import { PrimaryCTA } from './PrimaryCTA';

const menuImages: CropKey[] = [
  'kitchenHero.full',
  'kitchenWide.island',
  'diningNook.book',
  'kitchenDetail.faucet',
  'diningNook.garden',
];

const ARCH_CLOSED = 'inset(100% 9% 0% 9% round 9999px 9999px 0px 0px)';
const ARCH_OPEN = 'inset(5% 9% 0% 9% round 9999px 9999px 0px 0px)';

/** Full-screen menu: "Through the Doorway". */
export function Menu() {
  const { menuOpen, setMenuOpen } = useAppState();
  const location = useLocation();
  const root = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const current = useRef<number>(-1);
  const z = useRef(10);
  const openTl = useRef<gsap.core.Timeline | null>(null);

  const pageIndex = Math.max(
    0,
    nav.findIndex((n) => (n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to))),
  );

  const showImage = (i: number, instant = false) => {
    const stage = stageRef.current;
    if (!stage || i === current.current) return;
    const layers = stage.querySelectorAll<HTMLElement>('.menu-layer');
    const next = layers[i];
    const prev = current.current >= 0 ? layers[current.current] : null;
    current.current = i;
    z.current += 1;
    gsap.killTweensOf(next);
    gsap.set(next, { zIndex: z.current, visibility: 'visible' });
    const reduced = isReduced();
    if (instant || reduced) {
      gsap.set(next, { clipPath: ARCH_OPEN });
      gsap.set(next.querySelector('.img-scale-wrap'), { scale: 1 });
    } else {
      gsap.fromTo(next, { clipPath: ARCH_CLOSED }, { clipPath: ARCH_OPEN, duration: 0.95, ease: 'meres.inOut' });
      gsap.fromTo(next.querySelector('.img-scale-wrap'), { scale: 1.12 }, { scale: 1, duration: 1.3, ease: 'meres.out' });
    }
    if (prev) {
      gsap.to(prev.querySelector('.img-scale-wrap'), { scale: 1.06, duration: 1.2, ease: 'meres.out' });
      // Retire layers that are neither current nor the one directly behind it.
      layers.forEach((l) => {
        if (l !== next && l !== prev) gsap.set(l, { visibility: 'hidden', clipPath: ARCH_CLOSED });
      });
    }
  };

  // Open / close choreography
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reduced = isReduced();
      const html = document.documentElement;
      if (menuOpen) {
        html.classList.add('menu-open');
        getLenis()?.stop();
        current.current = -1;
        gsap.set(el, { visibility: 'visible' });
        showImage(pageIndex, true);
        const tl = gsap.timeline();
        if (reduced) {
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        } else {
          tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'meres.inOut' })
            .from(el.querySelectorAll('.menu-link-inner'), { yPercent: 110, duration: 1, stagger: 0.06, ease: 'meres.out' }, 0.38)
            .from(el.querySelectorAll('.menu-fade'), { opacity: 0, y: 16, duration: 0.8, stagger: 0.05, ease: 'meres.out' }, 0.6)
            .from(stageRef.current, { opacity: 0, duration: 0.8, ease: 'meres.soft' }, 0.3);
        }
        openTl.current = tl;
        const first = el.querySelector<HTMLElement>('.menu-link');
        window.setTimeout(() => first?.focus({ preventScroll: true }), reduced ? 50 : 420);
      } else if (el.style.visibility === 'visible') {
        openTl.current?.kill();
        html.classList.remove('menu-open');
        getLenis()?.start();
        gsap.to(el, {
          clipPath: reduced ? undefined : 'inset(0% 0% 100% 0%)',
          opacity: reduced ? 0 : 1,
          duration: reduced ? 0.2 : 0.6,
          ease: 'meres.inOut',
          onComplete: () => {
            gsap.set(el, { visibility: 'hidden', clipPath: 'inset(100% 0% 0% 0%)', opacity: 1 });
          },
        });
        document.querySelector<HTMLElement>('.menu-toggle')?.focus({ preventScroll: true });
      }
    },
    { dependencies: [menuOpen], scope: root },
  );

  // Esc + focus trap (dialog focusables + the header's Menu/Close toggle)
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !root.current) return;
      const toggle = document.querySelector<HTMLElement>('.menu-toggle');
      const items = [
        ...(toggle ? [toggle] : []),
        ...root.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!items.includes(document.activeElement as HTMLElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  const dim = (i: number) => (hover !== null && hover !== i ? 0.22 : 1);
  const activate = (i: number) => {
    setHover(i);
    showImage(i);
  };

  return (
    <div
      ref={root}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!menuOpen}
      className="on-dark fixed inset-0 z-[110] flex flex-col text-linen lg:flex-row overflow-hidden"
      style={{ visibility: 'hidden', clipPath: 'inset(100% 0% 0% 0%)' }}
      data-header-theme="dark"
    >
      {/* Image stage (right 55% on desktop; 40vh strip on mobile, above the links) */}
      <div
        ref={stageRef}
        className="relative order-1 h-[40svh] w-full shrink-0 overflow-hidden bg-forest-deep lg:order-2 lg:h-full lg:w-[55%]"
        aria-hidden="true"
      >
        {menuOpen &&
          menuImages.map((c) => (
            <div key={c} className="menu-layer absolute inset-0" style={{ visibility: 'hidden', clipPath: ARCH_CLOSED }}>
              <div className="img-scale-wrap absolute inset-0">
                <ImageFrame crop={c} fill sizes="(min-width:1024px) 55vw, 100vw" vignette />
              </div>
            </div>
          ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forest-deep/60 to-transparent" />
      </div>

      {/* Links (left 45%) */}
      <div
        className="relative order-2 flex flex-1 flex-col justify-between overflow-y-auto px-[var(--margin)] pb-10 pt-8 lg:order-1 lg:w-[45%] lg:pt-[120px]"
        style={{ background: 'linear-gradient(180deg, var(--forest-deep) 0%, var(--forest) 55%, var(--green) 140%)' }}
        onMouseLeave={() => setHover(null)}
      >
        <nav aria-label="Menu">
          <ul className="flex flex-col gap-1">
            {nav.map((n, i) => (
              <li key={n.to}>
                <span className="block overflow-hidden pb-1">
                  <Link
                    to={n.to}
                    className="menu-link d3 inline-block transition-opacity duration-500"
                    style={{ opacity: dim(i) }}
                    onMouseEnter={() => activate(i)}
                    onFocus={() => activate(i)}
                    onBlur={() => setHover(null)}
                    onClick={() => {
                      if (location.pathname === n.to) setMenuOpen(false);
                    }}
                    aria-current={i === pageIndex ? 'page' : undefined}
                  >
                    <span className="menu-link-inner inline-block">{n.label}</span>
                  </Link>
                </span>
                {n.to === '/services' && (
                  <ul className="menu-fade mb-3 mt-1 flex flex-wrap gap-x-5 gap-y-0 pl-1" style={{ opacity: dim(i) === 1 ? 1 : 0.4 }}>
                    {serviceAnchors.map((a) => (
                      <li key={a.to}>
                        <Link
                          to={a.to}
                          className="link-draw text-[1.1875rem] text-linen/80 hover:text-linen"
                          onMouseEnter={() => activate(1)}
                          onFocus={() => activate(1)}
                          onClick={() => {
                            if (location.pathname === '/services') setMenuOpen(false);
                          }}
                        >
                          {a.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-fade mt-10 flex flex-col gap-6">
          {trust.phone && (
            <a href={`tel:${trust.phone.replace(/[^0-9+]/g, '')}`} className="link-draw self-start text-[1.1875rem] text-linen/90 hover:text-linen">
              {trust.phone}
            </a>
          )}
          <p className="max-w-[30ch] italic text-linen/75">{philosophy}</p>
          <PrimaryCTA tone="dark" />
        </div>
      </div>
    </div>
  );
}
