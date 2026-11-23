import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { SPACES_IN_FOCUS_EYEBROW } from '@/config';
import { ImageCaption } from './ImageCaption';

export interface FocusSlide {
  id: string;
  title: string;
  subtitle: string;
  caption: string;
  image: string;
  thumb: string;
  objectPosition?: string;
}

const base = import.meta.env.BASE_URL;

export const FOCUS_SLIDES: FocusSlide[] = [
  {
    id: '04-kitchen-detail',
    title: 'Kitchen Millwork',
    subtitle: 'Honed stone and custom fluted oak cabinetry.',
    caption: 'Concept visualization',
    image: `${base}images/04-meres-kitchen-detail-1672.jpg`,
    thumb: `${base}images/04-meres-kitchen-detail-960.webp`,
    objectPosition: '60% 50%',
  },
  {
    id: 'W1',
    title: 'Craft Workshop',
    subtitle: 'Fine timber shavings and precision joinery.',
    caption: 'Illustrative image',
    image: `${base}images/stock/W1.jpg`,
    thumb: `${base}images/stock/W1.jpg`,
    objectPosition: '50% 50%',
  },
  {
    id: 'W2',
    title: 'Hand Joinery',
    subtitle: 'Bespoke dovetails and Japanese hand tools.',
    caption: 'Illustrative image',
    image: `${base}images/stock/W2.jpg`,
    thumb: `${base}images/stock/W2.jpg`,
    objectPosition: '50% 50%',
  },
  {
    id: 'P2',
    title: 'Material Samples',
    subtitle: 'Curated wood veneer decks and stone samples.',
    caption: 'Illustrative image',
    image: `${base}images/stock/P2.jpg`,
    thumb: `${base}images/stock/P2.jpg`,
    objectPosition: '50% 50%',
  },
];

const STATIC_PARAGRAPH =
  'Every room begins with how your days unfold. We align architectural drawings, structural craftsmanship, and bespoke millwork so the result feels unified and effortless.';

/**
 * Spaces In Focus / How It's Made: 4-slide showcase.
 * Slide 1: Kitchen Millwork (client concept visualization 04-kitchen-detail)
 * Slides 2-4: Workshop and materiality slides (illustrative override)
 * Desktop: 100svh panel, left 60% full-height photo with vertical thumbnail strip,
 * right 40% linen story panel.
 * Auto-advances every 4s (paused on hover, disabled for reduced motion).
 */
export function SpacesInFocus() {
  const panelRef = useRef<HTMLElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isHovered = useRef(false);

  // Visibility tracking for auto-advance
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-advance every 4s on desktop when visible
  useEffect(() => {
    if (!isVisible || isReduced()) return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;

    const line = progressLineRef.current;
    let tween: gsap.core.Tween | null = null;
    if (line) {
      tween = gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 4.0, ease: 'none' });
    }

    const interval = setInterval(() => {
      if (!isHovered.current) {
        setActiveIndex((prev) => (prev + 1) % FOCUS_SLIDES.length);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      tween?.kill();
    };
  }, [isVisible, activeIndex]);

  // Masked swap (0.5s) on activeIndex change for title and subtitle only
  useEffect(() => {
    const block = textBlockRef.current;
    if (!block || isReduced()) return;
    gsap.fromTo(
      block,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'meres.out' },
    );
  }, [activeIndex]);

  const active = FOCUS_SLIDES[activeIndex];

  return (
    <section
      ref={panelRef}
      className="relative z-[2] min-h-[100svh] overflow-hidden bg-linen lg:h-[100svh]"
      data-header-theme="light"
      aria-label="Spaces in focus"
      onPointerEnter={() => {
        isHovered.current = true;
      }}
      onPointerLeave={() => {
        isHovered.current = false;
      }}
    >
      <div className="flex h-full min-h-[100svh] w-full flex-col lg:flex-row">
        {/* Left 60%: Full-height photo with vertical thumbnail strip */}
        <div className="relative h-[56svh] w-full overflow-hidden bg-forest-deep lg:h-full lg:w-[60%]">
          {FOCUS_SLIDES.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out ${
                  isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  data-image-id={slide.id}
                  className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                    isActive ? 'scale-100' : 'scale-105'
                  }`}
                  style={{ objectPosition: slide.objectPosition ?? '50% 50%' }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                <ImageCaption label={slide.caption} />
              </div>
            );
          })}

          {/* Vertical thumbnail strip on desktop / horizontal bar on mobile */}
          <div className="absolute bottom-0 right-0 top-auto z-20 flex w-full flex-row items-center justify-center gap-3 border-t border-linen/10 bg-forest-deep/80 p-2 backdrop-blur-md lg:bottom-0 lg:top-0 lg:w-24 lg:flex-col lg:border-l lg:border-t-0">
            {FOCUS_SLIDES.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`View ${slide.title}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative aspect-square w-12 overflow-hidden rounded-[2px] transition-all duration-300 lg:w-16 ${
                    isActive
                      ? 'scale-105 opacity-100 ring-1 ring-linen'
                      : 'opacity-40 hover:opacity-85'
                  }`}
                >
                  <img
                    src={slide.thumb}
                    alt=""
                    data-image-id={`${slide.id}-thumb`}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: slide.objectPosition ?? '50% 50%' }}
                    loading="lazy"
                  />
                </button>
              );
            })}

            {/* Hairline progress rule under strip on desktop */}
            <div className="hidden h-[2px] w-14 overflow-hidden bg-linen/20 lg:mt-2 lg:block lg:w-16">
              <div ref={progressLineRef} className="h-full w-full origin-left bg-linen" />
            </div>
          </div>
        </div>

        {/* Right 40%: Linen story panel */}
        <div className="relative flex flex-1 flex-col justify-end bg-linen p-6 lg:w-[40%] lg:p-14 xl:p-20">
          <div className="max-w-md pb-2 lg:pb-6">
            <span className="eyebrow mb-3 block text-taupe-deep">{SPACES_IN_FOCUS_EYEBROW}</span>

            {/* Active narrative with masked swap: only title and 1-line subtitle swap */}
            <div ref={textBlockRef}>
              <h2 className="d3 font-serif font-normal text-ink">{active.title}</h2>
              <p className="body-copy mt-2 text-sm italic text-taupe-deep">{active.subtitle}</p>
            </div>

            {/* Static paragraph stays static outside textBlockRef */}
            <p className="body-copy mt-5 text-[1.0625rem] leading-relaxed text-ink/80">
              {STATIC_PARAGRAPH}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
