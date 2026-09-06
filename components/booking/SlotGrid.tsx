"use client";

import { Loader2 } from "lucide-react";
import type { Slot } from "@/lib/booking";
import { useI18n } from "@/lib/i18n";
import { cn, minutesToTime } from "@/lib/utils";

/** Morning / afternoon / evening, so a long day is scannable. */
function groupSlots(slots: Slot[]) {
  return {
    morning: slots.filter((slot) => slot.startMinutes < 12 * 60),
    afternoon: slots.filter(
      (slot) => slot.startMinutes >= 12 * 60 && slot.startMinutes < 17 * 60,
    ),
    evening: slots.filter((slot) => slot.startMinutes >= 17 * 60),
  };
}

export function SlotGrid({
  slots,
  loading,
  closed,
  selected,
  onSelect,
}: {
  slots: Slot[];
  loading: boolean;
  closed: boolean;
  selected: number | null;
  onSelect: (slot: Slot) => void;
}) {
  const { t } = useI18n();

  if (loading) {
    return (
      <p className="flex items-center gap-3 py-10 text-sm text-muted">
        <Loader2 className="size-4 animate-spin text-gold" aria-hidden="true" />
        {t.booking.loadingSlots}…
      </p>
    );
  }

  if (closed) {
    return (
      <p className="rounded-card border border-hairline bg-surface p-6 text-sm text-muted">
        {t.booking.closedThatDay}
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-card border border-hairline bg-surface p-6">
        <p className="text-sm text-offwhite">{t.booking.noSlots}</p>
        <p className="mt-1.5 text-sm text-muted">{t.booking.noSlotsHint}</p>
      </div>
    );
  }

  const groups = groupSlots(slots);
  const labelled: Array<[string, Slot[]]> = [
    [t.booking.morning, groups.morning],
    [t.booking.afternoon, groups.afternoon],
    [t.booking.evening, groups.evening],
  ];

  return (
    <div className="space-y-6">
      {labelled
        .filter(([, entries]) => entries.length > 0)
        .map(([label, entries]) => (
          <div key={label}>
            <h4 className="mb-3 text-[0.66rem] uppercase tracking-[0.24em] text-muted">
              {label}
            </h4>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {entries.map((slot) => {
                const isSelected = selected === slot.startMinutes;
                return (
                  <li key={slot.startMinutes}>
                    <button
                      type="button"
                      onClick={() => onSelect(slot)}
                      aria-pressed={isSelected}
                      className={cn(
                        "w-full rounded-xl border px-2 py-3 text-sm tabular-nums transition-colors",
                        isSelected
                          ? "border-gold bg-gold text-ink"
                          : "border-hairline text-cream hover:border-gold hover:text-gold",
                      )}
                    >
                      {minutesToTime(slot.startMinutes)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
    </div>
  );
}

export default SlotGrid;
