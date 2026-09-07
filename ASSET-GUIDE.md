# Asset Guide

Every image and video the site uses, where it appears, and how to replace it.

> **There is already a set of real, AI-generated photographs and two video clips
> waiting for this project** — they just could not be downloaded in the
> environment the site was built in. Run `npm run assets:fetch` to pull them in
> and replace everything below in one step. See `HIGGSFIELD-PROMPTS.md`.

**All imagery currently in `/public/media` is a generated placeholder.** They are
art-directed panels (warm dark gradient, gold hairline frame, line-art motif) so
the demo reads as designed rather than broken — but they are not photography.
Replace them before showing the site to a real client's customers.

---

## How replacing works

1. Drop the new file into the same path under `/public/media`, keeping the name.
2. Nothing else to change — every path is referenced from `config/siteConfig.ts`.
3. If you want different filenames, edit the paths in `siteConfig.ts` instead.

The placeholders can be regenerated at any time with:

```bash
node scripts/generate-placeholders.mjs
```

---

## Images

| File | Where it appears | Size | Ratio | Format | Notes |
|---|---|---|---|---|---|
| `media/team/barber-1.jpg` | Our team, booking step 2 | 900×1200 | 3:4 | JPG | Portrait, head and shoulders, dark background |
| `media/team/barber-2.jpg` | Our team, booking step 2 | 900×1200 | 3:4 | JPG | Cropped to head-and-shoulders — the wider frame showed another business's logo on the apron |
| `media/team/barber-3.jpg` | Our team, booking step 2 | 900×1200 | 3:4 | JPG | Same: cropped above the apron text and the background signage |
| `media/team/barber-4.jpg` | Our team, booking step 2 | 900×1200 | 3:4 | JPG | |
| `media/gallery/cut-fade.jpg` | Gallery, "Men's Haircut" card | 1200×1500 | 4:5 | JPG | Finished fade from behind |
| `media/gallery/beard-line.jpg` | Gallery, "Haircut & Beard" card | 1200×1500 | 4:5 | JPG | Beard line-up detail |
| `media/gallery/shop-interior.jpg` | Gallery (wide tile), "Kids' Haircut" card | 1800×1150 | ~16:10 | JPG | Wide room shot |
| `media/gallery/leather-chair.jpg` | Gallery, "Groom's Package" card | 1200×1500 | 4:5 | JPG | Chair detail |
| `media/gallery/tools-flatlay.jpg` | Gallery, "Beard Design" card | 1200×1500 | 4:5 | JPG | Tools on marble |
| `media/gallery/hot-towel.jpg` | Gallery, "Grooming & Facial" card | 1200×1500 | 4:5 | JPG | Hot towel / steam |
| `media/gallery/at-work.jpg` | Gallery (wide tile) | 1800×1150 | ~16:10 | JPG | Barber working, from behind |
| `media/brand/og-image.jpg` | Open Graph / social sharing | 1200×630 | 1.91:1 | JPG | Keep text away from the edges |
| `favicon.svg` | Browser tab | 64×64 | 1:1 | SVG | Simple barber-pole mark |

Gallery tiles are rendered inside a fixed-height grid with `object-cover`, so a
slightly different ratio will still crop cleanly. Keep all gallery images at a
consistent brightness or the grid looks patchy.

---

## The opening screen's film

The barber pole on the intro is a video, not a drawing. Two cuts of the same
shot are used so neither orientation is stretched or cropped — only one is ever
downloaded, chosen from the viewport.

| File | Used on | Ratio |
|---|---|---|
| `media/video/intro-pole-portrait.mp4` / `.webm` | phones | 9:16 |
| `media/video/intro-pole-landscape.mp4` / `.webm` | tablets and desktop | 16:9 |
| `media/video/intro-pole-poster.jpg` | poster, and the fallback if neither decodes | matches the cut |

Prepare each with `npm run media:optimise -- <input> intro-pole-portrait` (and
again for `intro-pole-landscape`).

Two values in `components/intro/intro.css` are calibrated to how the pole is
framed in the film, and are the only things to touch if a future film frames it
differently:

