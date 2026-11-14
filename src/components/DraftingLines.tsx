import { forwardRef, type ReactNode } from 'react';

export type Drawing = 'kitchen-elevation' | 'plan' | 'bath-elevation' | 'addition-section' | 'site';

/**
 * Hand-authored, architect-style line work. Abstract diagrams — not plans of real houses.
 * Every stroke carries data-draw so drawLines() can animate stroke-dashoffset.
 * Colour comes from currentColor (taupe on linen, linen on forest).
 */
export const DraftingLines = forwardRef<
  SVGSVGElement,
  {
    drawing: Drawing;
    className?: string;
    autoDraw?: boolean;
    strokeWidth?: number;
    preserve?: string;
    door?: boolean;
  }
>(function DraftingLines({ drawing, className = '', autoDraw, strokeWidth = 1, preserve, door }, ref) {
  const d = drawings[drawing];
  return (
    <svg
      ref={ref}
      className={`drafting ${className}`}
      viewBox={d.viewBox}
      preserveAspectRatio={preserve ?? 'xMidYMid meet'}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
      focusable="false"
      data-autodraw={autoDraw ? '' : undefined}
      data-drawing={drawing}
    >
      {d.render({ door })}
    </svg>
  );
});

/* ---------- helpers ---------- */
const P = ({ d, w, cls, dash }: { d: string; w?: number; cls?: string; dash?: string }) => (
  <path d={d} data-draw="" className={cls} strokeWidth={w} vectorEffect="non-scaling-stroke" strokeDasharray={dash} />
);

function Dim({ x1, y1, x2, y2, label, t = 10, cls = 'dl-dim' }: { x1: number; y1: number; x2: number; y2: number; label?: string; t?: number; cls?: string }) {
  const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const tick = (x: number, y: number) =>
    horizontal ? `M${x - t * 0.6},${y + t * 0.6} L${x + t * 0.6},${y - t * 0.6} M${x},${y - t} L${x},${y + t}` : `M${x - t * 0.6},${y + t * 0.6} L${x + t * 0.6},${y - t * 0.6} M${x - t},${y} L${x + t},${y}`;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g className={cls}>
      <P d={`M${x1},${y1} L${x2},${y2}`} />
      <P d={tick(x1, y1)} />
      <P d={tick(x2, y2)} />
      {label && (
        <text
          className="dl-text"
          x={horizontal ? mx : mx - 14}
          y={horizontal ? my - 10 : my}
          fill="currentColor"
          stroke="none"
          fontSize={horizontal ? 14 : 14}
          letterSpacing="0.14em"
          textAnchor="middle"
          transform={horizontal ? undefined : `rotate(-90 ${mx - 14} ${my})`}
          fontFamily="DM Sans, sans-serif"
        >
          {label}
        </text>
      )}
    </g>
  );
}

const Label = ({ x, y, children, size = 15 }: { x: number; y: number; children: ReactNode; size?: number }) => (
  <text className="dl-text" x={x} y={y} fill="currentColor" stroke="none" fontSize={size} letterSpacing="0.2em" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight={500}>
    {children}
  </text>
);

const North = ({ x, y, r = 22 }: { x: number; y: number; r?: number }) => (
  <g className="dl-dim">
    <P d={`M${x},${y - r} A${r},${r} 0 1,1 ${x - 0.01},${y - r}`} />
    <P d={`M${x},${y + r * 0.7} L${x},${y - r * 1.5} M${x - 7},${y - r * 1.5 + 12} L${x},${y - r * 1.5} L${x + 7},${y - r * 1.5 + 12}`} />
    <Label x={x} y={y - r * 1.5 - 8} size={13}>N</Label>
  </g>
);

