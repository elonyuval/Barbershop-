/**
 * Generates the placeholder imagery in /public/media.
 *
 * These are deliberately art-directed panels — warm dark gradients, a gold
 * hairline frame and a line-art motif — rather than grey "image missing"
 * boxes, so the demo reads as designed while the real photography is missing.
 *
 * Run with:  node scripts/generate-placeholders.mjs
 * Replace the output files with real photography before a client goes live
 * (see ASSET-GUIDE.md).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");

// Warm, mid-dark grounds. Dark enough to sit in the site's palette, light
// enough to read as a photographed room rather than a missing image.
const PALETTES = {
  ink: ["#332c28", "#141110"],
  walnut: ["#443122", "#1a120c"],
  espresso: ["#3b2b21", "#17100c"],
  slate: ["#322e2c", "#151313"],
  cocoa: ["#4a331f", "#1d140d"],
};

const GOLD = "#c8a24a";

/** Line-art motifs, drawn on a 200×200 viewBox. */
const MOTIFS = {
  scissors: `
    <circle cx="58" cy="150" r="20"/><circle cx="142" cy="150" r="20"/>
    <path d="M68 134 L145 42"/><path d="M132 134 L55 42"/>
    <circle cx="100" cy="92" r="5"/>`,
  razor: `
    <path d="M36 150 L120 66 L152 66 L152 84 L52 166 Z"/>
    <path d="M36 150 L24 162 L34 172 L46 160"/>
    <path d="M120 66 L152 66"/>`,
  comb: `
    <rect x="34" y="70" width="132" height="26" rx="6"/>
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${42 + i * 10} 96 L${42 + i * 10} 138"/>`).join("")}`,
  chair: `
    <path d="M56 62 h88 v58 h-88 z" />
    <path d="M50 120 h100 v16 h-100 z" />
    <path d="M100 136 v28" /><path d="M64 164 h72" />
    <path d="M46 84 h10" /><path d="M144 84 h10" />`,
  pole: `
    <rect x="78" y="46" width="44" height="108" rx="6"/>
    <rect x="68" y="30" width="64" height="16" rx="5"/>
    <rect x="68" y="154" width="64" height="16" rx="5"/>
    <path d="M78 130 L122 86"/><path d="M78 106 L122 62"/><path d="M78 154 L122 110"/>`,
  towel: `
    <rect x="42" y="104" width="116" height="46" rx="10"/>
    <path d="M42 126 h116"/>
    <path d="M78 84 c0 -14 12 -14 12 -28"/>
    <path d="M100 78 c0 -16 12 -16 12 -30"/>
    <path d="M122 84 c0 -14 12 -14 12 -28"/>`,
  bust: `
    <circle cx="100" cy="76" r="30"/>
    <path d="M46 168 c0 -34 24 -54 54 -54 s54 20 54 54"/>
    <path d="M74 62 c8 -14 44 -14 52 0"/>`,
  bottle: `
    <path d="M84 40 h32 v22 c0 8 18 18 18 34 v58 c0 8 -6 14 -14 14 h-40 c-8 0 -14 -6 -14 -14 v-58 c0 -16 18 -26 18 -34 z"/>
    <path d="M70 110 h60"/>`,
};

/** A little noise, so large flat panels do not band on wide screens. */
async function noiseLayer(width, height) {
  const channels = 3;
  const buffer = Buffer.allocUnsafe(width * height * channels);
  for (let index = 0; index < buffer.length; index += 1) {
    buffer[index] = 110 + Math.floor(Math.random() * 36);
  }
  return sharp(buffer, { raw: { width, height, channels } }).png().toBuffer();
}

function panelSVG({ width, height, palette, motif, label, motifShift = 0 }) {
  const [top, bottom] = PALETTES[palette];
  const short = Math.min(width, height);
  const motifSize = Math.round(short * 0.34);
  const motifX = (width - motifSize) / 2 + width * motifShift;
  const motifY = (height - motifSize) / 2 - short * 0.03;
  const inset = Math.round(short * 0.045);

  // A few out-of-focus warm highlights, the way a lit room photographs.
  const bokeh = [
    [0.16, 0.2, 0.1, 0.24],
    [0.78, 0.14, 0.07, 0.2],
    [0.88, 0.62, 0.12, 0.14],
    [0.3, 0.84, 0.09, 0.12],
  ]
    .map(
      ([cx, cy, r, opacity]) =>
        `<circle cx="${width * cx}" cy="${height * cy}" r="${short * r}" fill="#f4c785" fill-opacity="${opacity}" filter="url(#soft)"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${top}"/>
      <stop offset="100%" stop-color="${bottom}"/>
    </linearGradient>
    <radialGradient id="key" cx="0.34" cy="0.2" r="0.9">
      <stop offset="0%" stop-color="#ffcf8a" stop-opacity="0.38"/>
      <stop offset="45%" stop-color="#f0c274" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.48" r="0.8">
      <stop offset="52%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.46"/>
    </radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${Math.round(short * 0.05)}"/>
    </filter>
    <pattern id="weave" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <path d="M0 0 L0 14" stroke="#ffffff" stroke-opacity="0.022" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#base)"/>
  <rect width="${width}" height="${height}" fill="url(#weave)"/>
  ${bokeh}
  <rect width="${width}" height="${height}" fill="url(#key)"/>
  <rect width="${width}" height="${height}" fill="url(#vignette)"/>

  <rect x="${inset}" y="${inset}" width="${width - inset * 2}" height="${height - inset * 2}"
        fill="none" stroke="${GOLD}" stroke-opacity="0.26" stroke-width="1"/>

  <g transform="translate(${motifX} ${motifY}) scale(${motifSize / 200})"
     fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="3.2"
     stroke-linecap="round" stroke-linejoin="round">
    ${MOTIFS[motif]}
  </g>

  ${
    label
      ? `<text x="${width / 2}" y="${height - inset - short * 0.035}" text-anchor="middle"
             font-family="Georgia, serif" font-size="${Math.round(short * 0.032)}"
             letter-spacing="${short * 0.012}" fill="${GOLD}" fill-opacity="0.5">${label}</text>`
      : ""
  }
