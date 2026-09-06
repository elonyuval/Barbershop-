"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: string[];
  current: number;
  /** Only fired for steps already completed, so nobody can skip ahead. */
  onStepClick: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => done && onStepClick(index)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                active && "border-gold bg-gold/10 text-gold",
                done && "border-hairline text-cream hover:border-gold hover:text-gold",
                !active && !done && "border-hairline/60 text-muted/60",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[0.6rem]",
                  active ? "bg-gold text-ink" : done ? "bg-cream/20" : "bg-cream/10",
                )}
              >
                {done ? <Check className="size-3" aria-hidden="true" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>

            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "hidden h-px w-5 sm:block",
                  done ? "bg-gold/50" : "bg-hairline",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default Stepper;