/** Door: opening in a wall + leaf + swing arc. hinge at (hx,hy), leaf length L, direction angles in degrees. */
function Door({ hx, hy, L, a0, a1, swing = true, leafClass }: { hx: number; hy: number; L: number; a0: number; a1: number; swing?: boolean; leafClass?: string }) {
  const rad = (a: number) => (a * Math.PI) / 180;
  const ex = hx + L * Math.cos(rad(a1));
  const ey = hy + L * Math.sin(rad(a1));
  const sx = hx + L * Math.cos(rad(a0));
  const sy = hy + L * Math.sin(rad(a0));
  const sweep = a1 > a0 ? 1 : 0;
  return (
    <g className="dl-door">
      <path d={`M${hx},${hy} L${ex},${ey}`} data-draw="" className={leafClass} vectorEffect="non-scaling-stroke" />
      {swing && <P d={`M${ex},${ey} A${L},${L} 0 0,${sweep ? 0 : 1} ${sx},${sy}`} dash="4 5" />}
    </g>
  );
}

/** Window in a wall: two parallel lines (double line) between two points. */
function Win({ x1, y1, x2, y2, off = 6 }: { x1: number; y1: number; x2: number; y2: number; off?: number }) {
  const horizontal = y1 === y2;
  return horizontal ? (
    <P d={`M${x1},${y1 - off} L${x2},${y2 - off} M${x1},${y1 + off} L${x2},${y2 + off} M${x1},${y1 - off} L${x1},${y1 + off} M${x2},${y2 - off} L${x2},${y2 + off}`} />
  ) : (
    <P d={`M${x1 - off},${y1} L${x2 - off},${y2} M${x1 + off},${y1} L${x2 + off},${y2} M${x1 - off},${y1} L${x1 + off},${y1} M${x2 - off},${y2} L${x2 + off},${y2}`} />
  );
}

/* ---------- Plan geometry (shared with The Plan Room, in viewBox units 0 0 1000 700) ---------- */
export const PLAN_VIEWBOX = { w: 1000, h: 700 };
export const planRooms = [
  { id: 'kitchens', label: 'KITCHEN', x: 60, y: 60, w: 420, h: 300, door: { x: 360, y: 360 } },
  { id: 'bathrooms', label: 'BATH', x: 480, y: 60, w: 240, h: 300, door: { x: 560, y: 360 } },
  { id: 'whole-home', label: 'LIVING', x: 60, y: 360, w: 660, h: 280, door: { x: 720, y: 520 } },
  { id: 'additions-custom-homes', label: 'NEW WING', x: 720, y: 60, w: 220, h: 580, door: { x: 720, y: 470 } },
] as const;