</svg>`;
}

async function panel(target, options) {
  const filePath = path.join(ROOT, target);
  await mkdir(path.dirname(filePath), { recursive: true });

  const base = sharp(Buffer.from(panelSVG(options)));
  const noise = await noiseLayer(options.width, options.height);

  await base
    .composite([{ input: noise, blend: "overlay", opacity: 0.06 }])
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(filePath);

  console.log("wrote", target);
}

const TASKS = [
  // Team — 3:4 portraits
  ["media/team/barber-1.jpg", { width: 900, height: 1200, palette: "walnut", motif: "bust" }],
  ["media/team/barber-2.jpg", { width: 900, height: 1200, palette: "espresso", motif: "bust" }],
  ["media/team/barber-3.jpg", { width: 900, height: 1200, palette: "cocoa", motif: "bust" }],
  ["media/team/barber-4.jpg", { width: 900, height: 1200, palette: "ink", motif: "bust" }],

  // Gallery — 4:5 portraits, two wide tiles
  ["media/gallery/cut-fade.jpg", { width: 1200, height: 1500, palette: "ink", motif: "scissors" }],
  ["media/gallery/beard-line.jpg", { width: 1200, height: 1500, palette: "walnut", motif: "razor" }],
  ["media/gallery/shop-interior.jpg", { width: 1800, height: 1150, palette: "cocoa", motif: "chair" }],
  ["media/gallery/leather-chair.jpg", { width: 1200, height: 1500, palette: "espresso", motif: "chair" }],
  ["media/gallery/tools-flatlay.jpg", { width: 1200, height: 1500, palette: "slate", motif: "comb" }],
  ["media/gallery/hot-towel.jpg", { width: 1200, height: 1500, palette: "walnut", motif: "towel" }],
  ["media/gallery/at-work.jpg", { width: 1800, height: 1150, palette: "ink", motif: "pole" }],

  // Video posters — these also stand in for the videos themselves until the
  // mp4 files are dropped in (see ASSET-GUIDE.md).
  ["media/video/hero-barbershop-poster.jpg", { width: 1920, height: 1080, palette: "walnut", motif: "chair", motifShift: 0.22 }],
  ["media/video/experience-tools-poster.jpg", { width: 1920, height: 1080, palette: "espresso", motif: "bottle", motifShift: 0.24 }],

  // Social card
  ["media/brand/og-image.jpg", { width: 1200, height: 630, palette: "ink", motif: "pole", label: "MODA BARBER CLUB" }],
];

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0c0a09"/>
  <rect x="24" y="12" width="16" height="40" rx="4" fill="#f1e9dc"/>
  <path d="M24 44 L40 28 M24 34 L40 18 M24 52 L40 36" stroke="#14367e" stroke-width="4"/>
  <path d="M24 49 L40 33 M24 39 L40 23" stroke="#cc2027" stroke-width="4"/>
  <rect x="20" y="8" width="24" height="7" rx="3" fill="#c8a24a"/>
  <rect x="20" y="49" width="24" height="7" rx="3" fill="#c8a24a"/>
</svg>`;

await Promise.all(TASKS.map(([target, options]) => panel(target, options)));
await writeFile(path.join(ROOT, "favicon.svg"), FAVICON, "utf8");
console.log("wrote favicon.svg");
