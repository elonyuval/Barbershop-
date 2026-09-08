"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Loader2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import {
  BOOKINGS_CHANGED,
  SlotTakenError,
  buildSlots,
  getBookingStore,
  isDemoStorage,
  isOpenOn,
  type Appointment,
  type Slot,
} from "@/lib/booking";
import { buildAppointmentICS, downloadICS } from "@/lib/calendar";
import { useBookingPrefill } from "@/lib/bookingPrefill";
import { asset } from "@/lib/paths";
import { useI18n } from "@/lib/i18n";
import {
  cn,
  fill,
  formatPrice,
  fromDateKey,
  isValidEmail,
  isValidIsraeliPhone,
  minutesToTime,
  normalizePhone,
} from "@/lib/utils";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import Stepper from "./Stepper";

const ANY_BARBER = "any";
const STEP_COUNT = 5;

type FormState = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export function BookingWizard() {
  const { t, pick } = useI18n();
  const { prefill } = useBookingPrefill();
  const reduceMotion = useReducedMotion();
  const store = useMemo(() => getBookingStore(), []);

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string>(ANY_BARBER);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<Appointment | null>(null);

  const headingRef = useRef<HTMLDivElement>(null);

  const service = siteConfig.services.find((entry) => entry.id === serviceId) ?? null;
  const chosenBarber =
    barberId === ANY_BARBER
      ? null
      : (siteConfig.team.find((entry) => entry.id === barberId) ?? null);

  const steps = [
    t.booking.steps.service,
    t.booking.steps.barber,
    t.booking.steps.time,
    t.booking.steps.details,
    t.booking.steps.confirm,
  ];

  /* --- deep links from the service cards and barber cards --- */
  useEffect(() => {
    if (prefill.nonce === 0) return;

    setCreated(null);
    setSubmitError(null);

    if (prefill.serviceId) {
      setServiceId(prefill.serviceId);
      setSlot(null);
      setStep(1);
    }
    if (prefill.barberId) {
      setBarberId(prefill.barberId);
      setSlot(null);
      // A barber was picked but maybe no service yet — start where it is needed.
      setStep((current) => (serviceId || prefill.serviceId ? 2 : 0));
    }
    // Intentionally keyed on the nonce alone: a repeat click should re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill.nonce]);

  /* --- availability for the chosen day --- */
  const loadSlots = useCallback(async () => {
    if (!service || !dateKey) return;

    setLoadingSlots(true);
    try {
      const [appointments, blocks] = await Promise.all([
        store.listBusy(dateKey, dateKey),
        store.listBlocks(dateKey, dateKey),
      ]);

      setSlots(
        buildSlots({
          dateKey,
          service,
          barberId: barberId === ANY_BARBER ? null : barberId,
          appointments,
          blocks,
          now: new Date(),
        }),
      );
    } catch {
      setSlots([]);
      setSubmitError(t.booking.errors.generic);
    } finally {
      setLoadingSlots(false);
    }
  }, [service, dateKey, barberId, store, t.booking.errors.generic]);

  useEffect(() => {
    if (step === 2) void loadSlots();
  }, [step, loadSlots]);

  // Another tab (or the admin area) changed the diary — recompute.
  useEffect(() => {
    const onChange = () => {
      if (step === 2) void loadSlots();
    };
    window.addEventListener(BOOKINGS_CHANGED, onChange);
    return () => window.removeEventListener(BOOKINGS_CHANGED, onChange);
  }, [step, loadSlots]);

  /* --- navigation --- */
  const goTo = (next: number) => {
    setStep(next);
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const canContinue = () => {
    if (step === 0) return Boolean(serviceId);
    if (step === 2) return Boolean(dateKey && slot);
    if (step === 3) return true; // validated on submit
    return true;
  };

  const validateDetails = () => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) next.name = t.booking.errors.nameRequired;
    else if (form.name.trim().length < 2) next.name = t.booking.errors.nameTooShort;

    if (!form.phone.trim()) next.phone = t.booking.errors.phoneRequired;
    else if (!isValidIsraeliPhone(form.phone)) next.phone = t.booking.errors.phoneInvalid;

    if (form.email.trim() && !isValidEmail(form.email)) {
      next.email = t.booking.errors.emailInvalid;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (step === 3) {
      if (!validateDetails()) return;
      goTo(4);
      return;
    }
    goTo(Math.min(step + 1, STEP_COUNT - 1));
  };

  /* --- confirm --- */
  const confirm = async () => {
    if (!service || !dateKey || !slot) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const appointment = await store.createAppointment({
        serviceId: service.id,
        barberId: slot.barberId,
        date: dateKey,
        startMinutes: slot.startMinutes,
        endMinutes: slot.startMinutes + service.durationMinutes,
        durationMinutes: service.durationMinutes,
        customerName: form.name.trim(),
        customerPhone: normalizePhone(form.phone),
        customerEmail: form.email.trim(),
        notes: form.notes.trim(),
        price: service.price,
      });

      setCreated(appointment);
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      if (error instanceof SlotTakenError) {
        setSubmitError(t.booking.errors.slotTaken);
        setSlot(null);
        setStep(2);
        void loadSlots();
      } else {
        setSubmitError(t.booking.errors.generic);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setCreated(null);
    setStep(0);
    setServiceId(null);
    setBarberId(ANY_BARBER);
    setDateKey(null);
    setSlot(null);
    setForm({ name: "", phone: "", email: "", notes: "" });
    setErrors({});
    setSubmitError(null);
  };

  const addToCalendar = () => {
    if (!created || !service) return;

    const barber = siteConfig.team.find((entry) => entry.id === created.barberId);
    downloadICS(
      `${created.confirmationCode}.ics`,
      buildAppointmentICS(created, {
        title: `${pick(service.name)} · ${siteConfig.business.name}`,
        location: pick(siteConfig.business.address),
        description: `${t.booking.confirmationNumber}: ${created.confirmationCode}${
          barber ? ` · ${pick(barber.name)}` : ""
        }`,
      }),
    );
  };

  const formattedDate = (key: string) => {
    const date = fromDateKey(key);
    return `${t.weekdays.long[date.getDay()]}, ${date.getDate()} ${t.months[date.getMonth()]}`;
  };

  const panel = (children: React.ReactNode, key: string) => (
    <motion.div
      key={key}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 0.84, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );

  return (
    <Section
      id="booking"
      eyebrow={t.booking.eyebrow}
      title={t.booking.title}
      lede={t.booking.lede}
    >
      <div ref={headingRef} className="scroll-mt-28 rounded-card border border-hairline bg-surface p-5 sm:p-8">
        {isDemoStorage && !created && (
          <p className="mb-6 flex items-start gap-3 rounded-xl border border-gold/25 bg-gold/5 p-4 text-[0.78rem] leading-relaxed text-gold/90">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t.booking.demoNotice}
          </p>
        )}

        {!created && (
          <div className="mb-8">
            <Stepper steps={steps} current={step} onStepClick={goTo} />
            <p className="mt-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted sm:hidden">
              {fill(t.booking.stepCounter, { current: step + 1, total: STEP_COUNT })}
              {" · "}
              {steps[step]}
            </p>
          </div>
        )}

        {submitError && (
          <p
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {submitError}
          </p>
        )}

        <AnimatePresence mode="wait">
          {/* ---------------------------------------------------------- success */}
          {created && service
            ? panel(
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto size-14 text-gold" aria-hidden="true" />
                  <h3 className="mt-6 text-[clamp(1.5rem,4vw,2.2rem)] text-offwhite">
                    {t.booking.successTitle}
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                    {t.booking.successBody}
                  </p>

                  <p className="mx-auto mt-7 w-fit rounded-xl border border-gold/40 bg-gold/10 px-6 py-4">
                    <span className="block text-[0.62rem] uppercase tracking-[0.24em] text-gold/80">
                      {t.booking.confirmationNumber}
                    </span>
                    <span className="mt-1 block font-display text-2xl tracking-[0.12em] text-gold">
                      {created.confirmationCode}
                    </span>
                  </p>

                  <dl className="mx-auto mt-8 max-w-md space-y-2.5 text-start text-sm">
                    <SummaryRow label={t.booking.summaryService} value={pick(service.name)} />
                    <SummaryRow
                      label={t.booking.summaryBarber}
                      value={
                        siteConfig.team.find((entry) => entry.id === created.barberId)
                          ? pick(
                              siteConfig.team.find((entry) => entry.id === created.barberId)!
                                .name,
                            )
                          : t.booking.anyBarber
                      }
                    />
                    <SummaryRow
                      label={t.booking.summaryWhen}
                      value={`${formattedDate(created.date)} · ${minutesToTime(created.startMinutes)}`}
                    />
                    <SummaryRow
                      label={t.booking.summaryPrice}
                      value={formatPrice(created.price, siteConfig.business.currencySymbol)}
                    />
                  </dl>

                  <div className="mt-9 flex flex-wrap justify-center gap-3">
                    <Button onClick={addToCalendar}>
                      <CalendarPlus className="size-4" aria-hidden="true" />
                      {t.booking.addToCalendar}
                    </Button>
                    <Button variant="outline" onClick={reset}>
                      {t.booking.bookAnother}
                    </Button>
                  </div>
                </div>,
                "success",
              )
            : null}

          {/* --------------------------------------------------------- step 1 */}
          {!created && step === 0
            ? panel(
                <fieldset>
                  <legend className="mb-5 text-lg text-offwhite">
                    {t.booking.chooseService}
                  </legend>

                  <ul className="grid gap-3 sm:grid-cols-2">
                    {siteConfig.services.map((entry) => {
                      const selected = serviceId === entry.id;
                      return (
                        <li key={entry.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setServiceId(entry.id);
                              setSlot(null);
                            }}
                            aria-pressed={selected}
                            className={cn(
                              "flex w-full items-center gap-4 rounded-xl border p-4 text-start transition-colors",
                              selected
                                ? "border-gold bg-gold/10"
                                : "border-hairline hover:border-gold/60",
                            )}
                          >
                            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={asset(entry.image)}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-[0.98rem] text-offwhite">
                                {pick(entry.name)}
                              </span>
                              <span className="mt-1 block text-[0.78rem] text-muted">
                                {entry.durationMinutes} {t.common.minutes} ·{" "}
                                {formatPrice(entry.price, siteConfig.business.currencySymbol)}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>,
                "service",
              )
            : null}

          {/* --------------------------------------------------------- step 2 */}
          {!created && step === 1
            ? panel(
                <fieldset>
                  <legend className="mb-5 text-lg text-offwhite">
                    {t.booking.chooseBarber}
                  </legend>

                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setBarberId(ANY_BARBER);
                          setSlot(null);
                        }}
                        aria-pressed={barberId === ANY_BARBER}
                        className={cn(
                          "flex h-full w-full items-center gap-4 rounded-xl border p-4 text-start transition-colors",
                          barberId === ANY_BARBER
                            ? "border-gold bg-gold/10"
                            : "border-hairline hover:border-gold/60",
                        )}
                      >
                        <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-hairline">
                          <UserRound className="size-6 text-gold" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-[0.98rem] text-offwhite">
                            {t.booking.anyBarber}
                          </span>
                          <span className="mt-1 block text-[0.78rem] text-muted">
                            {t.booking.anyBarberNote}
                          </span>
                        </span>
                      </button>
                    </li>

                    {siteConfig.team
                      .filter(
                        (barber) =>
                          !serviceId ||
                          barber.serviceIds.length === 0 ||
                          barber.serviceIds.includes(serviceId),
                      )
                      .map((barber) => {
                        const selected = barberId === barber.id;
                        return (
                          <li key={barber.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setBarberId(barber.id);
                                setSlot(null);
                              }}
                              aria-pressed={selected}
                              className={cn(
                                "flex h-full w-full items-center gap-4 rounded-xl border p-4 text-start transition-colors",
                                selected
                                  ? "border-gold bg-gold/10"
                                  : "border-hairline hover:border-gold/60",
                              )}
                            >
                              <span className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={asset(barber.image)}
                                  alt=""
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </span>
                              <span>
                                <span className="block text-[0.98rem] text-offwhite">
                                  {pick(barber.name)}
                                </span>
                                <span className="mt-1 block text-[0.78rem] text-muted">
                                  {pick(barber.specialty)}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </fieldset>,
                "barber",
              )
            : null}

          {/* --------------------------------------------------------- step 3 */}
          {!created && step === 2
            ? panel(
                <div>
                  <h3 className="mb-4 text-lg text-offwhite">{t.booking.chooseDate}</h3>
                  <DateStrip
                    value={dateKey}
                    onChange={(next) => {
                      setDateKey(next);
                      setSlot(null);
                    }}
                  />

                  <h3 className="mt-8 mb-4 text-lg text-offwhite">{t.booking.chooseTime}</h3>
                  {dateKey ? (
                    <SlotGrid
                      slots={slots}
                      loading={loadingSlots}
                      closed={!isOpenOn(fromDateKey(dateKey).getDay() as 0)}
                      selected={slot?.startMinutes ?? null}
                      onSelect={setSlot}
                    />
                  ) : (
                    <p className="text-sm text-muted">{t.booking.chooseDate}</p>
                  )}
                </div>,
                "time",
              )
            : null}

          {/* --------------------------------------------------------- step 4 */}
          {!created && step === 3
            ? panel(
                <div className="max-w-xl">
                  <h3 className="mb-6 text-lg text-offwhite">{t.booking.yourDetails}</h3>

                  <div className="space-y-5">
                    <Field
                      id="booking-name"
                      label={t.booking.fullName}
                      value={form.name}
                      placeholder={t.booking.fullNamePlaceholder}
                      error={errors.name}
                      autoComplete="name"
                      onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                    />

                    <Field
                      id="booking-phone"
                      label={t.booking.phone}
                      value={form.phone}
                      placeholder={t.booking.phonePlaceholder}
                      hint={t.booking.phoneHint}
                      error={errors.phone}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
                    />

                    <Field
                      id="booking-email"
                      label={`${t.booking.email} (${t.booking.emailOptional})`}
                      value={form.email}
                      placeholder={t.booking.emailPlaceholder}
                      error={errors.email}
                      type="email"
                      autoComplete="email"
                      onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                    />

                    <div>
                      <label
                        htmlFor="booking-notes"
                        className="mb-2 block text-[0.72rem] uppercase tracking-[0.18em] text-muted"
                      >
                        {t.booking.notes} ({t.booking.notesOptional})
                      </label>
                      <textarea
                        id="booking-notes"
                        rows={3}
                        value={form.notes}
                        placeholder={t.booking.notesPlaceholder}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, notes: event.target.value }))
                        }
                        className="w-full rounded-xl border border-hairline bg-ink px-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>,
                "details",
              )
            : null}

          {/* --------------------------------------------------------- step 5 */}
          {!created && step === 4 && service && dateKey && slot
            ? panel(
                <div className="max-w-xl">
                  <h3 className="mb-6 text-lg text-offwhite">{t.booking.summary}</h3>

                  <dl className="space-y-2.5 rounded-xl border border-hairline bg-ink p-5 text-sm">
                    <SummaryRow label={t.booking.summaryService} value={pick(service.name)} />
                    <SummaryRow
                      label={t.booking.summaryBarber}
                      value={
                        chosenBarber
                          ? pick(chosenBarber.name)
                          : `${t.booking.anyBarber} · ${pick(
                              siteConfig.team.find((entry) => entry.id === slot.barberId)!.name,
                            )}`
                      }
                    />
                    <SummaryRow
                      label={t.booking.summaryWhen}
                      value={`${formattedDate(dateKey)} · ${minutesToTime(slot.startMinutes)}`}
                    />
                    <SummaryRow
                      label={t.booking.summaryDuration}
                      value={`${service.durationMinutes} ${t.common.minutes}`}
                    />
                    <SummaryRow
                      label={t.booking.summaryName}
                      value={form.name}
                    />
                    <SummaryRow label={t.booking.summaryPhone} value={form.phone} />
                    <SummaryRow
                      label={t.booking.summaryPrice}
                      value={formatPrice(service.price, siteConfig.business.currencySymbol)}
                      emphasis
                    />
                  </dl>

                  <Button
                    size="lg"
                    className="mt-7 w-full sm:w-auto"
                    onClick={confirm}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        {t.booking.confirming}…
                      </>
                    ) : (
                      t.booking.confirmButton
                    )}
                  </Button>
                </div>,
                "confirm",
              )
            : null}
        </AnimatePresence>

        {/* --------------------------------------------------------- controls */}
        {!created && (
          <div className="mt-9 flex items-center justify-between gap-3 border-t border-hairline pt-6">
            <Button
              variant="ghost"
              onClick={() => goTo(Math.max(step - 1, 0))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              {t.common.back}
            </Button>

            {step < 4 && (
              <Button onClick={handleNext} disabled={!canContinue()}>
                {t.common.next}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2.5 last:border-0 last:pb-0">
      <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className={cn("text-end", emphasis ? "font-display text-xl text-gold" : "text-cream")}>
        {value}
      </dd>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  hint,
  error,
  type = "text",
  inputMode,
  autoComplete,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  type?: string;
  inputMode?: "tel" | "email" | "text";
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[0.72rem] uppercase tracking-[0.18em] text-muted"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "w-full rounded-xl border bg-ink px-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:outline-none",
          error ? "border-red-500/60 focus:border-red-400" : "border-hairline focus:border-gold",
        )}
      />

      {hint && !error && (
        <p id={hintId} className="mt-2 text-[0.74rem] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[0.78rem] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default BookingWizard;
