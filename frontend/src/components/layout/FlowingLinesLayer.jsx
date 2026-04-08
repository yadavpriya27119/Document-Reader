import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * Organic Bézier ribbons — slow drift + soft violet/indigo/sky palette.
 * SVG viewBox space; groups translate in user units for smooth motion.
 */
const VB = { w: 1600, h: 900 };

/** Example cubic paths: wide strokes read as flowing bands after blur */
const RIBBONS = [
  {
    d: 'M -320 220 C 180 60, 480 400, 820 200 S 1280 80, 1920 260',
    strokeWidth: 2.2,
    drift: { duration: 42, x: [0, 85, -40, 25, 0], y: [0, -28, 18, -8, 0] },
    colors: ['#b8a8f0', '#94a3e8', '#a5c4f5', '#c4b5fd', '#9ca8e8', '#b8a8f0'],
    colorDuration: 32,
    opacity: 0.38,
  },
  {
    d: 'M -280 520 C 360 680, 620 360, 980 500 S 1380 620, 1980 440',
    strokeWidth: 1.9,
    drift: { duration: 36, x: [0, -55, 70, -20, 0], y: [0, 35, -22, 12, 0] },
    colors: ['#a5b4fc', '#c4b5fd', '#93c5fd', '#a78bfa', '#818cf8', '#a5b4fc'],
    colorDuration: 26,
    opacity: 0.34,
  },
  {
    d: 'M 1880 140 C 1320 220, 980 -40, 560 120 S 120 200, -240 80',
    strokeWidth: 1.6,
    drift: { duration: 48, x: [0, -65, 45, -30, 0], y: [0, 20, -35, 15, 0] },
    colors: ['#93c5fd', '#a78bfa', '#c7d2fe', '#a5b4fc', '#93c5fd'],
    colorDuration: 30,
    opacity: 0.3,
  },
  {
    d: 'M 620 -120 C 480 200, 920 340, 640 560 S 200 760, -200 940',
    strokeWidth: 1.7,
    drift: { duration: 40, x: [0, 40, -50, 30, 0], y: [0, 45, -18, -25, 0] },
    colors: ['#c4b5fd', '#93c5fd', '#a78bfa', '#cbd5f5', '#c4b5fd'],
    colorDuration: 34,
    opacity: 0.28,
  },
  {
    d: 'M -200 780 C 380 680, 520 860, 880 720 S 1360 580, 1900 800',
    strokeWidth: 2,
    drift: { duration: 44, x: [0, 70, -55, 20, 0], y: [0, -30, 22, -10, 0] },
    colors: ['#818cf8', '#b8a8f0', '#a5c4f5', '#a5b4fc', '#818cf8'],
    colorDuration: 28,
    opacity: 0.36,
  },
  {
    d: 'M -240 380 C 300 280, 700 520, 1100 360 S 1580 420, 1960 300',
    strokeWidth: 1.4,
    drift: { duration: 50, x: [0, -45, 60, -15, 0], y: [0, 25, -30, 18, 0] },
    colors: ['#a5c4f5', '#c4b5fd', '#94a3e8', '#a5c4f5'],
    colorDuration: 36,
    opacity: 0.22,
  },
];

const easeOrganic = [0.42, 0, 0.58, 1];

function StaticRibbon({ ribbon }) {
  return (
    <path
      d={ribbon.d}
      fill="none"
      stroke="#a5b4fc"
      strokeWidth={ribbon.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={ribbon.opacity * 0.45}
    />
  );
}

function AnimatedRibbon({ ribbon }) {
  return (
    <motion.g
      initial={false}
      animate={{
        x: ribbon.drift.x,
        y: ribbon.drift.y,
      }}
      transition={{
        duration: ribbon.drift.duration,
        repeat: Infinity,
        ease: easeOrganic,
      }}
    >
      <motion.path
        d={ribbon.d}
        fill="none"
        strokeWidth={ribbon.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={ribbon.opacity}
        initial={{ stroke: ribbon.colors[0] }}
        animate={{ stroke: ribbon.colors }}
        transition={{
          duration: ribbon.colorDuration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.g>
  );
}

export function FlowingLinesLayer() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute left-1/2 top-1/2 h-[135%] min-h-[100dvh] w-[135%] min-w-full -translate-x-1/2 -translate-y-1/2"
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <filter
            id="flowing-line-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#flowing-line-glow)">
          {RIBBONS.map((ribbon, i) =>
            reduced ? (
              <StaticRibbon key={i} ribbon={ribbon} />
            ) : (
              <AnimatedRibbon key={i} ribbon={ribbon} />
            )
          )}
        </g>
      </svg>
    </div>
  );
}
