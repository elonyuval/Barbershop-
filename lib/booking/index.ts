import { localBookingStore } from "./localStore";
import { isSupabaseConfigured, supabaseBookingStore } from "./supabaseStore";
import type { BookingStore } from "./types";

/**
 * Picks the storage layer. Supabase wins as soon as its environment variables
 * are present; otherwise the site runs in demo mode against localStorage.
 * Every component uses this and nothing else, so switching backends is a
 * configuration change rather than a rewrite.
 */
export function getBookingStore(): BookingStore {
  return isSupabaseConfigured ? supabaseBookingStore : localBookingStore;
}

/** True while bookings are being kept in the visitor's own browser. */
export const isDemoStorage = !isSupabaseConfigured;

export * from "./types";
export * from "./availability";
export { BOOKINGS_CHANGED } from "./localStore";
