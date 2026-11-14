// Motion tokens. Eases are registered in ./gsap.ts:
//   meres.out   '0.16, 1, 0.3, 1'   settling (expo-out feel)
//   meres.inOut '0.65, 0, 0.35, 1'  panels, wipes, page transitions
//   meres.soft  '0.33, 1, 0.68, 1'  small UI, hovers
export const ease = { out: 'meres.out', inOut: 'meres.inOut', soft: 'meres.soft' } as const;
export const dur = { micro: 0.25, ui: 0.45, reveal: 1.1, panel: 1.25, hero: 1.6 } as const;
export const stagger = { lines: 0.09, words: 0.04, items: 0.12 } as const;

/** Media conditions used with gsap.matchMedia() everywhere. */
export const mq = {
  full: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  lite: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

export const isReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
