// Typed image manifest. Six supplied concept visualizations (native 1672 × 941).
// Every rendering of these files must carry the "Concept visualization" label.

const base = import.meta.env.BASE_URL;

export type ImageKey =
  | 'kitchenHero'
  | 'kitchenWide'
  | 'diningNook'
  | 'kitchenDetail'
  | 'wineBar'
  | 'secondKitchen';

export interface ImageAsset {
  key: ImageKey;
  file: string;
  alt: string;
  width: 1672;
  height: 941;
  webp960: string;
  webp1672: string;
  jpg1672: string;
}

const make = (key: ImageKey, file: string, alt: string): ImageAsset => ({
  key,
  file,
  alt,
  width: 1672,
  height: 941,
  webp960: `${base}images/${file}-960.webp`,
  webp1672: `${base}images/${file}-1672.webp`,
  jpg1672: `${base}images/${file}-1672.jpg`,
});

export const images: Record<ImageKey, ImageAsset> = {
  kitchenHero: make('kitchenHero', '01-meres-kitchen-hero', 'Walnut kitchen with a stone island and upholstered counter seating.'),
  kitchenWide: make('kitchenWide', '02-meres-kitchen-wide', 'Kitchen island with stone worktop, pendant lighting, and a connected dining area.'),
  diningNook: make('diningNook', '03-meres-dining-nook', 'Dining nook with an open book, upholstered seating, and glazed doors to a garden.'),
  kitchenDetail: make('kitchenDetail', '04-meres-kitchen-detail', 'Walnut cabinetry, a stone backsplash, a range, and a brass-toned kitchen faucet.'),
  wineBar: make('wineBar', '05-meres-wine-bar', 'Dark stone home bar with wine storage and warm wall lighting.'),
  secondKitchen: make('secondKitchen', '06-meres-second-kitchen', 'Kitchen with a broad island, four counter stools, walnut cabinetry, and pendant lighting.'),
};

export interface Crop {
  imageKey: ImageKey;
  objectPosition: string;
  scale: number;
}

const c = (imageKey: ImageKey, objectPosition: string, scale: number): Crop => ({ imageKey, objectPosition, scale });

// Named crops — one image shown at a different scale and focus, so six files feel like twenty frames.
export const crops = {
  'kitchenHero.full': c('kitchenHero', '50% 55%', 1),
  'kitchenHero.pendants': c('kitchenHero', '50% 8%', 1.6),
  'kitchenHero.stools': c('kitchenHero', '45% 92%', 1.5),
  'kitchenWide.full': c('kitchenWide', '50% 50%', 1),
  'kitchenWide.island': c('kitchenWide', '70% 70%', 1.4),
  'kitchenWide.throughDoor': c('kitchenWide', '12% 45%', 1.8),
  'diningNook.full': c('diningNook', '50% 50%', 1),
  'diningNook.book': c('diningNook', '30% 72%', 1.9),
  'diningNook.garden': c('diningNook', '58% 40%', 1.7),
  'kitchenDetail.full': c('kitchenDetail', '50% 50%', 1),
  'kitchenDetail.faucet': c('kitchenDetail', '76% 38%', 1.8),
  'kitchenDetail.mug': c('kitchenDetail', '92% 72%', 2.2),
  'kitchenDetail.range': c('kitchenDetail', '22% 62%', 1.6),
  'wineBar.full': c('wineBar', '50% 50%', 1),
  'wineBar.stone': c('wineBar', '55% 75%', 1.7),
  'wineBar.arch': c('wineBar', '22% 40%', 1.5),
  'secondKitchen.full': c('secondKitchen', '50% 55%', 1),
  'secondKitchen.chandelier': c('secondKitchen', '52% 20%', 1.8),
} as const satisfies Record<string, Crop>;

export type CropKey = keyof typeof crops;

export const getCrop = (key: CropKey) => crops[key];
export const getImage = (key: CropKey) => images[crops[key].imageKey];
