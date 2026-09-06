import type { Appointment } from "@/lib/booking/types";
import { minutesToTime } from "./utils";

/** "2026-09-06" + 570 → "20260906T093000" in the visitor's local time. */
function toICSLocal(dateKey: string, minutes: number): string {
  const time = minutesToTime(minutes).replace(":", "");
  return `${dateKey.replace(/-/g, "")}T${time}00`;
}

/**
 * Builds a .ics file for one appointment. Times are written as floating local
 * times, which is what a single-location shop wants: 15:00 stays 15:00.
 */
export function buildAppointmentICS(
  appointment: Appointment,
  options: { title: string; location: string; description: string },
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MODA Barber Club//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@moda-barber-club`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${toICSLocal(appointment.date, appointment.startMinutes)}`,
    `DTEND:${toICSLocal(appointment.date, appointment.endMinutes)}`,
    `SUMMARY:${escapeICS(options.title)}`,
    `LOCATION:${escapeICS(options.location)}`,
    `DESCRIPTION:${escapeICS(options.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function escapeICS(value: string): string {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export function downloadICS(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
