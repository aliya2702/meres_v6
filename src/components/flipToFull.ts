import { gsap } from '@/motion/gsap';
import { crops, images, type CropKey } from '@/data/images';
import { isReduced } from '@/motion/tokens';

/**
 * Shared-element hand-off: a fixed frame starts at the clicked element's box and grows to
 * full screen; the Plaster Wipe then covers it and the destination opens on the same image.
 */
export function flipToFull(from: Element, content: { crop?: CropKey; color?: string }, then: () => void) {
  if (isReduced()) return then();
  const r = from.getBoundingClientRect();
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '100vw',
    height: '100vh',
    zIndex: '140',
    overflow: 'hidden',
    pointerEvents: 'none',
    background: content.color ?? 'var(--linen-deep)',
  } as CSSStyleDeclaration);
  if (content.crop) {
    const c = crops[content.crop];
    const img = images[c.imageKey];
    el.innerHTML = `<img src="${img.webp1672}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${c.objectPosition}"/><span class="viz-label">Concept visualization</span>`;
  }
  document.body.appendChild(el);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clip = (t: number, rgt: number, b: number, l: number) => `inset(${t}px ${rgt}px ${b}px ${l}px)`;
  gsap.fromTo(
    el,
    { clipPath: clip(r.top, vw - r.right, vh - r.bottom, r.left) },
    {
      clipPath: clip(0, 0, 0, 0),
      duration: 0.7,
      ease: 'meres.inOut',
      onComplete: () => {
        then();
        window.setTimeout(() => el.remove(), 900);
      },
    },
  );
}
