import { useEffect } from 'react';

function getImageId(img: HTMLImageElement): string {
  const custom = img.getAttribute('data-image-id');
  if (custom) return custom;
  const src = img.currentSrc || img.src || '';
  if (src.includes('01-meres-kitchen-hero')) return '01-kitchen-hero';
  if (src.includes('02-meres-kitchen-wide')) return '02-kitchen-wide';
  if (src.includes('03-meres-dining-nook')) return '03-dining-nook';
  if (src.includes('04-meres-kitchen-detail')) return '04-kitchen-detail';
  if (src.includes('05-meres-wine-bar')) return '05-wine-bar';
  if (src.includes('06-meres-second-kitchen')) return '06-second-kitchen';
  if (src.includes('W1')) return 'W1-craft-workshop';
  if (src.includes('W2')) return 'W2-hand-joinery';
  if (src.includes('P2')) return 'P2-material-samples';
  if (src.includes('E1')) return 'E1-exterior';
  const match = src.match(/([^/]+)\.(?:jpg|webp|png)/i);
  return match ? match[1] : 'image';
}

/**
 * Image Debug Overlay: activated strictly when `?debug=images` is in the URL.
 * Renders a small corner label on every <img> with:
 * [images.ts id] [naturalW]x[naturalH] / [displayedW]x[displayedH]
 * Highlighted in red if natural width < displayed width.
 */
export function ImageDebugOverlay() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDebug = window.location.search.includes('debug=images');
    if (!isDebug) return;

    const updateBadges = () => {
      const imgs = document.querySelectorAll<HTMLImageElement>('img');
      imgs.forEach((img) => {
        // Skip hidden or zero-size images
        const rect = img.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;
        const displayedW = Math.round(rect.width);
        const displayedH = Math.round(rect.height);

        // Don't render until loaded
        if (naturalW === 0 && !img.complete) {
          img.addEventListener('load', updateBadges, { once: true });
          return;
        }

        const id = getImageId(img);
        const isUnderSized = naturalW > 0 && naturalW < displayedW;

        // Find or create badge element
        const parent = img.parentElement;
        if (!parent) return;

        // Ensure parent can position absolute children
        const parentComputed = window.getComputedStyle(parent);
        if (parentComputed.position === 'static') {
          parent.style.position = 'relative';
        }

        let badge = parent.querySelector<HTMLDivElement>(':scope > .img-debug-badge');
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'img-debug-badge';
          badge.style.position = 'absolute';
          badge.style.top = '6px';
          badge.style.right = '6px';
          badge.style.zIndex = '9999';
          badge.style.fontFamily = 'monospace';
          badge.style.fontSize = '11px';
          badge.style.fontWeight = '500';
          badge.style.padding = '2px 6px';
          badge.style.borderRadius = '3px';
          badge.style.pointerEvents = 'none';
          badge.style.whiteSpace = 'nowrap';
          badge.style.lineHeight = '1.3';
          badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
          parent.appendChild(badge);
        }

        badge.textContent = `${id} ${naturalW}x${naturalH} / ${displayedW}x${displayedH}`;
        if (isUnderSized) {
          badge.style.backgroundColor = '#dc2626';
          badge.style.color = '#ffffff';
          badge.style.border = '1px solid #ef4444';
        } else {
          badge.style.backgroundColor = 'rgba(15, 23, 42, 0.88)';
          badge.style.color = '#f8fafc';
          badge.style.border = '1px solid rgba(255, 255, 255, 0.25)';
        }
      });
    };

    updateBadges();

    const handleResize = () => updateBadges();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleResize, { passive: true });

    const observer = new MutationObserver(() => updateBadges());
    observer.observe(document.body, { childList: true, subtree: true });

    const interval = setInterval(updateBadges, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      observer.disconnect();
      clearInterval(interval);
      document.querySelectorAll('.img-debug-badge').forEach((b) => b.remove());
    };
  }, []);

  // Does not render anything directly into the React tree
  return null;
}
