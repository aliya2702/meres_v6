export type AboutImageStatus = 'client' | 'illustrative';

export interface AboutImageEntry {
  id: string;
  file: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  status: AboutImageStatus;
  label: 'Concept visualization' | 'Illustrative image';
  description: string;
  objectPosition?: string;
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const resolve = (path: string) => {
  const clean = path.replace(/^\/+/, '');
  return base ? `${base}/${clean}` : `/${clean}`;
};

export const ABOUT_IMAGES: Record<string, AboutImageEntry> = {
  // Scene 1: Hero
  E1: {
    id: 'E1',
    file: 'stock/E1.jpg',
    src: resolve('images/stock/E1.jpg'),
    alt: 'Custom residential architectural addition with vertical timber cladding and panoramic glazing at twilight',
    width: 2000,
    height: 1333,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Custom residential extension at twilight',
    objectPosition: '50% 50%',
  },

  // Scene 2: Split scene
  '04-kitchen-detail': {
    id: '04-kitchen-detail',
    file: '04-meres-kitchen-detail-1672.jpg',
    src: resolve('images/04-meres-kitchen-detail-1672.jpg'),
    alt: 'Concept visualization of walnut cabinetry, marble backsplash, range and brass-toned faucet',
    width: 1672,
    height: 941,
    status: 'client',
    label: 'Concept visualization',
    description: 'Client kitchen millwork detail with walnut cabinetry and faucet',
    objectPosition: '60% 50%',
  },
  M2: {
    id: 'M2',
    file: 'stock/M2.jpg',
    src: resolve('images/stock/M2.jpg'),
    alt: 'Macro detail of raw woven cream linen textile with natural slub texture',
    width: 2000,
    height: 1334,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Raw woven cream linen textile swatch',
    objectPosition: '50% 50%',
  },

  // Scene 3: Two-image handoff
  '01-kitchen-hero': {
    id: '01-kitchen-hero',
    file: '01-meres-kitchen-hero-1672.jpg',
    src: resolve('images/01-meres-kitchen-hero-1672.jpg'),
    alt: 'Concept visualization of walnut kitchen with stone island, upholstered counter seating, and cone pendants',
    width: 1672,
    height: 941,
    status: 'client',
    label: 'Concept visualization',
    description: 'Client walnut kitchen with stone island and seating',
    objectPosition: '50% 50%',
  },
  '03-dining-nook': {
    id: '03-dining-nook',
    file: '03-meres-dining-nook-1672.jpg',
    src: resolve('images/03-meres-dining-nook-1672.jpg'),
    alt: 'Concept visualization of dining nook with upholstered seating, an open book, and doors to a garden',
    width: 1672,
    height: 941,
    status: 'client',
    label: 'Concept visualization',
    description: 'Client dining nook with morning light and garden doors',
    objectPosition: '50% 50%',
  },

  // Scene 4: Green scene floating perimeter frames
  M1: {
    id: 'M1',
    file: 'stock/M1.jpg',
    src: resolve('images/stock/M1.jpg'),
    alt: 'Warm beige veined natural stone slab with organic mineral markings',
    width: 2000,
    height: 2000,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Natural stone slab swatch',
    objectPosition: '50% 50%',
  },
  M3: {
    id: 'M3',
    file: 'stock/M3.jpg',
    src: resolve('images/stock/M3.jpg'),
    alt: 'European oak timber boards with natural grain and satin finish',
    width: 2000,
    height: 2000,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'European oak timber flooring swatch',
    objectPosition: '50% 50%',
  },
  E2: {
    id: 'E2',
    file: 'stock/E2.jpg',
    src: resolve('images/stock/E2.jpg'),
    alt: 'Contemporary cedar and pale limestone residence glowing softly at dusk',
    width: 2000,
    height: 1335,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Contemporary cedar and limestone residence',
    objectPosition: '50% 50%',
  },
  P2: {
    id: 'P2',
    file: 'stock/P2.jpg',
    src: resolve('images/stock/P2.jpg'),
    alt: 'Fan deck of bespoke wood veneer and finish samples laid out on craftsman workbench',
    width: 2000,
    height: 1333,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Wood veneer and finish sample deck',
    objectPosition: '50% 50%',
  },
  W1: {
    id: 'W1',
    file: 'stock/W1.jpg',
    src: resolve('images/stock/W1.jpg'),
    alt: 'Craft workshop bench with fine timber shavings and hand plane',
    width: 2000,
    height: 1351,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Craft workshop timber shavings',
    objectPosition: '50% 50%',
  },
  W2: {
    id: 'W2',
    file: 'stock/W2.jpg',
    src: resolve('images/stock/W2.jpg'),
    alt: 'Fine woodworking joinery bench with traditional Japanese hand tools and chisels',
    width: 2000,
    height: 1500,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Japanese hand joinery tools on workbench',
    objectPosition: '50% 50%',
  },

  // Scene 5: Sequence corner cards
  '05-wine-bar': {
    id: '05-wine-bar',
    file: '05-meres-wine-bar-1672.jpg',
    src: resolve('images/05-meres-wine-bar-1672.jpg'),
    alt: 'Concept visualization of dark stone home bar with custom wine storage and warm wall lighting',
    width: 1672,
    height: 941,
    status: 'client',
    label: 'Concept visualization',
    description: 'Client architectural wine bar with dark stone worktop',
    objectPosition: '50% 50%',
  },
  '02-kitchen-wide': {
    id: '02-kitchen-wide',
    file: '02-meres-kitchen-wide-1672.jpg',
    src: resolve('images/02-meres-kitchen-wide-1672.jpg'),
    alt: 'Concept visualization of wide kitchen island with stone worktop and connected dining space',
    width: 1672,
    height: 941,
    status: 'client',
    label: 'Concept visualization',
    description: 'Client wide kitchen with stone worktop and dining area',
    objectPosition: '50% 50%',
  },
  B2: {
    id: 'B2',
    file: 'stock/B2.jpg',
    src: resolve('images/stock/B2.jpg'),
    alt: 'Architectural bathroom with slatted dark walnut timber panelling, soft stone tilework, and warm lighting',
    width: 2000,
    height: 1335,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Architectural dark walnut bathroom',
    objectPosition: '50% 50%',
  },
  E3: {
    id: 'E3',
    file: 'stock/E3.jpg',
    src: resolve('images/stock/E3.jpg'),
    alt: 'Residential garden addition with panoramic architectural glazing opening onto landscape',
    width: 2000,
    height: 1335,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Residential garden elevation with panoramic glazing',
    objectPosition: '50% 50%',
  },

  // Scene 6: Filmstrip
  '06-second-kitchen': {
    id: '06-second-kitchen',
    file: '06-meres-second-kitchen-1672.jpg',
    src: resolve('images/06-meres-second-kitchen-1672.jpg'),
    alt: 'Concept visualization of kitchen with broad island, walnut cabinetry, and pendant chandelier',
    width: 1672,
    height: 941,
    status: 'client',
    label: 'Concept visualization',
    description: 'Client kitchen with broad island and chandelier',
    objectPosition: '50% 50%',
  },
  M5: {
    id: 'M5',
    file: 'stock/M5.jpg',
    src: resolve('images/stock/M5.jpg'),
    alt: 'Macro weave of unbleached natural Belgian linen textile with organic slub',
    width: 2000,
    height: 1552,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Natural Belgian linen weave',
    objectPosition: '50% 50%',
  },
  M7: {
    id: 'M7',
    file: 'stock/M7.jpg',
    src: resolve('images/stock/M7.jpg'),
    alt: 'Macro close-up of natural light limestone aggregate surface with mineral grain',
    width: 2000,
    height: 1333,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Natural light limestone aggregate',
    objectPosition: '50% 50%',
  },
  M8: {
    id: 'M8',
    file: 'stock/M8.jpg',
    src: resolve('images/stock/M8.jpg'),
    alt: 'Handcrafted terracotta zellige wall tiles with subtle tonal variations and natural glaze',
    width: 2000,
    height: 1334,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Terracotta zellige wall tiles',
    objectPosition: '50% 50%',
  },
  W3: {
    id: 'W3',
    file: 'stock/W3.jpg',
    src: resolve('images/stock/W3.jpg'),
    alt: 'Cabinetmaker hands shaping hardwood dovetail joints on heavy timber workbench',
    width: 2000,
    height: 1333,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Cabinetmaker shaping hardwood joints',
    objectPosition: '50% 50%',
  },
  E5: {
    id: 'E5',
    file: 'stock/E5.jpg',
    src: resolve('images/stock/E5.jpg'),
    alt: 'Modern residence terrace connecting interior oak floors to limestone courtyard and trees',
    width: 2000,
    height: 1500,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Residence terrace and limestone courtyard',
    objectPosition: '50% 50%',
  },
  L1: {
    id: 'L1',
    file: 'stock/L1.jpg',
    src: resolve('images/stock/L1.jpg'),
    alt: 'Quiet modern living space with low cream sofa, stone hearth, and open sightlines to kitchen',
    width: 2000,
    height: 1286,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Quiet modern living space with stone hearth',
    objectPosition: '50% 50%',
  },
  K6: {
    id: 'K6',
    file: 'stock/K6.jpg',
    src: resolve('images/stock/K6.jpg'),
    alt: 'Bespoke kitchen millwork detail with integrated brass hardware and honed quartzite counter',
    width: 2000,
    height: 1333,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Kitchen millwork detail with brass hardware',
    objectPosition: '50% 50%',
  },

  // Scene 7: Closing
  M4: {
    id: 'M4',
    file: 'stock/M4.jpg',
    src: resolve('images/stock/M4.jpg'),
    alt: 'Honed rectangular beige travertine wall blocks with soft porous mineral grain',
    width: 2000,
    height: 1333,
    status: 'illustrative',
    label: 'Illustrative image',
    description: 'Honed beige travertine wall blocks',
    objectPosition: '50% 50%',
  },
};

export const getAboutImage = (id: string): AboutImageEntry => {
  const entry = ABOUT_IMAGES[id];
  if (!entry) {
    console.warn(`[aboutImages] Unknown image ID requested: "${id}". Falling back to E1.`);
    return ABOUT_IMAGES.E1;
  }
  return entry;
};
