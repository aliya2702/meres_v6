import { Link } from 'react-router-dom';
import { Page } from '@/components/Page';
import { DraftingLines } from '@/components/DraftingLines';
import { Arrow } from '@/components/PlanRoom';

export default function NotFound() {
  return (
    <Page>
      <section className="relative min-h-[100svh] overflow-hidden bg-linen pt-[calc(var(--header-h)+clamp(40px,8vh,100px))]" data-header-theme="light" aria-labelledby="nf-title">
        <div className="wrap grid12 items-center gap-y-12 pb-[var(--section-pad)]">
          <div className="col-span-12 lg:col-span-5">
            <h1 id="nf-title" className="d2 max-w-[12ch]" data-reveal="lines">
              This room hasn’t been drawn yet.
            </h1>
            <Link to="/" className="link-draw is-underlined mt-10" data-reveal="fade">
              Back to the home page
              <Arrow />
            </Link>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <DraftingLines drawing="plan" door autoDraw className="w-full text-taupe" />
          </div>
        </div>
      </section>
    </Page>
  );
}
