import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@/motion/gsap';
import { autoMotion } from '@/motion/primitives';
import { Footer } from './Footer';

/** Page shell: <main> + footer. Declarative reveals ([data-reveal], [data-parallax] …) run last. */
export function Page({ children, footer = true, className = '' }: { children: ReactNode; footer?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => autoMotion(ref.current), { scope: ref });
  return (
    <div ref={ref} className={`page overflow-x-clip ${className}`}>
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      {footer && <Footer />}
    </div>
  );
}
