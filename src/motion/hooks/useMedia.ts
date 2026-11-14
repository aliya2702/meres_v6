import { useEffect, useState } from 'react';

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** Desktop with motion allowed: pins, tilt, cursor, WebGL. */
export const useFullMotion = () => useMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
