import { useEffect } from 'react';
import { ScrollTrigger } from '@/motion/gsap';
import { Page } from '@/components/Page';
import { AboutCursor } from '@/components/about/AboutCursor';
import { AboutStack } from '@/components/about/AboutStack';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutSplitStory } from '@/components/about/AboutSplitStory';
import { AboutHandoff } from '@/components/about/AboutHandoff';
import { AboutGreenScene } from '@/components/about/AboutGreenScene';
import { AboutSequence } from '@/components/about/AboutSequence';
import { AboutFilmstrip } from '@/components/about/AboutFilmstrip';
import { AboutClosing } from '@/components/about/AboutClosing';
import '@/components/about/about.css';

/**
 * MERES — About page (/about).
 * Final editorial sequence:
 * 1. Hero: Monumental "About" title over full-bleed twilight residence (E1)
 * 2. Split Scene: Eddie Johnson introduction + client kitchen detail (04-kitchen-detail)
 * 3. Hand-off: Two client concept visualizations (01-kitchen-hero, 03-dining-nook)
 * 4. Statement: "That belief guides MERES. / Nothing meaningful happens by accident." (no images)
 * 5. Sequence: 4-slide "Design that listens" sticky architectural sequence
 * 6. Filmstrip: 8 verified craftsman, workshop, and residential photographs (no swatches/textures)
 * 7. Closing: Centered "Tell us what matters" call to action
 * 8. Shared site footer in normal flow
 */
export default function About() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});

    // Optional debug inspection for ?debug=1 or ?debug=images
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1' || params.get('debug') === 'images') {
      const timer = window.setTimeout(() => {
        const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('.about-page img'));
        const broken = imgs.filter((img) => img.complete && img.naturalWidth === 0);
        if (broken.length > 0) {
          console.warn('[about?debug=1] Broken images detected:', broken);
        }
        const panels = document.querySelectorAll('.about-page .panel');
        console.info(
          `[about?debug=1] Panels: ${panels.length}, Images: ${imgs.length}, Broken: ${broken.length}`
        );
      }, 1500);

      return () => window.clearTimeout(timer);
    }
  }, []);

  return (
    <Page>
      <div className="about-page relative w-full bg-forest text-linen">
        <AboutCursor />
        <AboutStack>
          <AboutHero />
          <AboutSplitStory />
          <AboutHandoff />
          <AboutGreenScene />
          <AboutSequence />
          <AboutFilmstrip />
          <AboutClosing />
        </AboutStack>
      </div>
    </Page>
  );
}
