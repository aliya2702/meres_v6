import { useRef } from 'react';
import { gsap, useGSAP } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { lineReveal } from '@/motion/primitives';
import { entrance } from '@/motion/entrance';
import { contact } from '@/content/copy';
import { trust } from '@/data/trust';
import { Page } from '@/components/Page';
import { ImageFrame } from '@/components/ImageFrame';
import { InquiryForm } from '@/components/InquiryForm';

/** Contact — calm: no pins, no WebGL. */
export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const root = ref.current!;
      const media = root.querySelector('.contact-media');
      // One h1 per breakpoint (the other is display:none, so only one is ever exposed).
      const heads = Array.from(root.querySelectorAll<HTMLElement>('h1')).map((h) => lineReveal(h, { paused: true, auto: false }));
      const intro = root.querySelectorAll('.contact-intro');
      const fields = root.querySelectorAll('.form-fade');
      const reduced = isReduced();
      if (!reduced) {
        gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set([...intro, ...fields], { opacity: 0, y: 20 });
      }
      const off = entrance.on(
        contextSafe!(() => {
          heads.forEach((a) => a?.play());
          if (reduced) return;
          gsap
            .timeline()
            .to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'meres.inOut' }, 0)
            .to(intro, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'meres.out' }, 0.5)
            .to(fields, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'meres.out' }, 0.6);
        }),
      );
      return () => off();
    },
    { scope: ref },
  );

  return (
    <Page>
      <section ref={ref} className="relative bg-linen lg:flex" data-header-theme="light" aria-label="Tell us what matters">
        {/* Left 42%: sticky image panel */}
        <div className="on-dark relative h-[38svh] text-linen lg:sticky lg:top-0 lg:h-[100svh] lg:w-[42%]" data-header-theme="dark">
          <div className="contact-media absolute inset-0 overflow-hidden">
            <div className={`absolute inset-0 ${isReduced() ? '' : 'ken-burns'}`}>
              <ImageFrame crop="diningNook.garden" fill sizes="(min-width:1024px) 42vw, 100vw" priority labelClassName="lg:!bottom-auto lg:!top-[96px]" />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-forest-deep/95 via-forest/45 to-transparent" />
          </div>
          <div className="wrap absolute inset-x-0 bottom-0 z-[3] hidden pb-[clamp(40px,8vh,96px)] lg:block">
            <h1 id="contact-title" className="d2 max-w-[10ch]" data-reveal="manual">
              {contact.headline}
            </h1>
            <div className="body-copy mt-8 max-w-[34rem] text-linen/90">
              {contact.intro.map((p) => (
                <p key={p} className="contact-intro">
                  {p}
                </p>
              ))}
              {trust.phone && (
                <p className="mt-4">
                  <a href={`tel:${trust.phone.replace(/[^0-9+]/g, '')}`} className="link-draw text-linen hover:text-linen">
                    {trust.phone}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right 58%: the form */}
        <div className="relative lg:w-[58%]">
          <div className="wrap pb-[var(--section-pad)] pt-12 lg:pt-[calc(var(--header-h)+clamp(40px,8vh,100px))] xl:px-[clamp(48px,6vw,120px)]">
            <div className="mb-14 lg:hidden">
              <h1 className="d2 max-w-[12ch]" data-reveal="manual">
                {contact.headline}
              </h1>
              <div className="body-copy mt-6">
                {contact.intro.map((p) => (
                  <p key={p} className="contact-intro">
                    {p}
                  </p>
                ))}
                {trust.phone && (
                  <p className="mt-4">
                    <a href={`tel:${trust.phone.replace(/[^0-9+]/g, '')}`} className="link-draw text-ink hover:text-ink">
                      {trust.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
            <InquiryForm />
          </div>
        </div>
      </section>
    </Page>
  );
}
