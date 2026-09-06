"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Prefill = {
  serviceId?: string;
  barberId?: string;
  /** Bumped on every request so the wizard can react to a repeat click. */
  nonce: number;
};

type PrefillValue = {
  prefill: Prefill;
  /** Preselects a service and/or barber, then scrolls to the booking section. */
  requestBooking: (next: { serviceId?: string; barberId?: string }) => void;
};

const PrefillContext = createContext<PrefillValue | null>(null);

export function BookingPrefillProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefill] = useState<Prefill>({ nonce: 0 });

  const requestBooking = useCallback(
    (next: { serviceId?: string; barberId?: string }) => {
      setPrefill((current) => ({ ...next, nonce: current.nonce + 1 }));
      document
        .getElementById("booking")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );

  const value = useMemo(() => ({ prefill, requestBooking }), [prefill, requestBooking]);

  return <PrefillContext.Provider value={value}>{children}</PrefillContext.Provider>;
}

export function useBookingPrefill(): PrefillValue {
  const context = useContext(PrefillContext);
  if (!context) {
    throw new Error("useBookingPrefill must be used inside <BookingPrefillProvider>");
  }
  return context;
}
