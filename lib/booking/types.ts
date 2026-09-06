export type AppointmentStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export type Appointment = {
  id: string;
  confirmationCode: string;
  serviceId: string;
  barberId: string;
  /** Local date key, "YYYY-MM-DD". */
  date: string;
  /** Minutes from midnight, local time. */
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  price: number;
  status: AppointmentStatus;
  createdAt: string;
};

export type NewAppointment = Omit<
  Appointment,
  "id" | "confirmationCode" | "status" | "createdAt"
>;

export type BlockedTime = {
  id: string;
  /** null = the whole shop is blocked. */
  barberId: string | null;
  date: string;
  startMinutes: number;
  endMinutes: number;
  reason: string;
};

export type NewBlockedTime = Omit<BlockedTime, "id">;

/**
 * The minimum the availability maths needs — no customer data.
 *
 * This is what the public site reads. Under the Supabase policies in
 * supabase/migrations/0001_init.sql, anonymous visitors can see that a slot is
 * taken but never who took it; full Appointment rows are staff-only.
 */
export type BusySlot = {
  barberId: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  status: AppointmentStatus;
};

export type StorageMode = "demo" | "supabase";

/**
 * The only surface the UI talks to. Swapping localStorage for Supabase is a
 * matter of returning a different implementation from getBookingStore().
 */
export interface BookingStore {
  readonly mode: StorageMode;
  /** Taken time, without customer data. Used by the public booking grid. */
  listBusy(fromDate: string, toDate: string): Promise<BusySlot[]>;
  /** Full records, including customer details. Staff only once Supabase is on. */
  listAppointments(fromDate: string, toDate: string): Promise<Appointment[]>;
  listBlocks(fromDate: string, toDate: string): Promise<BlockedTime[]>;
  /** Must re-check for a conflict and throw SlotTakenError if the slot went. */
  createAppointment(input: NewAppointment): Promise<Appointment>;
  updateStatus(id: string, status: AppointmentStatus): Promise<void>;
  createBlock(input: NewBlockedTime): Promise<BlockedTime>;
  deleteBlock(id: string): Promise<void>;
}

/** Thrown when the chosen slot was taken between rendering and confirming. */
export class SlotTakenError extends Error {
  constructor() {
    super("SLOT_TAKEN");
    this.name = "SlotTakenError";
  }
}
