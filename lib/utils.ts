import clsx, { type ClassValue } from "clsx";

/** Tailwind-friendly class joiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Replaces {placeholders} in a dictionary string. */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** "09:30" → 570 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** 570 → "09:30" */
export function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Local-date ISO key, e.g. "2026-09-06". Never use toISOString() — it shifts by timezone. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "2026-09-06" → local midnight Date. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function formatPrice(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

/**
 * Israeli phone numbers: mobile (05x), landline (02/03/04/08/09) and the
 * 07x ranges, with or without the +972 country prefix, dashes or spaces.
 */
export function isValidIsraeliPhone(input: string): boolean {
  const digits = input.replace(/[\s\-().]/g, "");
  const national = digits.startsWith("+972")
    ? `0${digits.slice(4)}`
    : digits.startsWith("972")
      ? `0${digits.slice(3)}`
      : digits;
  return /^0(?:5\d|7[2-9]|[23489])\d{7}$/.test(national);
}

export function normalizePhone(input: string): string {
  return input.replace(/[\s\-().]/g, "");
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}

/** Short, human-readable confirmation code, e.g. MODA-7K4Q2P. */
export function makeConfirmationCode(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${code}`;
}

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
