import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cta } from '@/content/copy';
import { Magnetic } from './MagneticButton';

/**
 * "Tell us what matters" → /contact#project-inquiry, with visible microcopy.
 * In the header the microcopy is attached as an accessible description only.
 */
export function PrimaryCTA({
  tone = 'light',
  size = 'lg',
  microcopy = 'visible',
  className = '',
  solid,
}: {
  tone?: 'light' | 'dark' | 'inherit';
  size?: 'md' | 'lg';
  microcopy?: 'visible' | 'sr';
  className?: string;
  solid?: boolean;
}) {
  const id = useId();
  const descId = `cta-desc-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <div className={`primary-cta flex flex-col items-start gap-3 ${className}`}>
      <Magnetic>
        <Link
          to={cta.href}
          className={`cta ${size === 'lg' ? 'cta-lg' : ''} ${solid ? 'cta--solid' : ''} ${tone === 'dark' ? 'text-linen' : tone === 'light' ? 'text-ink' : ''}`}
          aria-describedby={descId}
          data-cursor="cta"
        >
          <span className="cta-roll" aria-hidden="true">
            <span>{cta.label}</span>
            <span>{cta.label}</span>
          </span>
          <span className="sr-only">{cta.label}</span>
        </Link>
      </Magnetic>
      <p
        id={descId}
        className={
          microcopy === 'sr'
            ? 'sr-only'
            : `text-[1.1875rem] leading-snug max-w-[36ch] ${tone === 'dark' ? 'text-linen/80' : tone === 'light' ? 'text-ink/75' : 'opacity-80'}`
        }
      >
        {cta.microcopy}
      </p>
    </div>
  );
}
