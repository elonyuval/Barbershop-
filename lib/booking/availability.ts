import { siteConfig } from "@/config/siteConfig";
import type { Barber, Service, TimeRange, Weekday } from "@/config/types";
import { timeToMinutes, toDateKey } from "@/lib/utils";
import type { BlockedTime, BusySlot } from "./types";

export type Slot = {
  startMinutes: number;
  /** Which barber would take it — resolved even when the visitor said "no preference". */
  barberId: string;
};

type Interval = { start: number; end: number };

const toIntervals = (ranges: TimeRange[]): Interval[] =>
  ranges.map((range) => ({
    start: timeToMinutes(range.start),
    end: timeToMinutes(range.end),
  }));

export function openingIntervals(weekday: Weekday): Interval[] {
  const day = siteConfig.hours.find((entry) => entry.weekday === weekday);
  return day ? toIntervals(day.ranges) : [];
}

export function barberIntervals(barber: Barber, weekday: Weekday): Interval[] {
  const day = barber.availability.find((entry) => entry.weekday === weekday);
  return day ? toIntervals(day.ranges) : [];
}

function intersect(a: Interval[], b: Interval[]): Interval[] {
  const result: Interval[] = [];
  for (const left of a) {
    for (const right of b) {
      const start = Math.max(left.start, right.start);
      const end = Math.min(left.end, right.end);
      if (end > start) result.push({ start, end });
    }
  }
  return result.sort((x, y) => x.start - y.start);
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

export function barberCanServe(barber: Barber, serviceId: string): boolean {
  return barber.serviceIds.length === 0 || barber.serviceIds.includes(serviceId);
}

export function barbersForService(serviceId: string): Barber[] {
  return siteConfig.team.filter((barber) => barberCanServe(barber, serviceId));
}

/** Is the shop open at all on this weekday? */
export function isOpenOn(weekday: Weekday): boolean {
  return openingIntervals(weekday).length > 0;
}

type BuildSlotsInput = {
  dateKey: string;
  service: Service;
  /** null = "no preference": any barber who can take it. */
  barberId: string | null;
  appointments: BusySlot[];
  blocks: BlockedTime[];
  /** Injected so the maths stays pure and testable. */
  now: Date;
};

/**
 * Builds the bookable start times for one day.
 *
 * A slot survives only if, for at least one eligible barber, the whole
 * appointment (plus the clean-up buffer) fits inside the intersection of the
 * shop's opening hours and that barber's rota, touches no existing appointment
 * and no blocked time, and is far enough in the future.
 */
export function buildSlots({
  dateKey,
  service,
  barberId,
  appointments,
  blocks,
  now,
}: BuildSlotsInput): Slot[] {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = date.getDay() as Weekday;
  const opening = openingIntervals(weekday);
  if (opening.length === 0) return [];

  const { slotIntervalMinutes, minimumNoticeHours, bufferMinutes } =
    siteConfig.booking;

  const candidates = barbersForService(service.id).filter(
    (barber) => barberId === null || barber.id === barberId,
  );
  if (candidates.length === 0) return [];

  // Everything scheduled today, by barber.
  const dayAppointments = appointments.filter(
    (appointment) =>
      appointment.date === dateKey && appointment.status !== "cancelled",
  );
  const dayBlocks = blocks.filter((block) => block.date === dateKey);

  const isToday = toDateKey(now) === dateKey;
  const earliestStart = isToday
    ? now.getHours() * 60 + now.getMinutes() + minimumNoticeHours * 60
    : 0;

  const duration = service.durationMinutes;
  const slots = new Map<number, string>();

  for (const barber of candidates) {
    const working = intersect(opening, barberIntervals(barber, weekday));

    for (const window of working) {
      for (
        let start = window.start;
        start + duration <= window.end;
        start += slotIntervalMinutes
      ) {
        if (start < earliestStart) continue;
        if (slots.has(start)) continue; // an earlier barber already covers it

        const end = start + duration;

        const clashesWithAppointment = dayAppointments.some(
          (appointment) =>
            appointment.barberId === barber.id &&
            overlaps(
              start,
              end + bufferMinutes,
              appointment.startMinutes,
              appointment.endMinutes + bufferMinutes,
            ),
        );
        if (clashesWithAppointment) continue;

        const clashesWithBlock = dayBlocks.some(
          (block) =>
            (block.barberId === null || block.barberId === barber.id) &&
            overlaps(start, end, block.startMinutes, block.endMinutes),
        );
        if (clashesWithBlock) continue;

        slots.set(start, barber.id);
      }
    }
  }

  return [...slots.entries()]
    .map(([startMinutes, resolvedBarberId]) => ({ startMinutes, barberId: resolvedBarberId }))
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

/** Used by the store before writing, so two tabs cannot take the same slot. */
export function hasConflict(
  candidate: { barberId: string; date: string; startMinutes: number; endMinutes: number },
  appointments: BusySlot[],
): boolean {
  return appointments.some(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.date === candidate.date &&
      appointment.barberId === candidate.barberId &&
      overlaps(
        candidate.startMinutes,
        candidate.endMinutes,
        appointment.startMinutes,
        appointment.endMinutes,
      ),
  );
}
