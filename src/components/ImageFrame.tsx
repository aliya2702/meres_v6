import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { crops, images, type CropKey } from '@/data/images';
import { VisualizationLabel } from './VisualizationLabel';

export interface ImageFrameProps {
  crop: CropKey;
  sizes?: string;
  priority?: boolean;
  /** Internal parallax of the photo inside its frame (−1 to 1). */
  parallax?: number;
  reveal?: 'mask-up' | 'mask-side' | 'expand' | 'none';
  className?: string;
  style?: CSSProperties;
  /** Aspect ratio of the frame. Defaults to the native 1672/941. */
  ratio?: string;
  /** Fill the parent instead of using an aspect ratio. */
  fill?: boolean;
  vignette?: boolean;
  label?: boolean;
  children?: ReactNode;
  imgClassName?: string;
  /** Override the crop's focal point (e.g. a portrait crop of a full frame). */
  objectPosition?: string;
  labelClassName?: string;
}

/** Renders every photograph: <picture> with WebP srcset + JPG fallback, zero layout shift, label always on. */
export const ImageFrame = forwardRef<HTMLDivElement, ImageFrameProps>(function ImageFrame(
  {
    crop,
    sizes = '100vw',
    priority,
    parallax,
    reveal = 'none',
    className = '',
    style,
    ratio,
    fill,
    vignette,
    label = false,
    children,
    imgClassName = '',
    objectPosition,
    labelClassName,
  },
  ref,
) {
  const c0 = crops[crop];
  const c = objectPosition ? { ...c0, objectPosition } : c0;
  const img = images[c.imageKey];
  const frameStyle: CSSProperties = fill ? { ...style } : { aspectRatio: ratio ?? `${img.width} / ${img.height}`, ...style };
  return (
    <div
      ref={ref}
      className={`img-frame ${vignette ? 'forest-vignette' : ''} ${fill ? 'absolute inset-0' : ''} ${className}`}
      style={frameStyle}
      data-mask={reveal !== 'none' ? reveal : undefined}
      data-crop={crop}
    >
      <div className="img-inner" data-parallax-inner={parallax ? String(parallax) : undefined}>
        <div className="img-scale h-full w-full" style={{ transform: `scale(${c.scale})`, transformOrigin: c.objectPosition }}>
          <picture>
            <source type="image/webp" srcSet={`${img.webp960} 960w, ${img.webp1672} 1672w`} sizes={sizes} />
            <img
              src={img.jpg1672}
              alt={img.alt}
              data-image-id={img.file.replace('meres-', '')}
              width={img.width}
              height={img.height}
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              // @ts-expect-error fetchpriority is valid HTML, typed in newer React
              fetchpriority={priority ? 'high' : undefined}
              className={imgClassName}
              style={{ objectPosition: c.objectPosition }}
              draggable={false}
            />
          </picture>
        </div>
      </div>
      {children}
      {label && <VisualizationLabel className={labelClassName} />}
    </div>
  );
});
