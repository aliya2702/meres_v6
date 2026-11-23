import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from '@/motion/gsap';
import { dur, isReduced } from '@/motion/tokens';
import { useAppState } from '@/app/store';
import { programmaticUntil } from '@/app/lenis';
import { Logo } from './Logo';
import { PrimaryCTA } from './PrimaryCTA';
import { Magnetic } from './MagneticButton';

const inline = [
  { label: 'Services', to: '/services' },
  { label: 'Our approach', to: '/approach' },
  { label: 'About', to: '/about' },
];

export function Header() {
  const { menuOpen, setMenuOpen } = useAppState();
  const location = useLocation();
  const ref = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const [tone, setTone] = useState<'dark' | 'light'>('dark');
  const state = useRef({ lastY: 0, hidden: false, collapsed: false });

  useEffect(() => {
    const header = ref.current;
    const lockup = logoRef.current;
    if (!header || !lockup) return;
    const letters = lockup.querySelectorAll('.logo-letter');
    const word = lockup.querySelector<HTMLElement>('.logo-word');
    const reduced = isReduced();

    const sample = () => {
      const y = header.offsetHeight / 2;
      const stack = document.elementsFromPoint(window.innerWidth / 2, y);
      for (const el of stack) {
        if (header.contains(el)) continue;
        const host = (el as HTMLElement).closest<HTMLElement>('[data-header-theme]');
        if (host) {
          const t = host.dataset.headerTheme === 'light' ? 'light' : 'dark';
          setTone(t);
          // Film grain: multiply on linen, screen on forest.
          document.documentElement.dataset.grain = t === 'dark' ? 'screen' : 'multiply';
          return;
        }
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const s = state.current;
      // collapse MERES letters to the mark after 80px
      const collapse = y > 80;
      if (collapse !== s.collapsed) {
        s.collapsed = collapse;
        const shift = word ? (word.offsetWidth + 12) / 2 : 0;
        gsap.to(letters, {
          yPercent: collapse ? -110 : 0,
          stagger: collapse ? 0.04 : -0.04,
          duration: reduced ? 0 : dur.ui,
          ease: 'meres.soft',
        });
        gsap.to(lockup, { x: collapse ? shift : 0, duration: reduced ? 0 : 0.6, ease: 'meres.inOut' });
      }
      // hide on scroll down, return on scroll up
      const delta = y - s.lastY;
      if (!document.documentElement.classList.contains('menu-open') && performance.now() > programmaticUntil) {
        if (y > 160 && delta > 4 && !s.hidden) {
          s.hidden = true;
          gsap.to(header, { yPercent: -100, duration: reduced ? 0 : dur.ui, ease: 'meres.soft' });
        } else if ((delta < -4 || y < 160) && s.hidden) {
          s.hidden = false;
          gsap.to(header, { yPercent: 0, duration: reduced ? 0 : dur.ui, ease: 'meres.soft' });
        }
      }
      s.lastY = y;
      sample();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const raf = requestAnimationFrame(onScroll);
    const t = window.setTimeout(sample, 900);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  // Re-sample theme after each route swap; reveal header.
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
      state.current.hidden = false;
      if (ref.current) gsap.to(ref.current, { yPercent: 0, duration: 0.3 });
    }, 520);
    return () => clearTimeout(id);
  }, [location.pathname]);

  const effectiveTone = menuOpen ? 'dark' : tone;

  return (
    <header
      ref={ref}
      className={`site-header fixed inset-x-0 top-0 z-[120] max-md:bg-forest max-md:text-linen max-md:shadow-[0_2px_12px_rgba(0,0,0,0.18)] ${menuOpen ? 'menu-open' : ''}`}
      data-tone={effectiveTone}
    >
      {/* Soft top scrim on desktop so logo and nav remain readable over lights */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[120px] bg-gradient-to-b from-forest-deep/80 via-forest-deep/35 to-transparent md:block"
        aria-hidden="true"
      />
      <div className="wrap relative flex h-[64px] items-center justify-between gap-6 md:h-[84px]">
        <div className="flex items-center gap-8">
          <Magnetic>
            <button
              type="button"
              className="menu-toggle -ml-2 flex min-h-[44px] min-w-[44px] items-center gap-3 px-2 font-medium text-[1.1875rem]"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              data-cursor="cta"
            >
              <span className="menu-burger" aria-hidden="true">
                <span />
                <span />
              </span>
              <span>{menuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </Magnetic>
          <nav aria-label="Primary" className={`hidden lg:block transition-opacity duration-500 ${menuOpen ? 'pointer-events-none opacity-0' : ''}`}>
            <ul className="flex items-center gap-2 text-[1.1875rem]">
              {inline.map((l, i) => (
                <li key={l.to} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true" className="opacity-50">·</span>}
                  <Link to={l.to} className="link-draw" aria-current={location.pathname === l.to ? 'page' : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Link to="/" className="header-logo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex min-h-[44px] items-center" aria-label="MERES — home">
          <Logo ref={logoRef} />
        </Link>

        <div className={`hidden md:block transition-opacity duration-500 ${menuOpen ? 'pointer-events-none opacity-0' : ''}`}>
          <PrimaryCTA tone="inherit" size="md" microcopy="sr" />
        </div>
      </div>
    </header>
  );
}
