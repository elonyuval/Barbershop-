/**
 * Prepares a raw video for the web.
 *
 * Drop a clip anywhere and point this at it; it produces the three files the
 * site expects — a compressed MP4 (H.264, universal), a smaller WebM (VP9,
 * preferred where supported), and a poster taken from the first frame so there
 * is no visible jump when playback starts.
 *
 *   node scripts/optimise-media.mjs <input.mp4> <name>
 *   node scripts/optimise-media.mjs ~/Downloads/raw.mp4 hero-barbershop
 *
 * Writes public/media/video/<name>.{mp4,webm} and <name>-poster.jpg, which is
 * exactly what config/siteConfig.ts references.
 */
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const [input, name] = process.argv.slice(2);
if (!input || !name) {
  console.error("usage: node scripts/optimise-media.mjs <input> <name>");
  process.exit(1);
}

const dir = path.join(process.cwd(), "public", "media", "video");
await mkdir(dir, { recursive: true });

const run = (args) => execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args]);
const scale = "scale='min(1600,iw)':-2:flags=lanczos,fps=25";

console.log("encoding MP4…");
run(["-i", input, "-vf", scale,
  "-c:v", "libx264", "-profile:v", "high", "-crf", "27", "-preset", "slow",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  // Background video is always muted, so the audio track is dead weight.
  "-an", path.join(dir, `${name}.mp4`)]);

console.log("encoding WebM…");
run(["-i", input, "-vf", scale,
  "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-cpu-used", "4",
  "-an", path.join(dir, `${name}.webm`)]);

console.log("extracting poster…");
const frame = path.join("/tmp", `${name}-frame.jpg`);
run(["-i", path.join(dir, `${name}.mp4`), "-frames:v", "1", "-q:v", "3", frame]);
await sharp(frame)
  .resize(1920, 1080, { fit: "cover" })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile(path.join(dir, `${name}-poster.jpg`));

console.log(`\ndone → public/media/video/${name}.{mp4,webm} + ${name}-poster.jpg`);
