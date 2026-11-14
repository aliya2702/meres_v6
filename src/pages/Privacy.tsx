import { Page } from '@/components/Page';

// REQUIRED PRE-LAUNCH ITEM: publish the MERES privacy notice here. Do not write legal text in code.
export default function Privacy() {
  return (
    <Page>
      <section className="min-h-[80svh] bg-linen pt-[calc(var(--header-h)+clamp(64px,14vh,160px))]" data-header-theme="light" aria-labelledby="privacy-title">
        <div className="wrap pb-[var(--section-pad)]">
          <h1 id="privacy-title" className="d1" data-reveal="lines">
            Privacy notice
          </h1>
          <p className="body-copy mt-10" data-reveal="fade">
            The MERES privacy notice will be published here before launch.
          </p>
        </div>
      </section>
    </Page>
  );
}