- **`--cutout`** on `.intro-wordmark` — half the gap burned through the MODA
  wordmark so the pole appears to stand in front of the letters. Set it to
  `(pole width on screen ÷ 2) ÷ wordmark width × 100`. Currently 8.5% on
  desktop and 10.5% on phones.
- **`--caption-shift`** on `.intro-root` — how far below centre the gold rule,
  subtitle and ENTER sit. It must clear the base of the pole.
- **`INTRO_SETTLE_SECONDS`** in `components/intro/IntroScreen.tsx` — the moment
  the camera stops moving and the pole is centred front-on. Nothing is written
  over the film before then. Read it off the clip (scrub to where the move
  lands) rather than estimating; every other cue is offset from it.

The film's camera move is deliberate and the type depends on it: it opens in
extreme macro on the chrome crown from a high angle, orbits around it, then
descends and dollies out to a locked-off symmetrical front view. If a
replacement clip does not end locked off and centred, the wordmark will sit
over a moving frame.

`intro.video.background` in `siteConfig` must be sampled from the film's own
backdrop. The video is letterboxed with `object-fit: contain` against that
colour, so a mismatch shows as a visible band.

## Video

| File | Where it appears | Length | Ratio | Format |
|---|---|---|---|---|
| `media/video/hero-barbershop.mp4` | Homepage hero background | 8–12s, seamless loop | 16:9 | MP4 (H.264) + optional WebM |
| `media/video/experience-tools.mp4` | "The MODA experience" band | 6–10s, seamless loop | 16:9 | MP4 (H.264) |
| `media/video/hero-barbershop-poster.jpg` | Hero poster / fallback | — | 16:9 (1920×1080) | JPG |
| `media/video/experience-tools-poster.jpg` | Experience poster / fallback | — | 16:9 (1920×1080) | JPG |

**The two mp4 files are not in the repository yet.** `siteConfig.media.*.src` is
set to `""`, which makes `BackgroundMedia` show the poster on its own with a
slow drift — so nothing 404s and there is no empty player. To switch the videos
on:

```ts
// config/siteConfig.ts
media: {
  heroVideo: {
    src: "/media/video/hero-barbershop.mp4",
    poster: "/media/video/hero-barbershop-poster.jpg",
  },
  ...
}
```

Prompts for generating both clips are in `HIGGSFIELD-PROMPTS.md`.

### Adding or replacing a video

One command does the whole job — compressed MP4, smaller WebM, and a poster cut
from the first frame so there is no jump when playback starts:

```bash
npm run media:optimise -- ~/Downloads/raw-clip.mp4 hero-barbershop
```

It writes `hero-barbershop.mp4`, `hero-barbershop.webm` and
`hero-barbershop-poster.jpg`, which is exactly what `siteConfig.media` points
at. The originals here were 10–12 MB each; after this they are **under 1 MB**,
with the whole `/public/media` folder at ~3.5 MB.

Both formats are offered to the browser: WebM (VP9) is smaller and wins where
supported, MP4 (H.264) covers everything else. Audio is stripped — these are
muted backgrounds. If a clip cannot be decoded at all, the poster stays on
screen and the page is none the wiser.

---

## The opening screen has no image assets

The barber pole is built entirely from CSS (`components/intro/barber-pole.css`)
— layered gradients for the chrome, a repeating diagonal gradient for the moving
helix. There is no 3D model, no WebGL context and no image to download, so the
intro costs nothing on first load and looks identical on every device.

Its colours come from `siteConfig.brand.colors` (`poleBlue`, `poleRed`,
`poleWhite`, `introBackground`).

---

## Licensing

- The placeholders in this repo were generated by the script in `scripts/` and
  carry no third-party rights.
- The AI-generated photography listed in `HIGGSFIELD-PROMPTS.md` was produced in
  this project's Higgsfield account; check your plan's commercial-use terms
  before using it for a paying client, and never ship an asset with a visible
  watermark.
- Do not substitute watermarked stock or images scraped from another
  barbershop's website. For a real client, a two-hour photo shoot of their
  actual shop will outperform any of this.
