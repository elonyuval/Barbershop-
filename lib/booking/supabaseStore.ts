import { siteConfig } from "@/config/siteConfig";
import { makeConfirmationCode } from "@/lib/utils";
import { hasConflict } from "./availability";
import {
  SlotTakenError,
  type Appointment,
  type BlockedTime,
  type BookingStore,
  type BusySlot,
  type NewAppointment,
  type NewBlockedTime,
} from "./types";

/**
 * Supabase-backed storage, spoken over PostgREST with plain fetch.
 *
 * Using fetch rather than @supabase/supabase-js keeps the client bundle free of
 * a dependency the demo never loads. If you prefer the official SDK, swap the
 * request helpers below — the exported BookingStore contract stays identical.
 *
 * The table shapes and Row Level Security policies live in
 * supabase/migrations/0001_init.sql.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anonKey);

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  "Content-Type": "application/json",
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}): ${await response.text()}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Database rows use snake_case; the app uses camelCase. */
type AppointmentRow = {
  id: string;
  confirmation_code: string;
  service_id: string;
  barber_id: string;
  date: string;
  start_minutes: number;
  end_minutes: number;
  duration_minutes: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  price: number;
  status: Appointment["status"];
  created_at: string;
};

const toAppointment = (row: AppointmentRow): Appointment => ({
  id: row.id,
  confirmationCode: row.confirmation_code,
  serviceId: row.service_id,
  barberId: row.barber_id,
  date: row.date,
  startMinutes: row.start_minutes,
  endMinutes: row.end_minutes,
  durationMinutes: row.duration_minutes,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerEmail: row.customer_email ?? "",
  notes: row.notes ?? "",
  price: row.price,
  status: row.status,
  createdAt: row.created_at,
});

type BlockRow = {
  id: string;
  barber_id: string | null;
  date: string;
  start_minutes: number;
  end_minutes: number;
  reason: string | null;
};

const toBlock = (row: BlockRow): BlockedTime => ({
  id: row.id,
  barberId: row.barber_id,
  date: row.date,
  startMinutes: row.start_minutes,
  endMinutes: row.end_minutes,
  reason: row.reason ?? "",
});

type BusyRow = {
  barber_id: string;
  date: string;
  start_minutes: number;
  end_minutes: number;
};

export const supabaseBookingStore: BookingStore = {
  mode: "supabase",

  /**
   * Reads the `busy_slots` view rather than the table: it exposes only when a
   * barber is taken, never who by, so the public booking grid works without
   * anonymous access to customer data.
   */
  async listBusy(fromDate, toDate): Promise<BusySlot[]> {
    const rows = await request<BusyRow[]>(
      `busy_slots?select=*&date=gte.${fromDate}&date=lte.${toDate}`,
    );
    return rows.map((row) => ({
      barberId: row.barber_id,
      date: row.date,
      startMinutes: row.start_minutes,
      endMinutes: row.end_minutes,
      status: "confirmed" as const,
    }));
  },

  /** Staff only — anonymous callers get an empty list under the RLS policies. */
  async listAppointments(fromDate, toDate) {
    const rows = await request<AppointmentRow[]>(
      `appointments?select=*&date=gte.${fromDate}&date=lte.${toDate}&order=start_minutes.asc`,
    );
    return rows.map(toAppointment);
  },

  async listBlocks(fromDate, toDate) {
    const rows = await request<BlockRow[]>(
      `blocked_times?select=*&date=gte.${fromDate}&date=lte.${toDate}`,
    );
    return rows.map(toBlock);
  },

  async createAppointment(input: NewAppointment) {
    // Read-then-write guard. The exclusion constraint in the migration is the
    // real safety net; this only produces a friendlier error most of the time.
    const sameDay = await this.listBusy(input.date, input.date);
    if (hasConflict(input, sameDay)) {
      throw new SlotTakenError();
    }

    const payload = {
      confirmation_code: makeConfirmationCode(siteConfig.booking.confirmationPrefix),
      service_id: input.serviceId,
      barber_id: input.barberId,
      date: input.date,
      start_minutes: input.startMinutes,
      end_minutes: input.endMinutes,
      duration_minutes: input.durationMinutes,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail || null,
      notes: input.notes || null,
      price: input.price,
      status: "confirmed",
    };

    try {
      const [row] = await request<AppointmentRow[]>("appointments", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      return toAppointment(row);
    } catch (error) {
      // 23505 = unique violation: the slot was taken between the check and here.
      if (error instanceof Error && error.message.includes("23505")) {
        throw new SlotTakenError();
      }
      throw error;
    }
  },

  async updateStatus(id, status) {
    await request(`appointments?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async createBlock(input: NewBlockedTime) {
    const [row] = await request<BlockRow[]>("blocked_times", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        barber_id: input.barberId,
        date: input.date,
        start_minutes: input.startMinutes,
        end_minutes: input.endMinutes,
        reason: input.reason || null,
      }),
    });
    return toBlock(row);
  },

  async deleteBlock(id) {
    await request(`blocked_times?id=eq.${id}`, { method: "DELETE" });
  },
};
