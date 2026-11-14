import type Lenis from 'lenis';
import { isReduced } from '@/motion/tokens';

// Module-level handle so non-React code (menu, anchors, rulers) can reach the single Lenis instance.
let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

export const headerOffset = () => {
  const h = document.querySelector<HTMLElement>('.site-header');
  return h ? h.offsetHeight : 84;
};

/** Scroll to an element/position through Lenis (or natively when reduced motion is on). */
/** Programmatic scrolls (anchors, ruler, back-to-top) should not hide the header. */
export let programmaticUntil = 0;

export function scrollToTarget(target: Element | number, opts: { immediate?: boolean; offset?: number } = {}) {
  programmaticUntil = performance.now() + (opts.immediate ? 400 : 1900);
  const offset = opts.offset ?? (typeof target === 'number' ? 0 : -headerOffset());
  const lenis = instance;
  if (lenis) {
    // Lenis measures the document lazily (debounced ResizeObserver). After a route swap or on a
    // deep link the stored limit can be stale and would clamp the target, so re-measure first.
    lenis.resize();
    lenis.scrollTo(target as HTMLElement | number, {
      offset,
      immediate: opts.immediate,
      force: true,
      duration: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
    return;
  }
  const top =
    typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: opts.immediate || isReduced() ? 'auto' : 'smooth' });
}

export function scrollToHash(hash: string, immediate = false) {
  if (!hash || hash === '#') return false;
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return false;
  scrollToTarget(el, { immediate });
  return true;
}
