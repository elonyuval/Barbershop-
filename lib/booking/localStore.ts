"use client";

import { siteConfig } from "@/config/siteConfig";
import { addDays, makeConfirmationCode, makeId, toDateKey } from "@/lib/utils";
import { hasConflict } from "./availability";
import {
  SlotTakenError,
  type Appointment,
  type BlockedTime,
  type BookingStore,
  type NewAppointment,
  type NewBlockedTime,
} from "./types";

const APPOINTMENTS_KEY = "moda:appointments";
const BLOCKS_KEY = "moda:blocks";
const SEED_KEY = "moda:seeded";

/** Fired after every write so open views (site + admin) can refresh. */
export const BOOKINGS_CHANGED = "moda:bookings-changed";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGED));
  } catch {
    // Private mode / storage full: the booking simply will not persist.
  }
}

/**
 * Puts a few appointments in the diary the first time the demo is opened, so
 * the booking grid and the admin area do not look empty. Harmless in a real
 * deployment: it only ever runs in demo mode.
 */
function seedOnce(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(SEED_KEY)) return;
  } catch {
    return;
  }

  const today = new Date();
  const plan: Array<[number, string, string, number, string, string]> = [
    [0, "adam", "mens-cut", 11 * 60, "Yonatan Peled", "052-441-8890"],
    [0, "noam", "cut-beard", 15 * 60 + 30, "Roi Barkan", "054-772-1130"],
    [1, "adam", "beard-design", 10 * 60, "Amit Vaknin", "050-318-2245"],
    [1, "yaron", "grooming-facial", 13 * 60, "Nadav Shaked", "053-990-4471"],
    [2, "eitan", "kids-cut", 16 * 60 + 30, "Gilad Ohana", "058-220-7719"],
  ];

  const seeded: Appointment[] = plan.map(
    ([dayOffset, barberId, serviceId, startMinutes, name, phone]) => {
      const service = siteConfig.services.find((entry) => entry.id === serviceId)!;
      return {
        id: makeId(),
        confirmationCode: makeConfirmationCode(siteConfig.booking.confirmationPrefix),
        serviceId,
        barberId,
        date: toDateKey(addDays(today, dayOffset)),
        startMinutes,
        endMinutes: startMinutes + service.durationMinutes,
        durationMinutes: service.durationMinutes,
        customerName: name,
        customerPhone: phone,
        customerEmail: "",
        notes: "",
        price: service.price,
        status: "confirmed" as const,
        createdAt: new Date().toISOString(),
      };
    },
  );

  write(APPOINTMENTS_KEY, seeded);
  try {
    window.localStorage.setItem(SEED_KEY, "1");
  } catch {
    // Nothing to do — worst case the diary starts empty.
  }
}

const inRange = (date: string, from: string, to: string) =>
  date >= from && date <= to;

/** Demo storage: everything lives in this browser, nothing leaves the device. */
export const localBookingStore: BookingStore = {
  mode: "demo",

  async listAppointments(fromDate, toDate) {
    seedOnce();
    return read<Appointment>(APPOINTMENTS_KEY).filter((appointment) =>
      inRange(appointment.date, fromDate, toDate),
    );
  },

  // In demo mode everything lives in one place, so busy time is just a
  // projection of the same rows.
  async listBusy(fromDate, toDate) {
    return (await this.listAppointments(fromDate, toDate)).map((appointment) => ({
      barberId: appointment.barberId,
      date: appointment.date,
      startMinutes: appointment.startMinutes,
      endMinutes: appointment.endMinutes,
      status: appointment.status,
    }));
  },

  async listBlocks(fromDate, toDate) {
    return read<BlockedTime>(BLOCKS_KEY).filter((block) =>
      inRange(block.date, fromDate, toDate),
    );
  },

  async createAppointment(input: NewAppointment) {
    const all = read<Appointment>(APPOINTMENTS_KEY);

    // Re-check at write time: another tab may have taken the slot meanwhile.
    if (hasConflict(input, all)) {
      throw new SlotTakenError();
    }

    const appointment: Appointment = {
      ...input,
      id: makeId(),
      confirmationCode: makeConfirmationCode(siteConfig.booking.confirmationPrefix),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    write(APPOINTMENTS_KEY, [...all, appointment]);
    return appointment;
  },

  async updateStatus(id, status) {
    const all = read<Appointment>(APPOINTMENTS_KEY);
    write(
      APPOINTMENTS_KEY,
      all.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    );
  },

  async createBlock(input: NewBlockedTime) {
    const block: BlockedTime = { ...input, id: makeId() };
    write(BLOCKS_KEY, [...read<BlockedTime>(BLOCKS_KEY), block]);
    return block;
  },

  async deleteBlock(id) {
    write(
      BLOCKS_KEY,
      read<BlockedTime>(BLOCKS_KEY).filter((block) => block.id !== id),
    );
  },
};
