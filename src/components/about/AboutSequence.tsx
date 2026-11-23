import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { scrollToTarget } from '@/app/lenis';
import { getAboutImage } from './aboutImages';

interface SlideData {
  id: string;
  num: string;
  line1: string;
  line2: string;
  supporting: string;
}

const SLIDES: SlideData[] = [
  {
    id: '05-wine-bar',
    num: '01 / 04',
    line1: 'Design that',
    line2: 'listens',
    supporting:
      'We begin with the life already happening in your home—the morning routines, the people around your table, the quiet you look forward to.',
  },
  {
    id: 'B2',
    num: '02 / 04',
    line1: 'Bathrooms',
    line2: 'that restore',
    supporting:
      'We look at what deserves to stay and where a change would make a meaningful difference.',
  },
  {
    id: '06-second-kitchen',
    num: '03 / 04',
    line1: 'Kitchens made',
    line2: 'for mornings',
    supporting:
      'Eddie brings a maker’s attention to those possibilities, connecting the character of a space with the practical decisions required to create it.',
  },
  {
    id: 'E3',
    num: '04 / 04',
    line1: 'Additions',
    line2: 'that belong',
    supporting:
      'Proportion, materials, cabinetry and construction belong in the same conversation.',
  },
];

/**
 * Scene 4 — Corner-Card Image Sequence.
 * One wrapper of height 400svh containing ONE sticky inner panel (100svh, overflow-hidden).
 * Four full-bleed image layers stacked inside, cycling via a reliable active-index ScrollTrigger.
 * Corner card at bottom-right displaying counter, title, one supporting line, and a '+' button.
 */
