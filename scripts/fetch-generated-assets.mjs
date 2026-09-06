/**
 * Downloads the Higgsfield-generated photography and video into /public/media,
 * replacing the placeholder panels, and switches the two videos on in
 * siteConfig.
 *
 *   npm run assets:fetch
 *
 * Why this is a script rather than committed files: the assets were generated
 * successfully, but the environment this project was built in blocks the
 * Higgsfield CDN, so they could not be pulled into the repository there. Run
 * this from a machine with normal internet access.
 *
 * The source images are 2K PNGs; they are re-encoded to progressive JPEG here,
 * which is what the site actually wants (a 2K PNG is several megabytes).
 *
 * Prompts and settings for regenerating any of these: HIGGSFIELD-PROMPTS.md
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3FuviCYWqa9sP5QGaD6BV5NHRem";
const PUBLIC = path.join(process.cwd(), "public");

/** [source file on the CDN, destination under /public, longest edge in px] */
const IMAGES = [
  ["hf_20260906_122818_adced4fb-027e-4ccc-bf0c-75b03bdf1f47.png", "media/team/barber-1.jpg", 1200],
  ["hf_20260906_122818_f4466511-00aa-4f69-8b02-8996dc93d2c0.png", "media/team/barber-2.jpg", 1200],
  ["hf_20260906_122818_ecdf2a97-43cc-462d-93f0-b177d6e3cbab.png", "media/team/barber-3.jpg", 1200],
  ["hf_20260906_122818_f2c84c5f-9f47-441b-9c1d-e01764aa737e.png", "media/team/barber-4.jpg", 1200],
  ["hf_20260906_122818_97650067-076e-46a4-ac49-96d3e2b7e28a.png", "media/gallery/cut-fade.jpg", 1600],
  ["hf_20260906_122818_707fb37b-f10c-4939-a0d2-1f19752094f5.png", "media/gallery/beard-line.jpg", 1600],
  ["hf_20260906_122818_89818771-9377-4305-8643-0e29ff326117.png", "media/gallery/shop-interior.jpg", 1600],
  ["hf_20260906_122818_4252897b-744e-4e7a-8150-ba5a285140ed.png", "media/gallery/leather-chair.jpg", 1600],
  ["hf_20260906_122818_3fb934d7-daca-477a-bf49-4dd4b4c9dc06.png", "media/gallery/tools-flatlay.jpg", 1600],
  ["hf_20260906_122818_b1860b37-ad9d-4911-8095-337eda05ba1a.png", "media/gallery/hot-towel.jpg", 1600],
  ["hf_20260906_123618_3c810ec1-0018-4228-980c-0272963572bc.png", "media/gallery/at-work.jpg", 1600],
  ["hf_20260906_122818_96e21809-e679-4f25-8213-06c62fc75d1f.png", "media/video/hero-barbershop-poster.jpg", 1920],
];

/** The tools still life doubles as the poster for the experience clip. */
const POSTER_FROM_IMAGE = [
  ["hf_20260906_122818_3fb934d7-daca-477a-bf49-4dd4b4c9dc06.png", "media/video/experience-tools-poster.jpg"],
];

const VIDEOS = [
  ["hf_20260906_122737_35f35ff7-f73c-4e4a-bad9-18c7ccc4371f.mp4", "media/video/hero-barbershop.mp4"],
  ["hf_20260906_122728_4588f6bf-ad40-45b1-8c30-e69a9d059fe7.mp4", "media/video/experience-tools.mp4"],
];

async function download(name) {
  const response = await fetch(`${CDN}/${name}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function write(target, buffer) {
  const file = path.join(PUBLIC, target);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buffer);
  console.log(`  ✓ ${target} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

/** Switches the hero and experience videos on once their files exist. */
async function enableVideos() {
  const file = path.join(process.cwd(), "config", "siteConfig.ts");
  let source = await readFile(file, "utf8");

  const before = source;
  source = source
    .replace(
      /heroVideo: \{\s*src: "",/,
      'heroVideo: {\n      src: "/media/video/hero-barbershop.mp4",',
    )
    .replace(
      /experienceVideo: \{\s*src: "",/,
      'experienceVideo: {\n      src: "/media/video/experience-tools.mp4",',
    );

  if (source === before) {
    console.log("\nVideos were already switched on in config/siteConfig.ts.");
    return;
  }

  await writeFile(file, source, "utf8");
  console.log("\nSwitched both videos on in config/siteConfig.ts.");
}

let failures = 0;

console.log("Images");
for (const [source, target, longestEdge] of IMAGES) {
  try {
    const raw = await download(source);
    const jpeg = await sharp(raw)
      .resize({ width: longestEdge, height: longestEdge, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();
    await write(target, jpeg);
  } catch (error) {
    failures += 1;
    console.log(`  ✗ ${target} — ${error.message}`);
  }
}

console.log("\nPosters");
for (const [source, target] of POSTER_FROM_IMAGE) {
  try {
    const raw = await download(source);
    const jpeg = await sharp(raw)
      .resize(1920, 1080, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();
    await write(target, jpeg);
  } catch (error) {
    failures += 1;
    console.log(`  ✗ ${target} — ${error.message}`);
  }
}

console.log("\nVideo");
for (const [source, target] of VIDEOS) {
  try {
    await write(target, await download(source));
  } catch (error) {
    failures += 1;
    console.log(`  ✗ ${target} — ${error.message}`);
  }
}

if (failures === 0) {
  await enableVideos();
  console.log("\nDone. Now run:  npm run build:pages");
} else {
  console.log(
    `\n${failures} asset(s) failed. The CDN links are time-limited — if they have expired,\n` +
      "download the files from your Higgsfield library and drop them into the paths\n" +
      "listed in ASSET-GUIDE.md, then set the two video `src` values in config/siteConfig.ts.",
  );
  process.exitCode = 1;
}
