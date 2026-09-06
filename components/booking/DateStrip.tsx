"use client";

import { useMemo } from "react";
import { siteConfig } from "@/config/siteConfig";
import type { Weekday } from "@/config/types";
import { isOpenOn } from "@/lib/booking";
import { useI18n } from "@/lib/i18n";
import { addDays, cn, startOfDay, toDateKey } from "@/lib/utils";

/**
 * A horizontal strip of the next `maxAdvanceDays`. Days the shop is closed are
 * rendered but disabled — showing them is clearer than silently hiding them,
 * and it doubles as a reminder of the opening pattern.
 */
export function DateStrip({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dateKey: string) => void;
}) {
  const { t } = useI18n();

  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: siteConfig.booking.maxAdvanceDays }, (_, offset) => {
      const date = addDays(today, offset);
      const weekday = date.getDay() as Weekday;
      return {
        key: toDateKey(date),
        date,
        weekday,
        open: isOpenOn(weekday),
        isToday: offset === 0,
      };
    });
  }, []);

  return (
    <div
      className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]"
      role="group"
      aria-label={t.booking.chooseDate}
    >
      {days.map((day) => {
        const selected = value === day.key;

        return (
          <button
            key={day.key}
            type="button"
            disabled={!day.open}
            onClick={() => onChange(day.key)}
            aria-pressed={selected}
            className={cn(
              "flex min-w-[74px] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl border px-3 py-3 transition-colors",
              selected
                ? "border-gold bg-gold/10 text-gold"
                : "border-hairline text-cream hover:border-gold/60",
              !day.open && "cursor-not-allowed border-hairline/50 text-muted/40 hover:border-hairline/50",
            )}
          >
            <span className="text-[0.62rem] uppercase tracking-[0.14em]">
              {day.isToday ? t.location.today : t.weekdays.short[day.weekday]}
            </span>
            <span className="font-display text-xl leading-none tabular-nums">
              {day.date.getDate()}
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.1em] text-muted">
              {t.months[day.date.getMonth()].slice(0, 3)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default DateStrip;