export function AboutSequence() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerImgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const plusRef = useRef<SVGSVGElement>(null);
  const titleMaskRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const isTransitioningRef = useRef(false);

  const currentSlide = SLIDES[activeIndex] ?? SLIDES[0];

  // Core transition function between slides
  const transitionTo = useCallback((nextIdx: number) => {
    if (nextIdx === activeIndexRef.current) return;
    const prevIdx = activeIndexRef.current;
    const isForward = nextIdx > prevIdx;
    activeIndexRef.current = nextIdx;
    setActiveIndex(nextIdx);

    const layers = layersRef.current;
    const innerImgs = innerImgsRef.current;
    const incomingLayer = layers[nextIdx];
    const incomingImg = innerImgs[nextIdx];
    const progressFill = progressFillRef.current;
    const plus = plusRef.current;
    const titleMask = titleMaskRef.current;

    if (!incomingLayer) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Set z-index stacking: incoming on top, previous directly below
    layers.forEach((layer, idx) => {
      if (!layer) return;
      if (idx === nextIdx) {
        layer.style.zIndex = '10';
      } else if (idx === prevIdx) {
        layer.style.zIndex = '5';
      } else {
        layer.style.zIndex = '1';
        // Non-active layers clipped out
        gsap.set(layer, {
          clipPath: isMobile ? 'inset(100% 0 0 0)' : 'inset(0 0 0 100%)',
        });
      }
    });

    // Animate incoming wipe
    const startClip = isMobile
      ? isForward
        ? 'inset(100% 0 0 0)'
        : 'inset(0 0 100% 0)'
      : isForward
        ? 'inset(0 0 0 100%)'
        : 'inset(0 100% 0 0)';

    gsap.set(incomingLayer, { clipPath: startClip });
    if (incomingImg) {
      gsap.set(incomingImg, { scale: 1.12 });
    }

    isTransitioningRef.current = true;

    gsap.to(incomingLayer, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.0,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => {
        isTransitioningRef.current = false;
        // Keep active layer at z-index 2 and hide others underneath
        layers.forEach((layer, idx) => {
          if (!layer) return;
          if (idx !== nextIdx) {
            gsap.set(layer, {
              clipPath: isMobile ? 'inset(100% 0 0 0)' : 'inset(0 0 0 100%)',
              zIndex: '1',
            });
          } else {
            layer.style.zIndex = '2';
          }
        });
      },
    });

    if (incomingImg) {
      gsap.to(incomingImg, {
        scale: 1.0,
        duration: 1.0,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    }

    // Animate Card Elements
    if (progressFill) {
      gsap.to(progressFill, {
        scaleX: (nextIdx + 1) / SLIDES.length,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }

    if (plus) {
      gsap.to(plus, {
        rotate: nextIdx * 45,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }

    if (titleMask) {
      gsap.fromTo(
        titleMask,
        { opacity: 0, y: isForward ? 8 : -8 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }
      );
    }
  }, []);

  // Set up ScrollTrigger on wrapper
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || isReduced()) return;

    // Reset initial layer states: Layer 0 visible, Layers 1-3 clipped
    const isMobile = window.innerWidth < 768;
    layersRef.current.forEach((layer, idx) => {
      if (!layer) return;
      gsap.set(layer, {
        clipPath: idx === 0 ? 'inset(0% 0% 0% 0%)' : isMobile ? 'inset(100% 0 0 0)' : 'inset(0 0 0 100%)',
        zIndex: idx === 0 ? 2 : 1,
      });
    });

    if (progressFillRef.current) {
      gsap.set(progressFillRef.current, { scaleX: 1 / SLIDES.length, transformOrigin: '0% 50%' });
    }

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const raw = Math.floor(self.progress * 4);
        const nextIdx = Math.max(0, Math.min(3, raw));
        if (nextIdx !== activeIndexRef.current) {
          transitionTo(nextIdx);
        }
      },
    });

    stRef.current = st;

    // 3s failsafe ensures slide 1 is visible
    const timer = window.setTimeout(() => {
      if (layersRef.current[0]) {
        gsap.set(layersRef.current[0], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 2 });
      }
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      st.kill();
      stRef.current = null;
    };
  }, [transitionTo]);

  // Click & keyboard advance
  const handleAdvance = () => {
    const st = stRef.current;
    const nextIdx = (activeIndex + 1) % SLIDES.length;
    if (st) {
      const targetProgress = (nextIdx + 0.12) / SLIDES.length;
      const targetY = st.start + (st.end - st.start) * targetProgress;
      scrollToTarget(targetY);
    } else {
      transitionTo(nextIdx);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleAdvance();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const st = stRef.current;
      const prevIdx = (activeIndex - 1 + SLIDES.length) % SLIDES.length;
      if (st) {
        const targetProgress = (prevIdx + 0.12) / SLIDES.length;
        const targetY = st.start + (st.end - st.start) * targetProgress;
        scrollToTarget(targetY);
      } else {
        transitionTo(prevIdx);
      }
    }
  };

  const activeEntry = getAboutImage(currentSlide.id);

  return (
    <div
      id="about-sequence"
      ref={wrapperRef}
      tabIndex={0}
      role="region"
      aria-label="Design that listens - architectural projects sequence"
      onKeyDown={handleKeyDown}
      className="about-sequence-wrapper relative w-full h-[400svh] outline-none"
      style={{ zIndex: 5 }}
    >
      {/* Sticky 100svh inner stage */}
      <div
        ref={stageRef}
        className="about-sequence-stage sticky top-0 h-[100svh] w-full overflow-hidden bg-forest-deep"
      >
        {/* Four full-bleed preloaded image layers */}
        {SLIDES.map((slide, idx) => {
          const entry = getAboutImage(slide.id);

          return (
            <div
              key={slide.id}
              ref={(el) => {
                layersRef.current[idx] = el;
              }}
              data-slide-index={idx}
              data-active-slide={idx === activeIndex}
              className="about-seq-layer will-change-[clip-path]"
            >
              <img
                ref={(el) => {
                  innerImgsRef.current[idx] = el;
                }}
                src={entry.src}
                alt={entry.alt}
                data-image-id={entry.id}
                loading="eager"
                decoding="sync"
                style={{
                  objectFit: 'cover',
                  objectPosition: entry.objectPosition ?? '50% 50%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                className="block h-full w-full will-change-transform"
              />
            </div>
          );
        })}

        {/* Caption bottom-left on scrim (never overlapping the card) */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute bottom-6 left-6 z-20 sm:bottom-8 sm:left-8 lg:bottom-10 lg:left-12"
        >
          <div className="about-caption-chip">
            {activeEntry.label}
          </div>
        </div>

        {/* Forest corner card at bottom-right */}
        <aside
          aria-label="Project detail card"
          className="pointer-events-auto absolute bottom-0 right-0 z-30 flex w-full flex-col justify-between border-t border-linen/10 bg-forest/95 p-6 text-linen shadow-2xl backdrop-blur-md sm:bottom-8 sm:right-8 sm:w-[380px] sm:rounded-[2px] sm:border sm:border-linen/15 sm:p-7 xl:bottom-10 xl:right-10 xl:w-[400px] xl:p-8"
        >
          {/* Top row: counter button and '+' rotate button */}
          <div className="flex items-center justify-between border-b border-linen/15 pb-4">
            <button
              type="button"
              onClick={handleAdvance}
              aria-label={`Current slide ${currentSlide.num}. Click to advance.`}
              className="font-sans text-xs uppercase tracking-[0.2em] text-taupe transition-colors hover:text-linen"
            >
              {currentSlide.num}
            </button>

            <button
              type="button"
              onClick={handleAdvance}
              aria-label="Advance to next slide"
              className="flex h-8 w-8 items-center justify-center rounded-full text-taupe transition-colors hover:bg-linen/10 hover:text-linen"
            >
              <svg
                ref={plusRef}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                className="h-5 w-5 will-change-transform"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          {/* Title and supporting sentence */}
          <div ref={titleMaskRef} className="my-5 space-y-3">
            <h3
              className="font-serif font-normal leading-[1.08] tracking-[-0.02em] text-linen"
              style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2.25rem)' }}
            >
              <span className="block">{currentSlide.line1}</span>
              <span className="block">{currentSlide.line2}</span>
            </h3>

            <p className="font-sans text-xs leading-relaxed text-linen/80 sm:text-[13px]">
              {currentSlide.supporting}
            </p>
          </div>

          {/* Progress bar */}
          <div className="relative h-[2px] w-full overflow-hidden bg-linen/20">
            <div
              ref={progressFillRef}
              className="h-full w-full origin-left bg-taupe will-change-transform"
              style={{ transform: 'scaleX(0.25)' }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
