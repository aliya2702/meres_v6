import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { stackSection } from '@/motion/primitives';
import { scrollToTarget } from '@/app/lenis';
import { footer } from '@/content/copy';
import { Mark } from './Mark';
import { PrimaryCTA } from './PrimaryCTA';

const links = [
  { label: 'Services', to: '/services' },
  { label: 'Our approach', to: '/approach' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/** Forest footer that slides over the last section, with a slowly brightening MERES. */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const word = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      let prev = el.previousElementSibling as HTMLElement | null;
      if (prev?.tagName === 'MAIN') prev = prev.lastElementChild as HTMLElement | null;
      if (prev && !prev.hasAttribute('data-no-stack')) {
        stackSection(prev, {
          inner: prev.querySelector<HTMLElement>('[data-stack-inner]') ?? undefined,
          shade: prev.querySelector<HTMLElement>('[data-stack-shade]') ?? undefined,
        });
      }
      if (isReduced()) return;
      gsap.fromTo(
        word.current,
        { opacity: 0.35, textShadow: '0 0 0px rgba(244,239,230,0)', yPercent: 18 },
        {
          opacity: 1,
          yPercent: 0,
          textShadow: '0 0 70px rgba(244,239,230,0.12)',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom bottom', scrub: true },
        },
      );
      gsap.from(el.querySelectorAll('.footer-fade'), {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.9,
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      });
    },
    { scope: ref },
  );

  return (
    <footer
      ref={ref}
      className="on-dark relative z-[5] overflow-hidden border-t border-linen/10 bg-forest-deep text-linen shadow-[0_-30px_60px_-30px_rgba(0,0,0,0.45)]"
      data-header-theme="dark"
    >
      <div className="wrap pb-10 pt-[clamp(80px,12vh,160px)]">
        <div className="grid12 gap-y-12">
          <div className="footer-fade col-span-12 flex flex-col gap-5 md:col-span-5">
            <Mark className="h-14 w-auto self-start text-linen" title="MERES" />
            <p className="eyebrow">{footer.location}</p>
            <p className="d4 max-w-[18ch]">{footer.philosophy}</p>
          </div>
          <nav aria-label="Footer" className="footer-fade col-span-12 md:col-span-3">
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="link-draw text-linen/90 hover:text-linen">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="footer-fade col-span-12 flex flex-col items-start gap-8 md:col-span-4">
            <PrimaryCTA tone="dark" />
          </div>
        </div>
      </div>

      <p
        ref={word}
        className="select-none text-center font-display leading-[0.8] tracking-[-0.02em] text-linen"
        style={{ fontSize: '18vw', marginBottom: '-0.12em' }}
      >
        {footer.wordmark}
      </p>

      <div className="wrap relative flex items-center justify-between gap-6 border-t border-linen/15 py-6">
        <Link to="/privacy" className="link-draw text-[1.1875rem] text-linen/80 hover:text-linen">
          Privacy notice
        </Link>
        <button
          type="button"
          onClick={() => scrollToTarget(0, { offset: 0 })}
          className="grid h-14 w-14 place-items-center rounded-full border border-linen/40 transition-colors duration-500 hover:border-linen hover:bg-linen hover:text-forest"
          aria-label="Back to top"
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <path d="M8 17V1M1 8l7-7 7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
