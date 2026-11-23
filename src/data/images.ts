// Typed image manifest. Six supplied concept visualizations (native 1672 × 941).
// Every rendering of these files must carry the "Concept visualization" label.

const base = import.meta.env.BASE_URL;

export type ImageKey =
  | 'kitchenHero'
  | 'kitchenWide'
  | 'diningNook'
  | 'kitchenDetail'
  | 'wineBar'
  | 'secondKitchen'
  | 'craftWorkshop'
  | 'handJoinery'
  | 'materialSamples'
  | 'exterior';

export type ImageStatus = 'client' | 'illustrative' | 'awaiting';

export interface ImageAsset {
  key: ImageKey;
  file: string;
  alt: string;
  width: number;
  height: number;
  webp960: string;
  webp1672: string;
  jpg1672: string;
  label?: string;
  lead?: boolean;
  status: ImageStatus;
}

const make = (
  key: ImageKey,
  file: string,
  alt: string,
  opts: { label?: string; lead?: boolean; status?: ImageStatus; width?: number; height?: number } = {},
): ImageAsset => {
  const isStock = file.startsWith('stock/');
  return {
    key,
    file,
    alt,
    width: opts.width ?? 1672,
    height: opts.height ?? 941,
    webp960: isStock ? `${base}images/${file}.jpg` : `${base}images/${file}-960.webp`,
    webp1672: isStock ? `${base}images/${file}.jpg` : `${base}images/${file}-1672.webp`,
    jpg1672: isStock ? `${base}images/${file}.jpg` : `${base}images/${file}-1672.jpg`,
    label: opts.label ?? (opts.status === 'illustrative' ? 'Illustrative image' : 'Concept visualization'),
    lead: opts.lead ?? false,
    status: opts.status ?? 'client',
  };
};

export const images: Record<ImageKey, ImageAsset> = {
  kitchenHero: make('kitchenHero', '01-meres-kitchen-hero', 'Walnut kitchen with a stone island and upholstered counter seating.', { lead: true, status: 'client' }),
  kitchenWide: make('kitchenWide', '02-meres-kitchen-wide', 'Kitchen island with stone worktop, pendant lighting, and a connected dining area.', { status: 'client' }),
  diningNook: make('diningNook', '03-meres-dining-nook', 'Dining nook with an open book, upholstered seating, and glazed doors to a garden.', { lead: true, status: 'client' }),
  kitchenDetail: make('kitchenDetail', '04-meres-kitchen-detail', 'Walnut cabinetry, a stone backsplash, a range, and a brass-toned kitchen faucet.', { status: 'client' }),
  wineBar: make('wineBar', '05-meres-wine-bar', 'Dark stone home bar with wine storage and warm wall lighting.', { status: 'client' }),
  secondKitchen: make('secondKitchen', '06-meres-second-kitchen', 'Kitchen with a broad island, four counter stools, walnut cabinetry, and pendant lighting.', { lead: true, status: 'client' }),
  craftWorkshop: make('craftWorkshop', 'stock/W1', 'Fine timber shavings and precision joinery in a craft workshop.', { status: 'illustrative', width: 2000, height: 1351 }),
  handJoinery: make('handJoinery', 'stock/W2', 'Bespoke dovetails and Japanese hand tools.', { status: 'illustrative', width: 2000, height: 1500 }),
  materialSamples: make('materialSamples', 'stock/P2', 'Curated wood veneer decks and stone samples.', { status: 'illustrative', width: 2000, height: 1333 }),
  exterior: make('exterior', 'stock/E1', 'Custom home exterior and architectural addition.', { status: 'awaiting', lead: false }),
};

export interface Crop {
  imageKey: ImageKey;
  objectPosition: string;
  scale: number;
}

const c = (imageKey: ImageKey, objectPosition: string, scale: number): Crop => ({ imageKey, objectPosition, scale });

// Named crops — every crop uses >= 40% of the source photo area with subjects centered.
export const crops = {
  'kitchenHero.full': c('kitchenHero', '50% 55%', 1),
  'kitchenHero.pendants': c('kitchenHero', '50% 18%', 1.15),
  'kitchenHero.stools': c('kitchenHero', '48% 65%', 1.05),
  'kitchenWide.full': c('kitchenWide', '50% 50%', 1),
  'kitchenWide.island': c('kitchenWide', '60% 60%', 1.1),
  'kitchenWide.throughDoor': c('kitchenWide', '20% 45%', 1.15),
  'diningNook.full': c('diningNook', '50% 50%', 1),
  'diningNook.book': c('diningNook', '35% 65%', 1.15),
  'diningNook.garden': c('diningNook', '55% 45%', 1.1),
  'kitchenDetail.full': c('kitchenDetail', '50% 50%', 1),
  'kitchenDetail.faucet': c('kitchenDetail', '72% 44%', 1.1),
  'kitchenDetail.mug': c('kitchenDetail', '84% 65%', 1.12),
  'kitchenDetail.range': c('kitchenDetail', '26% 50%', 1.1),
  'wineBar.full': c('wineBar', '50% 50%', 1),
  'wineBar.stone': c('wineBar', '55% 75%', 1.15),
  'wineBar.arch': c('wineBar', '25% 45%', 1.15),
  'secondKitchen.full': c('secondKitchen', '50% 55%', 1),
  'secondKitchen.chandelier': c('secondKitchen', '52% 28%', 1.1),
  'craftWorkshop.full': c('craftWorkshop', '50% 50%', 1),
  'handJoinery.full': c('handJoinery', '50% 50%', 1),
  'materialSamples.full': c('materialSamples', '50% 50%', 1),
  'exterior.full': c('exterior', '50% 50%', 1),
} as const satisfies Record<string, Crop>;

export type CropKey = keyof typeof crops;

export const getCrop = (key: CropKey) => crops[key];
export const getImage = (key: CropKey) => images[crops[key].imageKey];
