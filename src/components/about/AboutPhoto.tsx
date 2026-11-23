import { useState, type CSSProperties } from 'react';
import { getAboutImage } from './aboutImages';
import { ImageCaption } from '../ImageCaption';

export interface AboutPhotoProps {
  id: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  cursorView?: boolean;
  'data-drift'?: 'up' | 'down';
  priority?: boolean;
  showCaption?: boolean;
}

/**
 * AboutPhoto: Renders one verified photograph from aboutImages.ts with
 * a warm-taupe fallback block and console.warn if loading ever fails.
 * Explicit override allows illustrative images on this page with caption.
 */
export function AboutPhoto({
  id,
  className = '',
  imgClassName = '',
  style,
  cursorView = false,
  'data-drift': dataDrift,
  priority = false,
  showCaption = true,
}: AboutPhotoProps) {
  const entry = getAboutImage(id);
  const [failed, setFailed] = useState(false);

  return (
    <div
      data-about-photo={id}
      data-about-cursor={cursorView ? 'view' : undefined}
      data-drift={dataDrift}
      style={style}
      className={`relative overflow-hidden bg-taupe/20 ${className}`}
    >
      {failed ? (
        <div
          aria-label={entry.alt}
          role="img"
          className="h-full w-full bg-[var(--taupe)]"
        />
      ) : (
        <img
          src={entry.src}
          alt={entry.alt}
          data-image-id={entry.id}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onError={() => {
            console.warn(`[about] Image failed to load: ${id} (${entry.src})`);
            setFailed(true);
          }}
          className={`block h-full w-full object-cover ${imgClassName}`}
          style={{ objectPosition: entry.objectPosition ?? '50% 50%' }}
        />
      )}
      {showCaption && !failed && (
        <ImageCaption label={entry.label} />
      )}
    </div>
  );
}
