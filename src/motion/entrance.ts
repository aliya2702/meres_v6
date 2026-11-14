// A tiny signal that tells the current page's hero when it may begin its entrance:
// after the preloader hands off (first visit), on load (repeat visit), or 150ms before
// the Plaster Wipe clears (route change).
type Fn = () => void;
let fired = false;
const listeners = new Set<Fn>();

export const entrance = {
  reset() {
    fired = false;
  },
  fire() {
    fired = true;
    const fns = [...listeners];
    listeners.clear();
    // Run on a microtask so listeners never execute inside another component's GSAP context
    // (e.g. the preloader's timeline callback), which would revert their tweens on unmount.
    queueMicrotask(() => fns.forEach((f) => f()));
  },
  on(fn: Fn) {
    if (fired) {
      fn();
      return () => {};
    }
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  get fired() {
    return fired;
  },
};
