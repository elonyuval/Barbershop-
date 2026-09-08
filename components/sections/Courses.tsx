"use client";

import { useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { AlertCircle, Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";
import { cn, formatPrice, isValidIsraeliPhone } from "@/lib/utils";
import type { Course } from "@/config/types";

function CourseIcon({ name }: { name: string }) {
  const Icon =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Scissors;
  return <Icon className="size-5 text-gold" aria-hidden="true" />;
}

export function Courses() {
  const { t, pick, dir } = useI18n();
  const { courses: config } = siteConfig;

  const grouped = useMemo(() => {
    const list = config.courses;
    return {
      beginner: list.filter((c) => c.level === "beginner"),
      advanced: list.filter((c) => c.level === "advanced"),
    };
  }, [config.courses]);

  if (!config.enabled || config.courses.length === 0) return null;

  return (
    <Section
      id="courses"
      eyebrow={t.courses.eyebrow}
      title={t.courses.title}
      lede={t.courses.lede}
    >
      {(["beginner", "advanced"] as const).map((level) =>
        grouped[level].length === 0 ? null : (
          <div key={level} className="mb-14 last:mb-0">
            <h3 className="mb-6 text-[0.72rem] uppercase tracking-[0.24em] text-gold">
              {t.courses.levels[level]}
            </h3>

            <ul className="grid gap-6 md:grid-cols-2">
              {grouped[level].map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </ul>
          </div>
        ),
      )}

      <LeadForm dir={dir} />
    </Section>
  );

  function CourseCard({ course, index }: { course: Course; index: number }) {
    return (
      <Reveal
        as="li"
        delay={index * 0.06}
        className="card-surface flex flex-col rounded-card p-6"
      >
        <div className="mb-3 flex items-center gap-3">
          <CourseIcon name={course.icon} />
          <h4 className="text-xl leading-tight text-offwhite">{pick(course.name)}</h4>
        </div>

        <p className="text-[0.92rem] leading-relaxed text-muted">
          {pick(course.summary)}
        </p>

        <ul className="mt-5 space-y-2">
          {course.highlights.map((highlight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[0.88rem] text-cream">
              <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{pick(highlight)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-hairline pt-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
              {t.courses.duration}
            </p>
            <p className="mt-1 text-[0.9rem] text-cream">{pick(course.duration)}</p>
          </div>
          <p className="text-lg text-gold">
            {course.price === null
              ? t.courses.priceOnRequest
              : formatPrice(course.price, siteConfig.business.currencySymbol)}
          </p>
        </div>
      </Reveal>
    );
  }
}

/**
 * DEMO LEAD FORM — this does not submit anywhere.
 *
 * It validates, shows a confirmation and then forgets everything: there is no
 * network request, no storage and no email. That is deliberate for a template,
 * but it means the form is NOT usable in production as it stands. Before a
 * client goes live it has to be wired to a real destination (a form service, an
 * API route, or the same Supabase project the booking system can use) and the
 * notice below removed once it genuinely sends.
 */
function LeadForm({ dir }: { dir: "ltr" | "rtl" }) {
  const { t, pick } = useI18n();
  const { courses } = siteConfig;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState(courses.courses[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [sent, setSent] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const next: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) next.name = t.courses.form.errors.name;
    if (!isValidIsraeliPhone(phone)) next.phone = t.courses.form.errors.phone;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Nothing is transmitted. See the note above this component.
    setSent(true);
    window.requestAnimationFrame(() => confirmationRef.current?.focus());
  };

  const reset = () => {
    setName("");
    setPhone("");
    setNote("");
    setErrors({});
    setSent(false);
  };

  return (
    <Reveal className="mt-16 rounded-card border border-hairline bg-ink p-5 sm:p-8">
      {sent ? (
        <div
          ref={confirmationRef}
          tabIndex={-1}
          role="status"
          className="text-center focus:outline-none"
        >
          <Check className="mx-auto mb-4 size-9 text-gold" aria-hidden="true" />
          <h3 className="text-2xl text-offwhite">{t.courses.form.successTitle}</h3>
          <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-relaxed text-muted">
            {t.courses.form.successBody}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full border border-gold/50 px-6 py-2.5 text-[0.8rem] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/10"
          >
            {t.courses.form.again}
          </button>
        </div>
      ) : (
        <>
          <h3 className="text-2xl text-offwhite">{t.courses.form.title}</h3>
          <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-muted">
            {t.courses.form.lede}
          </p>

          <p className="mt-5 flex items-start gap-3 rounded-xl border border-gold/25 bg-gold/5 p-4 text-[0.78rem] leading-relaxed text-gold/90">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t.courses.form.demoNotice}
          </p>

          <form onSubmit={submit} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              id="course-name"
              label={t.courses.form.name}
              value={name}
              placeholder={t.courses.form.namePlaceholder}
              autoComplete="name"
              error={errors.name}
              onChange={setName}
            />
            <Field
              id="course-phone"
              label={t.courses.form.phone}
              value={phone}
              placeholder={t.courses.form.phonePlaceholder}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              error={errors.phone}
              onChange={setPhone}
            />

            <div className="sm:col-span-2">
              <label
                htmlFor="course-pick"
                className="mb-2 block text-[0.72rem] uppercase tracking-[0.18em] text-muted"
              >
                {t.courses.form.course}
              </label>
              <select
                id="course-pick"
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                dir={dir}
                className="w-full rounded-xl border border-hairline bg-ink px-4 py-3 text-sm text-cream focus:border-gold focus:outline-none"
              >
                {courses.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {pick(course.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="course-note"
                className="mb-2 block text-[0.72rem] uppercase tracking-[0.18em] text-muted"
              >
                {t.courses.form.note}
              </label>
              <textarea
                id="course-note"
                value={note}
                rows={3}
                placeholder={t.courses.form.notePlaceholder}
                onChange={(event) => setNote(event.target.value)}
                className="w-full resize-y rounded-xl border border-hairline bg-ink px-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:border-gold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full rounded-full bg-gold px-8 py-3.5 text-[0.82rem] uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-90 sm:w-auto"
              >
                {t.courses.form.submit}
              </button>
            </div>
          </form>
        </>
      )}
    </Reveal>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
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
  error?: string;
  type?: string;
  inputMode?: "tel" | "email" | "text";
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
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
        aria-describedby={errorId}
        className={cn(
          "w-full rounded-xl border bg-ink px-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:outline-none",
          error ? "border-red-500/60 focus:border-red-400" : "border-hairline focus:border-gold",
        )}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[0.78rem] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default Courses;
