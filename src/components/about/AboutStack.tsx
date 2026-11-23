import { useEffect, useRef, type ReactNode, type CSSProperties, type Ref } from 'react';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';

export function AboutStack({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || isReduced()) return;

    const panels = Array.from(el.querySelectorAll<HTMLElement>('.panel'));
    if (!panels.length) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (pointer: fine)', () => {
      const cleanups: Array<() => void> = [];

      // Scale (1 -> 0.96) and dim previous panel as next rises over it
      panels.forEach((panel, i) => {
        if (i === 0) return;
        const prev = panels[i - 1];
        const prevContent = prev.querySelector<HTMLElement>('[data-panel-content]') || prev;
        const prevDim = prev.querySelector<HTMLElement>('[data-panel-dim]');

        const st = ScrollTrigger.create({
          trigger: panel,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(prevContent, { scale: 1 - p * 0.04 });
            if (prevDim) gsap.set(prevDim, { opacity: p * 0.55 });
          },
          onLeaveBack: () => {
            gsap.set(prevContent, { scale: 1 });
            if (prevDim) gsap.set(prevDim, { opacity: 0 });
          },
        });

        cleanups.push(() => st.kill());
      });

      return () => {
        cleanups.forEach((c) => c());
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return <div ref={root} className={`about-stack ${className}`}>{children}</div>;
}

export interface PanelProps {
  children: ReactNode;
  id?: string;
  zIndex?: number;
  background?: string;
  theme?: 'dark' | 'light';
  className?: string;
  panelRef?: Ref<HTMLElement>;
  style?: CSSProperties;
}

export function Panel({
  children,
  id,
  zIndex = 0,
  background,
  theme = 'dark',
  className = '',
  panelRef,
  style,
}: PanelProps) {
  return (
    <section
      ref={panelRef}
      id={id}
      className={`panel relative overflow-hidden ${className}`}
      data-header-theme={theme}
      style={{ zIndex, background: background || 'var(--forest)', ...style }}
    >
      <div data-panel-content className="relative min-h-[100svh] w-full lg:absolute lg:inset-0 lg:min-h-0">
        {children}
        <div data-panel-dim aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 bg-forest-deep opacity-0" />
      </div>
    </section>
  );
}
