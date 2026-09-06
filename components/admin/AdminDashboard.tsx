"use client";

import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Check,
  Loader2,
  Phone,
  ShieldAlert,
  Trash2,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/siteConfig";
import {
  BOOKINGS_CHANGED,
  getBookingStore,
  isDemoStorage,
  type Appointment,
  type AppointmentStatus,
  type BlockedTime,
} from "@/lib/booking";
import { useI18n } from "@/lib/i18n";
import {
  addDays,
  cn,
  formatPrice,
  fromDateKey,
  minutesToTime,
  startOfDay,
  timeToMinutes,
  toDateKey,
} from "@/lib/utils";

type View = "day" | "week";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmed: "border-gold/40 bg-gold/10 text-gold",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-300",
  no_show: "border-orange-500/40 bg-orange-500/10 text-orange-300",
};

/**
 * DEMO ADMIN — there is no authentication here on purpose: it exists so a
 * prospective client can see what the back office feels like.
 *
 * Before any real deployment this page must be put behind real auth (Supabase
 * Auth with an admin role, or a server-side session), and the Supabase RLS
 * policies in supabase/migrations/0001_init.sql must be tightened so anonymous
 * visitors cannot read customer data.
 */
export function AdminDashboard() {
  const { t, pick } = useI18n();
  const store = useMemo(() => getBookingStore(), []);

  const [view, setView] = useState<View>("day");
  const [anchor, setAnchor] = useState(() => toDateKey(startOfDay(new Date())));
  const [barberFilter, setBarberFilter] = useState<string>("all");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);

  const [blockForm, setBlockForm] = useState({
    date: toDateKey(startOfDay(new Date())),
    start: "13:00",
    end: "14:00",
    barberId: "all",
    reason: "",
  });

  const range = useMemo(() => {
    const from = fromDateKey(anchor);
    return view === "day"
      ? { from: anchor, to: anchor }
      : { from: anchor, to: toDateKey(addDays(from, 6)) };
  }, [anchor, view]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextAppointments, nextBlocks] = await Promise.all([
        store.listAppointments(range.from, range.to),
        store.listBlocks(range.from, range.to),
      ]);
      setAppointments(nextAppointments);
      setBlocks(nextBlocks);
    } finally {
      setLoading(false);
    }
  }, [store, range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onChange = () => void load();
    window.addEventListener(BOOKINGS_CHANGED, onChange);
    return () => window.removeEventListener(BOOKINGS_CHANGED, onChange);
  }, [load]);

  const visible = appointments
    .filter((entry) => barberFilter === "all" || entry.barberId === barberFilter)
    .sort((a, b) =>
      a.date === b.date ? a.startMinutes - b.startMinutes : a.date.localeCompare(b.date),
    );

  const activeCount = visible.filter((entry) => entry.status !== "cancelled").length;
  const revenue = visible
    .filter((entry) => entry.status !== "cancelled" && entry.status !== "no_show")
    .reduce((total, entry) => total + entry.price, 0);

  const serviceName = (id: string) => {
    const service = siteConfig.services.find((entry) => entry.id === id);
    return service ? pick(service.name) : id;
  };

  const barberName = (id: string) => {
    const barber = siteConfig.team.find((entry) => entry.id === id);
    return barber ? pick(barber.name) : id;
  };

  const setStatus = async (id: string, status: AppointmentStatus) => {
    if (status === "cancelled" && !window.confirm(t.admin.cancelConfirm)) return;
    await store.updateStatus(id, status);
    await load();
  };

  const addBlock = async (event: React.FormEvent) => {
    event.preventDefault();
    const start = timeToMinutes(blockForm.start);
    const end = timeToMinutes(blockForm.end);
    if (end <= start) return;

    await store.createBlock({
      barberId: blockForm.barberId === "all" ? null : blockForm.barberId,
      date: blockForm.date,
      startMinutes: start,
      endMinutes: end,
      reason: blockForm.reason.trim(),
    });
    setBlockForm((current) => ({ ...current, reason: "" }));
    await load();
  };

  const dayLabel = (key: string) => {
    const date = fromDateKey(key);
    return `${t.weekdays.long[date.getDay()]}, ${date.getDate()} ${t.months[date.getMonth()]}`;
  };

  return (
    <div className="min-h-screen bg-ink px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{t.admin.subtitle}</p>
            <h1 className="mt-2 text-[clamp(1.7rem,4vw,2.6rem)] text-offwhite">
              {t.admin.title}
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] text-muted transition-colors hover:border-gold hover:text-gold"
          >
            <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            {t.admin.backToSite}
          </Link>
        </header>

        <p className="mb-8 flex items-start gap-3 rounded-card border border-red-500/40 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          {t.admin.demoWarning}
        </p>

        {/* --- toolbar --- */}
        <div className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-hairline bg-surface p-4">
          <div className="flex rounded-full border border-hairline p-1">
            {(["day", "week"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={view === option}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                  view === option ? "bg-gold text-ink" : "text-muted hover:text-gold",
                )}
              >
                {option === "day" ? t.admin.day : t.admin.week}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
              <CalendarDays className="me-1 inline size-3.5" aria-hidden="true" />
              {t.admin.blockDate}
            </span>
            <input
              type="date"
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
              className="rounded-xl border border-hairline bg-ink px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
              {t.admin.filterBarber}
            </span>
            <select
              value={barberFilter}
              onChange={(event) => setBarberFilter(event.target.value)}
              className="rounded-xl border border-hairline bg-ink px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
            >
              <option value="all">{t.admin.allBarbers}</option>
              {siteConfig.team.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {pick(barber.name)}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="outline"
            size="sm"
            className="ms-auto"
            onClick={() => setAnchor(toDateKey(startOfDay(new Date())))}
          >
            {t.admin.today}
          </Button>
        </div>

        {/* --- stats --- */}
        <dl className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="card-surface rounded-card p-5">
            <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">
              {t.admin.total}
            </dt>
            <dd className="mt-2 font-display text-3xl text-offwhite">{activeCount}</dd>
          </div>
          <div className="card-surface rounded-card p-5">
            <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">
              {t.admin.revenue}
            </dt>
            <dd className="mt-2 font-display text-3xl text-gold">
              {formatPrice(revenue, siteConfig.business.currencySymbol)}
            </dd>
          </div>
          <div className="card-surface rounded-card p-5">
            <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">
              {t.admin.storageMode}
            </dt>
            <dd className="mt-2 text-lg text-cream">
              {isDemoStorage ? t.admin.storageDemo : t.admin.storageSupabase}
            </dd>
          </div>
        </dl>

        {/* --- appointments --- */}
        <section className="rounded-card border border-hairline bg-surface">
          {loading ? (
            <p className="flex items-center gap-3 p-8 text-sm text-muted">
              <Loader2 className="size-4 animate-spin text-gold" aria-hidden="true" />
              {t.common.loading}…
            </p>
          ) : visible.length === 0 ? (
            <p className="p-8 text-sm text-muted">{t.admin.noAppointments}</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {visible.map((appointment) => (
                <li key={appointment.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                  <div className="w-24 shrink-0">
                    <p className="font-display text-xl tabular-nums text-offwhite">
                      {minutesToTime(appointment.startMinutes)}
                    </p>
                    <p className="text-[0.66rem] text-muted">
                      {view === "week"
                        ? dayLabel(appointment.date)
                        : `${appointment.durationMinutes} ${t.common.minutes}`}
                    </p>
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <p className="text-[0.98rem] text-offwhite">{appointment.customerName}</p>
                    <p className="mt-0.5 text-[0.8rem] text-muted">
                      {serviceName(appointment.serviceId)} · {barberName(appointment.barberId)}
                    </p>
                    {appointment.notes && (
                      <p className="mt-1.5 text-[0.78rem] text-muted/80 italic">
                        “{appointment.notes}”
                      </p>
                    )}
                  </div>

                  <a
                    href={`tel:${appointment.customerPhone}`}
                    className="inline-flex items-center gap-2 text-[0.8rem] text-muted transition-colors hover:text-gold"
                  >
                    <Phone className="size-3.5" aria-hidden="true" />
                    {appointment.customerPhone}
                  </a>

                  <p className="w-20 text-end font-display text-lg text-gold">
                    {formatPrice(appointment.price, siteConfig.business.currencySymbol)}
                  </p>

                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em]",
                      STATUS_STYLES[appointment.status],
                    )}
                  >
                    {t.admin[
                      appointment.status === "no_show"
                        ? "noShow"
                        : (appointment.status as "confirmed" | "completed" | "cancelled")
                    ]}
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatus(appointment.id, "completed")}
                      disabled={appointment.status === "completed"}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-emerald-400 hover:text-emerald-300 disabled:opacity-30"
                      aria-label={t.admin.markCompleted}
                      title={t.admin.markCompleted}
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(appointment.id, "no_show")}
                      disabled={appointment.status === "no_show"}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-orange-400 hover:text-orange-300 disabled:opacity-30"
                      aria-label={t.admin.markNoShow}
                      title={t.admin.markNoShow}
                    >
                      <UserX className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(appointment.id, "cancelled")}
                      disabled={appointment.status === "cancelled"}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-red-400 hover:text-red-300 disabled:opacity-30"
                      aria-label={t.admin.cancel}
                      title={t.admin.cancel}
                    >
                      <Ban className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* --- blocked times --- */}
        <section className="mt-8 rounded-card border border-hairline bg-surface p-5">
          <h2 className="text-lg text-offwhite">{t.admin.blockedTimes}</h2>

          <form onSubmit={addBlock} className="mt-5 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                {t.admin.blockDate}
              </span>
              <input
                type="date"
                required
                value={blockForm.date}
                onChange={(event) =>
                  setBlockForm((current) => ({ ...current, date: event.target.value }))
                }
                className="rounded-xl border border-hairline bg-ink px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                {t.admin.blockFrom}
              </span>
              <input
                type="time"
                required
                value={blockForm.start}
                onChange={(event) =>
                  setBlockForm((current) => ({ ...current, start: event.target.value }))
                }
                className="rounded-xl border border-hairline bg-ink px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                {t.admin.blockTo}
              </span>
              <input
                type="time"
                required
                value={blockForm.end}
                onChange={(event) =>
                  setBlockForm((current) => ({ ...current, end: event.target.value }))
                }
                className="rounded-xl border border-hairline bg-ink px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                {t.admin.filterBarber}
              </span>
              <select
                value={blockForm.barberId}
                onChange={(event) =>
                  setBlockForm((current) => ({ ...current, barberId: event.target.value }))
                }
                className="rounded-xl border border-hairline bg-ink px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
              >
                <option value="all">{t.admin.allBarbers}</option>
                {siteConfig.team.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {pick(barber.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                {t.admin.blockReason}
              </span>
              <input
                type="text"
                value={blockForm.reason}
                placeholder={t.admin.blockReasonPlaceholder}
                onChange={(event) =>
                  setBlockForm((current) => ({ ...current, reason: event.target.value }))
                }
                className="rounded-xl border border-hairline bg-ink px-3 py-2.5 text-sm text-cream placeholder:text-muted/50 focus:border-gold focus:outline-none"
              />
            </label>

            <Button type="submit" size="sm">
              {t.admin.addBlock}
            </Button>
          </form>

          {blocks.length === 0 ? (
            <p className="mt-5 text-sm text-muted">{t.admin.noBlocks}</p>
          ) : (
            <ul className="mt-5 divide-y divide-hairline border-t border-hairline">
              {blocks.map((block) => (
                <li key={block.id} className="flex items-center gap-4 py-3 text-sm">
                  <span className="text-cream tabular-nums">
                    {dayLabel(block.date)} · {minutesToTime(block.startMinutes)}–
                    {minutesToTime(block.endMinutes)}
                  </span>
                  <span className="text-muted">
                    {block.barberId ? barberName(block.barberId) : t.admin.allBarbers}
                  </span>
                  {block.reason && <span className="text-muted/80 italic">{block.reason}</span>}

                  <button
                    type="button"
                    onClick={async () => {
                      await store.deleteBlock(block.id);
                      await load();
                    }}
                    className="ms-auto inline-flex size-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-red-400 hover:text-red-300"
                    aria-label={t.admin.removeBlock}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
