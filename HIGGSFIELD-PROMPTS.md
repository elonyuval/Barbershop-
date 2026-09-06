# Higgsfield prompts

Every prompt used (or prepared) for this project's media, with the exact model
settings, so any of it can be regenerated or re-rendered at a different size.

## Status of the generated assets

All of the assets below **were generated successfully** in the project's
Higgsfield account (free "starter" plan, ~46 credits spent, no purchases and no
plan upgrade). They could **not be downloaded into this repository**: the
session's network policy blocks the Higgsfield CDN host
`d8j0ntlcm91z4.cloudfront.net`, so the files are in the Higgsfield library but
not on disk here. The site therefore ships with generated placeholder panels
(see `ASSET-GUIDE.md`).

**To pull them in, run this from a machine with normal internet access:**

```bash
npm install
npm run assets:fetch     # downloads all 14, re-encodes the images, switches the videos on
npm run build:pages      # rebuild the published site
git add -A && git commit -m "Use the generated photography" && git push
```

`scripts/fetch-generated-assets.mjs` holds the CDN links and the destination for
each file. It converts the 2K PNGs to progressive JPEG (a 2K PNG is several
megabytes), copies the two mp4s in, and sets the video `src` values in
`config/siteConfig.ts`. The links are time-limited — if any have expired the
script says so, and you can download those items from the Higgsfield library by
hand into the paths in the table below.

| # | Asset | Save to |
|---|---|---|
| 1 | Hero video | `public/media/video/hero-barbershop.mp4` |
| 2 | Experience video | `public/media/video/experience-tools.mp4` |
| 3 | Barber portrait 1 | `public/media/team/barber-1.jpg` |
| 4 | Barber portrait 2 | `public/media/team/barber-2.jpg` |
| 5 | Barber portrait 3 | `public/media/team/barber-3.jpg` |
| 6 | Barber portrait 4 | `public/media/team/barber-4.jpg` |
| 7 | Fade, from behind | `public/media/gallery/cut-fade.jpg` |
| 8 | Beard line-up | `public/media/gallery/beard-line.jpg` |
| 9 | Shop interior | `public/media/gallery/shop-interior.jpg` |
| 10 | Leather chair | `public/media/gallery/leather-chair.jpg` |
| 11 | Tools flat-lay | `public/media/gallery/tools-flatlay.jpg` |
| 12 | Hot towel | `public/media/gallery/hot-towel.jpg` |
| 13 | Barber at work | `public/media/gallery/at-work.jpg` |
| 14 | Wide interior still | `public/media/video/hero-barbershop-poster.jpg` |

---

## Video

**Model:** `kling3_0_turbo` · **Resolution:** 1080p · **Aspect:** 16:9 ·
**Duration:** 10s · **Cost:** 20 credits each

This model takes no separate negative-prompt field, so the exclusions are folded
into the end of each prompt. The standalone negative list is given below for
models that do accept one.

### 1. Hero — the shop at night

> Cinematic slow dolly through an upscale men's barbershop at night. Dark walnut
> wood paneling, brass and chrome fixtures, warm amber tungsten light, a vintage
> leather barber chair, marble counter with neatly arranged chrome clippers,
> straight razor, scissors and folded white towels. A barber in a black apron
> works in the background, softly out of focus and partly silhouetted. Shallow
> depth of field, creamy bokeh, subtle film grain, anamorphic feel, warm moody
> grade with deep blacks. Very slow steady push-in, single continuous shot, no
> cuts. Photorealistic documentary realism, natural motion. Keep the left third
> of the frame darker and uncluttered. No text, no logos, no watermark, no
> on-screen graphics, no distorted hands, no deformed faces.

Camera: slow dolly-in, ~5° of travel, locked horizon, no handheld shake.
Composition note: the headline sits over the left third, so that area is kept
dark and empty on purpose.

### 2. Experience — tools, no people

> Cinematic macro b-roll inside a luxury barbershop, no people. Chrome clippers
> resting on dark marble, polished scissors catching warm light, a folded hot
> white towel gently steaming in a metal tray, wooden combs, badger brush, amber
> glass tonic bottles, reflections crawling across polished metal. Warm amber key
> light with deep falloff, shallow depth of field, very slow drifting camera,
> single continuous shot. Photorealistic product-grade lighting, fine film grain,
> warm moody color grade. No text, no logos, no watermark, no hands, no faces, no
> floating objects.

Deliberately people-free: hands holding tools are where video models fail most
often, and this clip sits behind body copy where an artefact would be obvious.

### Negative prompt (for models that take one)

```
distorted hands, extra fingers, duplicated tools, deformed faces,
changing identity, warped clippers, floating objects, text, logos,
watermark, flickering, unstable background, unrealistic hair,
exaggerated camera movement, cartoon appearance, oversaturated colors,
lens flare, fisheye distortion, motion blur smearing, morphing geometry
```

### Making a clip loop

Kling does not guarantee a seamless first/last frame. Either pick a shot with
little net camera travel, or cross-fade the tail into the head:

