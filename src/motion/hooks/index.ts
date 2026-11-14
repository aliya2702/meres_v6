// Hook wrappers around the motion primitives, for components that own a single animated element.
import type { RefObject } from 'react';
import { useGSAP } from '../gsap';
import { lineReveal, parallax, scrubText, stackSection, drawLines } from '../primitives';

export function useLineReveal(ref: RefObject<HTMLElement>, opts?: Parameters<typeof lineReveal>[1]) {
  useGSAP(() => void lineReveal(ref.current, opts), { dependencies: [] });
}
export function useParallax(ref: RefObject<HTMLElement>, speed = 1) {
  useGSAP(() => void parallax(ref.current, speed), { dependencies: [speed] });
}
export function useScrubText(ref: RefObject<HTMLElement>) {
  useGSAP(() => scrubText(ref.current), { dependencies: [] });
}
export function useStackSection(
  ref: RefObject<HTMLElement>,
  parts?: { inner?: RefObject<HTMLElement>; shade?: RefObject<HTMLElement>; headline?: RefObject<HTMLElement> },
) {
  useGSAP(() => {
    stackSection(ref.current, {
      inner: parts?.inner?.current,
      shade: parts?.shade?.current,
      headline: parts?.headline?.current,
    });
  }, { dependencies: [] });
}
export function useDrawLines(ref: RefObject<SVGSVGElement>) {
  useGSAP(() => void drawLines(ref.current, { scroll: true }), { dependencies: [] });
}
