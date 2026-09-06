"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * A row of similar cards: a snap carousel on phones, a plain grid from `md` up.
 *
 * Six service cards stacked vertically is a very long scroll on a 375px screen,
 * and every card looks like the last one — so on small screens they are swiped
 * through sideways instead.
 *
 * Direction-aware: in Hebrew the arrows step the other way, because a
 * right-to-left track advances toward the physical left.
 */
export function SwipeRow({
  children,
  label,
  prevLabel,
  nextLabel,
  gridClassName,
  className,
}: {
  children: ReactNode;
  /** Names the group for screen readers. */
  label: string;
  prevLabel: string;
  nextLabel: string;
  /** Grid classes applied from `md` up, e.g. "md:grid-cols-3". */
  gridClassName?: string;
  className?: string;
}) {
  const { dir } = useI18n();
  const trackRef = useRef<HTMLUListElement>(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const readPosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // scrollLeft runs negative in a right-to-left track, so compare on distance.
    const travelled = Math.abs(track.scrollLeft);
    const maximum = track.scrollWidth - track.clientWidth;

    setAtStart(travelled < 12);
    setAtEnd(maximum - travelled < 12);
  }, []);

  useEffect(() => {
    readPosition();
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener("scroll", readPosition, { passive: true });
    window.addEventListener("resize", readPosition);
    return () => {
      track.removeEventListener("scroll", readPosition);
      window.removeEventListener("resize", readPosition);
    };
  }, [readPosition]);

  const step = (forward: boolean) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector("li");
    const distance = card ? card.clientWidth + 16 : track.clientWidth * 0.8;
    const towardsEnd = dir === "rtl" ? -1 : 1;

    track.scrollBy({ left: distance * towardsEnd * (forward ? 1 : -1), behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={trackRef}
        aria-label={label}
        className={cn(
          // Phones: one swipeable row that bleeds to the screen edges.
          "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4",
          // Without matching scroll padding, snapping parks the first card
          // under the row's own padding instead of flush with it.
          "scroll-px-5 md:scroll-px-0",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Tablets and up: an ordinary grid.
          "md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 md:pb-0",
          gridClassName,
        )}
      >
        {children}
      </ul>

      {/* Controls, phones only — the grid needs none. */}
      <div className="mt-4 flex items-center justify-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => step(false)}
          disabled={atStart}
          aria-label={prevLabel}
          className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold hover:text-gold disabled:opacity-30"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => step(true)}
          disabled={atEnd}
          aria-label={nextLabel}
          className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold hover:text-gold disabled:opacity-30"
        >
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default SwipeRow;
