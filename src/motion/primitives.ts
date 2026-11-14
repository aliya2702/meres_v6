// Reusable motion primitives (brief §5.3). Each is a plain function meant to be called inside a
// section's useGSAP() scope, so everything it creates is reverted automatically on unmount.
import { gsap, ScrollTrigger, SplitText } from './gsap';
import { dur, stagger as stg, isReduced, isDesktop } from './tokens';

type El = HTMLElement | null | undefined;

const showEl = (el: HTMLElement) => gsap.set(el, { visibility: 'visible' });

/** 1. Line Reveal — masked lines rise yPercent 110 → 0. Plays once at top 85%. */
export function lineReveal(
  el: El,
  opts: { delay?: number; scroll?: boolean; stagger?: number; duration?: number; start?: string; paused?: boolean; auto?: boolean } = {},
) {
  if (!el) return null;
  showEl(el);
  if (isReduced()) {
    return gsap.from(el, {
      opacity: 0,
      duration: 0.2,
      ease: 'none',
      paused: opts.paused,
      scrollTrigger: opts.scroll === false || opts.paused ? undefined : { trigger: el, start: 'top 92%', once: true },
    });
  }
  let anim: gsap.core.Tween | null = null;
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: opts.auto ?? !opts.paused,
    linesClass: 'split-line',
    onSplit(self: SplitText) {
      self.masks.forEach((m) => (m as HTMLElement).classList.add('split-line-mask'));
      anim = gsap.from(self.lines, {
        yPercent: 110,
        duration: opts.duration ?? dur.reveal,
        ease: 'meres.out',
        stagger: opts.stagger ?? stg.lines,
        delay: opts.delay ?? 0,
        paused: opts.paused,
        scrollTrigger:
          opts.scroll === false || opts.paused
            ? undefined
            : { trigger: el, start: opts.start ?? 'top 85%', once: true },
      });
      return anim;
    },
  });
  return anim as gsap.core.Tween | null;
}

/** Fade + rise (24px) for paragraphs, buttons and small UI. */
export function fadeUp(
  targets: gsap.TweenTarget,
  opts: { trigger?: Element | null; delay?: number; stagger?: number; y?: number; start?: string; scroll?: boolean } = {},
) {
  const reduced = isReduced();
  const list = gsap.utils.toArray<HTMLElement>(targets);
  if (!list.length) return null;
  gsap.set(list, { visibility: 'visible' });
  return gsap.from(list, {
    opacity: 0,
    y: reduced ? 0 : opts.y ?? 24,
    duration: reduced ? 0.2 : 0.9,
    ease: reduced ? 'none' : 'meres.out',
    delay: opts.delay ?? 0,
    stagger: opts.stagger ?? 0.1,
    scrollTrigger:
      opts.scroll === false
        ? undefined
        : { trigger: opts.trigger ?? list[0], start: opts.start ?? 'top 88%', once: true },
  });
}

/** 3. Parallax Layer — yPercent from +speed*20 to -speed*20, scrubbed. */
export function parallax(el: El, speed: number, trigger?: Element | null, amp = 20) {
  if (!el || isReduced()) return null;
  const s = isDesktop() ? speed : speed * 0.5;
  return gsap.fromTo(
    el,
    { yPercent: s * amp },
    {
      yPercent: -s * amp,
      ease: 'none',
      scrollTrigger: { trigger: trigger ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
}

/** 5. Scrub Text — each line's opacity 0.18 → 1 as it crosses 80% → 45% of the viewport. */
export function scrubText(el: El) {
  if (!el) return;
  showEl(el);
  if (isReduced()) return;
  SplitText.create(el, {
    type: 'lines',
    autoSplit: true,
    linesClass: 'scrub-line',
    onSplit(self: SplitText) {
      const tweens = self.lines.map((line) =>
        gsap.fromTo(
          line,
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: line, start: 'top 80%', end: 'top 45%', scrub: true },
          },
        ),
      );
      return gsap.timeline().add(tweens, 0);
    },
  });
}

/** 6. Focus Pull — added to a (usually pinned, scrubbed) timeline. */
export function focusPull(tl: gsap.core.Timeline, el: El, opts: { at?: number; inDur?: number; hold?: number; out?: boolean } = {}) {
  if (!el) return tl;
  const at = opts.at ?? 0;
  const inDur = opts.inDur ?? 0.6;
  tl.fromTo(
    el,
    { filter: 'blur(14px)', scale: 1.12, opacity: 0.2, letterSpacing: '0.04em' },
    { filter: 'blur(0px)', scale: 1, opacity: 1, letterSpacing: '-0.01em', ease: 'meres.inOut', duration: inDur },
    at,
  );
  if (opts.hold) tl.to({}, { duration: opts.hold });
  if (opts.out) tl.to(el, { filter: 'blur(8px)', opacity: 0, ease: 'meres.inOut', duration: 0.3 });
  return tl;
}

/** Focus Pull for non-pinned contexts (mobile / short sections): plays once on enter. */
export function focusPullOnce(el: El, start = 'top 75%') {
  if (!el) return;
  if (isReduced()) {
    gsap.from(el, { opacity: 0, duration: 0.2, scrollTrigger: { trigger: el, start, once: true } });
    return;
  }
  gsap.fromTo(
    el,
    { filter: 'blur(14px)', scale: 1.12, opacity: 0.2, letterSpacing: '0.04em' },
    {
      filter: 'blur(0px)',
      scale: 1,
      opacity: 1,
      letterSpacing: '-0.01em',
      duration: 1.4,
      ease: 'meres.inOut',
      scrollTrigger: { trigger: el, start, once: true },
      onComplete: () => gsap.set(el, { clearProps: 'filter' }),
    },
  );
}

/**
 * 2. Stack Section — pins the section while the next one slides over it.
 * While covered: inner scales 1 → 0.94, shade 0 → 0.45, headline drifts up 8vh.
 * Desktop only; mobile uses CSS sticky (.stack-sticky).
 */
export function stackSection(
  section: El,
  parts: { inner?: El; shade?: El; headline?: El } = {},
) {
  if (!section || isReduced() || !isDesktop()) return;
  const start = () => (section.offsetHeight > window.innerHeight + 2 ? 'bottom bottom' : 'top top');
  const end = () => `+=${window.innerHeight}`;
  ScrollTrigger.create({
    trigger: section,
    start,
    end,
    pin: true,
    pinSpacing: false,
    invalidateOnRefresh: true,
  });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start, end, scrub: 0.6, invalidateOnRefresh: true },
  });
  if (parts.inner) tl.to(parts.inner, { scale: 0.94, ease: 'none', transformOrigin: '50% 30%' }, 0);
  if (parts.shade) tl.fromTo(parts.shade, { opacity: 0 }, { opacity: 0.45, ease: 'none' }, 0);
  if (parts.headline) tl.to(parts.headline, { y: () => -window.innerHeight * 0.08, ease: 'none' }, 0);
  return tl;
}