/* ---------- drawings ---------- */
const drawings: Record<Drawing, { viewBox: string; render: (o: { door?: boolean }) => JSX.Element }> = {
  // Matches image 01's composition (viewBox = native image size): three pendants, island across the
  // lower third, upper cabinets left and right, window on the left.
  'kitchen-elevation': {
    viewBox: '0 0 1672 941',
    render: () => (
      <>
        <g className="dl-walls">
          <P d="M0,86 L1672,86" />
          <P d="M112,86 L112,900" />
          <P d="M0,900 L1672,900" />
          <P d="M1560,86 L1672,40" />
        </g>
        <g className="dl-window">
          <P d="M10,140 L100,140 L100,650 L10,650 Z" />
          <P d="M18,148 L92,148 L92,642 L18,642 Z" />
          <P d="M55,148 L55,642" />
        </g>
        <g className="dl-cabinets">
          <P d="M135,140 L215,140 L215,470 L135,470 Z" />
          <P d="M220,140 L380,140 L380,470 L220,470 Z M300,140 L300,470" />
          <P d="M415,152 L690,152 L690,365 L415,365 Z M530,152 L530,365 M610,152 L610,365" />
          <P d="M680,140 L1010,140 L1010,272 L680,272 Z M700,272 L990,272" />
          <P d="M1005,152 L1270,152 L1270,365 L1005,365 Z M1090,152 L1090,365 M1175,152 L1175,365" />
          <P d="M1270,248 L1672,232 M1270,352 L1672,345" />
          <P d="M420,462 L1672,462" />
          <P d="M846,325 L846,470 M820,325 L890,325" />
        </g>
        <g className="dl-island">
          <P d="M160,488 L1622,488 L1622,558 L160,558 Z" />
          <P d="M172,558 L172,898 L1560,898 L1560,558" />
          <P d="M520,558 L520,898 M860,558 L860,898 M1200,558 L1200,898" />
        </g>
        <g className="dl-stools">
          {[
            [210, 495],
            [552, 800],
            [920, 1192],
            [1285, 1632],
          ].map(([a, b], i) => (
            <g key={i}>
              <P d={`M${a},610 L${a},560 Q${a},545 ${a + 15},545 L${b - 15},545 Q${b},545 ${b},560 L${b},610 Z`} />
              <P d={`M${a + 25},640 L${b - 10},640 L${b - 10},718 L${a + 25},718 Z`} />
              <P d={`M${a + 22},610 L${a + 22},935 M${b - 22},640 L${b - 22},935`} />
            </g>
          ))}
        </g>
        <g className="dl-pendants">
          {[490, 848, 1200].map((x) => (
            <g key={x}>
              <P d={`M${x},0 L${x},40`} />
              <P d={`M${x},40 L${x - 84},170 M${x},40 L${x + 84},170 M${x - 46},100 L${x + 46},100`} />
              <P d={`M${x - 86},176 Q${x},212 ${x + 86},176 Q${x},150 ${x - 86},176 Z`} />
            </g>
          ))}
        </g>
        <g className="dl-dims">
          <Dim x1={160} y1={922} x2={1622} y2={922} label="ISLAND" />
          <Dim x1={1650} y1={488} x2={1650} y2={898} />
          <Dim x1={415} y1={118} x2={690} y2={118} />
        </g>
      </>
    ),
  },

  plan: {
    viewBox: '0 0 1000 700',
    render: ({ door }) => (
      <>
        <g className="dl-walls">
          {/* outer walls of the existing house */}
          <P d="M60,60 L720,60 L720,640 L60,640 Z" w={2} />
          {/* interior partitions with door openings */}
          <P d="M60,360 L330,360 M390,360 L540,360 M600,360 L720,360" w={2} />
          <P d="M480,60 L480,360" w={2} />
          {/* new wing (dashed: proposed) */}
          <P d="M720,60 L940,60 L940,640 L720,640" w={2} dash="10 7" />
        </g>
        <g className="dl-openings">
          <Door hx={330} hy={360} L={60} a0={0} a1={-90} />
          <Door hx={540} hy={360} L={60} a0={0} a1={-90} leafClass={door ? 'door-leaf' : undefined} />
          <Door hx={720} hy={440} L={60} a0={90} a1={180} />
          <Door hx={160} hy={640} L={70} a0={0} a1={-90} />
          <Win x1={130} y1={60} x2={300} y2={60} />
          <Win x1={560} y1={60} x2={660} y2={60} />
          <Win x1={60} y1={440} x2={60} y2={580} />
          <Win x1={400} y1={640} x2={620} y2={640} />
          <Win x1={940} y1={200} x2={940} y2={420} />
        </g>
        <g className="dl-fixtures">
          <P d="M80,80 L80,200 L440,80" dash="2 6" />
          <P d="M180,230 L380,230 L380,290 L180,290 Z" />
          <P d="M500,80 L560,80 L560,160 L500,160 Z M640,300 L700,300 L700,340 L640,340 Z" />
          <P d="M140,470 L300,470 L300,540 L140,540 Z" />
        </g>
        <g className="dl-dims">
          <Dim x1={60} y1={30} x2={720} y2={30} />
          <Dim x1={720} y1={30} x2={940} y2={30} />
          <Dim x1={975} y1={60} x2={975} y2={640} />
          <North x={900} y={690 - 30} r={16} />
        </g>
        <g className="dl-labels">
          {planRooms.map((r) => (
            <Label key={r.id} x={r.x + r.w / 2} y={r.y + r.h / 2 + 5}>
              {r.label}
            </Label>
          ))}
        </g>
      </>
    ),
  },

  'bath-elevation': {
    viewBox: '0 0 1000 700',
    render: () => (
      <>
        <g className="dl-walls">
          <P d="M40,60 L960,60 M40,640 L960,640 M40,60 L40,640 M960,60 L960,640" />
        </g>
        <g className="dl-tile">
          {Array.from({ length: 9 }).map((_, i) => (
            <P key={`h${i}`} d={`M600,${100 + i * 60} L940,${100 + i * 60}`} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <P key={`v${i}`} d={`M${620 + i * 60},100 L${620 + i * 60},620`} />
          ))}
        </g>
        <g className="dl-glass">
          <P d="M600,90 L600,640" />
          <P d="M608,140 L608,640" dash="3 8" />
          <P d="M800,110 Q820,105 840,110 M820,108 L820,150" />
          <P d="M780,160 L860,160" dash="2 6" />
        </g>
        <g className="dl-vanity">
          <P d="M120,140 L440,140 L440,330 L120,330 Z" />
          <P d="M140,160 L420,160 L420,310 L140,310 Z" />
          <P d="M100,400 L460,400 L460,424 L100,424 Z" />
          <P d="M120,424 L440,424 L440,600 L120,600 Z M280,424 L280,600" />
          <P d="M200,500 L230,500 M330,500 L360,500" />
          <P d="M280,400 L280,360 Q280,345 300,345 L310,345" />
          <P d="M80,120 L80,190 M480,120 L480,190" />
        </g>
        <g className="dl-dims">
          <Dim x1={100} y1={665} x2={460} y2={665} label="VANITY" />
          <Dim x1={20} y1={140} x2={20} y2={330} />
        </g>
      </>
    ),
  },

  'addition-section': {
    viewBox: '0 0 1000 600',
    render: () => (
      <>
        <g className="dl-ground">
          <P d="M0,520 L1000,520" />
          <P d="M0,540 L1000,540" dash="3 9" />
        </g>
        <g className="dl-existing">
          <P d="M80,520 L80,260 L280,120 L480,260 L480,520" />
          <P d="M60,274 L280,108 L500,274" />
          <P d="M80,370 L480,370" />
          <P d="M150,300 L230,300 L230,350 L150,350 Z M330,300 L410,300 L410,350 L330,350 Z" />
          <P d="M150,420 L230,420 L230,520 M330,420 L410,420 L410,480 L330,480 Z" />
        </g>
        <g className="dl-newwing">
          <P d="M480,300 L880,250 L880,520" w={1.5} />
          <P d="M470,290 L900,236" w={1.5} />
          <P d="M480,400 L880,400" dash="8 6" />
          <P d="M560,320 L800,290 L800,380 L560,380 Z" />
          <P d="M560,440 L700,440 L700,520" />
        </g>
        <g className="dl-dims">
          <Dim x1={480} y1={570} x2={880} y2={570} label="NEW" />
          <Dim x1={80} y1={570} x2={480} y2={570} label="EXISTING" />
          <Dim x1={930} y1={250} x2={930} y2={520} />
        </g>
      </>
    ),
  },

  site: {
    viewBox: '0 0 1000 700',
    render: () => (
      <>
        <g className="dl-boundary">
          <P d="M90,110 L880,70 L930,610 L120,650 Z" dash="14 8" />
        </g>
        <g className="dl-sun">
          <P d="M140,520 Q500,-80 880,520" dash="2 8" />
          {[0.18, 0.5, 0.82].map((t) => {
            const x = (1 - t) * (1 - t) * 140 + 2 * (1 - t) * t * 500 + t * t * 880;
            const y = (1 - t) * (1 - t) * 520 + 2 * (1 - t) * t * -80 + t * t * 520;
            return <P key={t} d={`M${x + 12},${y} A12,12 0 1,1 ${x + 11.99},${y - 0.5}`} />;
          })}
        </g>
        <g className="dl-house">
          <P d="M300,330 L560,330 L560,520 L300,520 Z" w={1.5} />
          <P d="M300,330 L430,250 L560,330" />
          <P d="M420,520 L420,470 L470,470 L470,520" />
        </g>
        <g className="dl-trees">
          {[
            [190, 220, 34],
            [760, 200, 46],
            [810, 470, 30],
            [210, 560, 26],
          ].map(([x, y, r]) => (
            <P key={`${x}-${y}`} d={`M${x + r},${y} A${r},${r} 0 1,1 ${x + r - 0.01},${y - 0.5}`} dash="5 5" />
          ))}
        </g>
        <g className="dl-dims">
          <North x={880} y={640} r={18} />
          <Dim x1={300} y1={560} x2={560} y2={560} />
        </g>
      </>
    ),
  },
};