```bash
ffmpeg -i raw.mp4 -filter_complex \
  "[0:v]trim=0:9,setpts=PTS-STARTPTS[a]; \
   [0:v]trim=9:10,setpts=PTS-STARTPTS[b]; \
   [a][b]xfade=transition=fade:duration=1:offset=8" \
  -c:v libx264 -crf 26 -movflags +faststart -an looped.mp4
```

---

## Images

**Model:** `soul_2` · **Quality:** 2k · **Cost:** ~0.12 credits each

Portraits were requested at 3:4. The gallery shots were requested at 4:5 and the
API snapped them to the nearest supported ratio, 3:4 — which is fine, the grid
crops with `object-cover`.

### Team portraits (3:4)

Each follows the same template so the four cards read as one shoot:

> Editorial portrait of a professional male barber in his **{late 30s / late 20s
> / 40s / early 30s}**, **{short dark textured hair and a well-groomed full beard
> / a fade haircut and light stubble / salt-and-pepper hair combed back and a
> neat greying beard / curly dark hair, clean shaven}**, wearing a black apron
> over a **{charcoal shirt / rolled-sleeve white shirt / dark grey henley / black
> t-shirt}**, **{arms relaxed / holding chrome scissors / arms crossed / holding
> a comb}**, confident calm expression looking at camera. Standing in an upscale
> dark-wood barbershop, warm amber tungsten light, shallow depth of field, moody
> cinematic grade, photorealistic, 85mm lens. No text, no logos, no watermark.

> ⚠️ These are AI-generated people who do not exist. They are fine for a demo,
> but a real client's site must use photographs of their actual barbers —
> both because customers choose a barber by face, and because presenting an
> invented person as staff is misleading.

### Gallery

**Fade, from behind**
> Close-up from behind of a freshly finished skin fade haircut on a man's head,
> crisp clean taper, sharp neckline, seen from the back three-quarter angle, no
> face visible. Upscale barbershop interior blurred behind, warm amber light,
> shallow depth of field, photorealistic editorial photography. No text, no
> logos, no watermark.

**Beard line-up**
> Close-up profile of a well-groomed dark beard being shaped, crisp cheek line
> and neat edges, straight razor detail near the jaw, partial profile only, warm
> rim light. Dark upscale barbershop, shallow depth of field, photorealistic
> editorial photography, cinematic warm grade. No text, no logos, no watermark.

**Shop interior**
> Interior of a luxury men's barbershop: two vintage leather barber chairs, dark
> walnut panelling, large framed mirrors, brass wall sconces glowing warm, marble
> counter, checkerboard floor. Empty room, evening light, wide angle,
> photorealistic architectural photography, warm moody grade. No people, no text,
> no logos, no watermark.

**Leather chair**
> Detail shot of a vintage brown leather barber chair with polished chrome
> armrests and footrest, worn patina, dark wood floor, warm side light raking
> across the leather. Photorealistic product photography, shallow depth of field,
> moody warm grade. No people, no text, no logos, no watermark.

**Tools flat-lay**
> Flat-lay of barbering tools on dark marble: chrome clippers, straight razor,
> two pairs of scissors, wooden comb, badger shaving brush, small amber glass
> bottle, folded white towel. Neat symmetrical arrangement, warm directional
> light, deep shadows, photorealistic product photography. No text, no logos, no
> watermark, no hands.

**Hot towel**
> A steaming hot white towel folded in a polished metal tray beside a straight
> razor and shaving bowl, gentle steam rising, dark marble counter, warm amber
> light, deep shadows. Photorealistic macro photography, shallow depth of field.
> No people, no text, no logos, no watermark.

**Barber at work**
> Over-the-shoulder view of a barber in a black apron working on a client's
> haircut, both seen from behind, faces not visible, chrome clippers in hand,
> warm amber light, large mirror softly out of focus. Upscale dark barbershop,
> shallow depth of field, photorealistic documentary photography. No text, no
> logos, no watermark, no distorted hands.

**Wide interior still** (doubles as the hero poster)
> Wide cinematic still of an upscale men's barbershop at night, dark walnut
> panelling, warm amber tungsten lighting, leather barber chair, marble counter
> with chrome tools, deep shadows on the left third of frame, soft bokeh
> highlights. Empty room, photorealistic, anamorphic look, warm moody grade with
> deep blacks. No people, no text, no logos, no watermark.

---

## Notes for regenerating

- **Rate limit.** The starter plan allows 4 concurrent jobs. A batch of 12 will
  partially fail with `Rate limit reached`; submit in groups of four.
- **Preset interception.** A prompt that resembles a Higgsfield preset returns a
  `preset_recommendation` instead of generating. Re-send the same request with
  `declined_preset_id` set to the offered preset to get a literal generation.
- **Faces and hands.** Every prompt that could show them either frames them out
  (from behind, partial profile) or removes people entirely. This is the single
  biggest quality lever with current video models.
- **Cost discipline.** Preflight with `get_cost: true` before submitting.
  10s of 1080p video was 20 credits; 1080p images were ~0.12 each.