/** Image mask reveal on enter. */
export function maskReveal(el: El, mode: 'mask-up' | 'mask-side' | 'expand' = 'mask-up', delay = 0) {
  if (!el) return;
  const reduced = isReduced();
  const from =
    mode === 'mask-side'
      ? 'inset(0% 100% 0% 0%)'
      : mode === 'expand'
        ? 'inset(18% 18% 18% 18%)'
        : 'inset(100% 0% 0% 0%)';
  if (reduced) {
    gsap.from(el, { opacity: 0, duration: 0.2, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    return;
  }
  const img = el.querySelector('.img-scale');
  const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true }, delay });
  tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur.panel, ease: 'meres.inOut' }, 0);
  if (img) tl.from(img, { scale: 1.18, duration: dur.hero, ease: 'meres.out' }, 0);
  return tl;
}

/** Draw every stroke inside an SVG via stroke-dashoffset. Returns a timeline (paused unless scroll). */
export function drawLines(
  svg: Element | null | undefined,
  opts: { duration?: number; stagger?: number; scroll?: boolean; paused?: boolean; start?: string; selector?: string } = {},
) {
  if (!svg) return null;
  const paths = gsap.utils.toArray<SVGGeometryElement>(
    svg.querySelectorAll(opts.selector ?? '[data-draw]'),
  );
  if (!paths.length) return null;
  if (isReduced()) {
    gsap.set(paths, { strokeDasharray: 'none', strokeDashoffset: 0 });
    return null;
  }
  paths.forEach((p) => {
    const len = typeof p.getTotalLength === 'function' ? p.getTotalLength() : 1000;
    gsap.set(p, { strokeDasharray: len + 1, strokeDashoffset: len + 1 });
  });
  const tl = gsap.timeline({
    paused: opts.paused,
    scrollTrigger:
      opts.scroll && !opts.paused ? { trigger: svg, start: opts.start ?? 'top 80%', once: true } : undefined,
  });
  tl.to(paths, {
    strokeDashoffset: 0,
    duration: opts.duration ?? 1.4,
    ease: 'meres.inOut',
    stagger: opts.stagger ?? 0.04,
  });
  return tl;
}

/** Generic auto-motion for declarative attributes inside a scope. Call last in a page's useGSAP. */
export function autoMotion(scope: Element | null) {
  if (!scope) return;
  scope.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const d = parseFloat(el.dataset.delay ?? '0');
    lineReveal(el, { delay: d });
  });
  scope.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    fadeUp(el, { delay: parseFloat(el.dataset.delay ?? '0') });
  });
  scope.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
    fadeUp(el.children, { trigger: el, stagger: 0.12 });
  });
  scope.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    parallax(el, parseFloat(el.dataset.parallax ?? '1'), el.closest('[data-parallax-trigger]') ?? el);
  });
  scope.querySelectorAll<HTMLElement>('[data-parallax-inner]').forEach((el) => {
    const frame = el.closest('.img-frame');
    // Inner image is 115% of its frame, so cap travel at ±6% to never expose an edge.
    parallax(el, parseFloat(el.dataset.parallaxInner ?? '0.4'), frame, 15);
  });
  scope.querySelectorAll<HTMLElement>('[data-mask]').forEach((el) => {
    maskReveal(el, (el.dataset.mask as 'mask-up' | 'mask-side' | 'expand') ?? 'mask-up');
  });
  scope.querySelectorAll<HTMLElement>('[data-scrub-text]').forEach((el) => scrubText(el));
  scope.querySelectorAll<SVGElement>('svg[data-autodraw]').forEach((svg) => drawLines(svg, { scroll: true }));
}
