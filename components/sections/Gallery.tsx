"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import type { GalleryItem } from "@/config/types";
import { asset } from "@/lib/paths";
import { useI18n } from "@/lib/i18n";
import { lockScroll, releaseScroll } from "@/lib/scrollLock";
import { cn, fill } from "@/lib/utils";

type Filter = "all" | GalleryItem["category"];

export function Gallery() {
  const { t, pick } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = siteConfig.gallery.filter(
    (item) => filter === "all" || item.category === filter,
  );

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: t.gallery.all },
    { id: "cuts", label: t.gallery.cuts },
    { id: "beards", label: t.gallery.beards },
    { id: "shop", label: t.gallery.shop },
    { id: "work", label: t.gallery.work },
  ];

  const close = useCallback(() => setLightboxIndex(null), []);
  const step = useCallback(
    (direction: 1 | -1) =>
      setLightboxIndex((current) =>
        current === null
          ? null
          : (current + direction + items.length) % items.length,
      ),
    [items.length],
  );

  // Keyboard support for the lightbox, and a scroll lock while it is open.
  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    lockScroll();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      releaseScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, close, step]);

  const active = lightboxIndex === null ? null : items[lightboxIndex];

  return (
    <Section
      id="gallery"
      eyebrow={t.gallery.eyebrow}
      title={t.gallery.title}
      lede={t.gallery.lede}
      className="bg-ink"
    >
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            aria-pressed={filter === entry.id}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2.5 text-[0.68rem] uppercase tracking-[0.2em] transition-colors",
              filter === entry.id
                ? "border-gold bg-gold/10 text-gold"
                : "border-hairline text-muted hover:border-gold hover:text-gold",
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <ul className="grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] lg:grid-cols-4">
        {items.map((item, index) => (
          <Reveal
            as="li"
            key={item.id}
            delay={Math.min(index, 6) * 0.05}
            className={cn(
              "group relative overflow-hidden rounded-card border border-hairline",
              item.wide && "col-span-2 row-span-1",
            )}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="absolute inset-0 h-full w-full cursor-zoom-in"
              aria-label={`${t.gallery.openImage}: ${pick(item.alt)}`}
            >
              <Image
                src={asset(item.src)}
                alt={pick(item.alt)}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-ink/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            </button>
          </Reveal>
        ))}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={pick(active.alt)}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-5 end-5 inline-flex size-12 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold hover:text-gold"
              aria-label={t.common.close}
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute start-3 inline-flex size-12 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold hover:text-gold sm:start-8"
              aria-label={t.gallery.previous}
            >
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>

            <figure className="relative flex max-h-[86svh] w-full max-w-4xl flex-col items-center">
              <div className="relative h-[70svh] w-full">
                <Image
                  src={asset(active.src)}
                  alt={pick(active.alt)}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="mt-4 text-center text-sm text-muted">
                {pick(active.alt)}
                <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.24em] text-gold/70">
                  {fill(t.gallery.counter, {
                    current: (lightboxIndex ?? 0) + 1,
                    total: items.length,
                  })}
                </span>
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={() => step(1)}
              className="absolute end-3 inline-flex size-12 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold hover:text-gold sm:end-8"
              aria-label={t.gallery.next}
            >
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

export default Gallery;
