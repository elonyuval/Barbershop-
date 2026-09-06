import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

/**
 * The standard section frame: generous vertical rhythm, a gold eyebrow, a
 * display-serif heading and an optional lede.
 */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  className,
  contentClassName,
  align = "start",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center";
}) {
  return (
    <section
      id={id}
      className={cn("relative px-5 py-20 sm:px-8 md:py-28 lg:px-12", className)}
    >
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title || lede) && (
          <Reveal className={cn("mb-12 md:mb-16", align === "center" && "text-center")}>
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h2 className="max-w-3xl text-balance text-[clamp(1.9rem,5vw,3.1rem)] leading-[1.1]">
                {title}
              </h2>
            )}
            {lede && (
              <p
                className={cn(
                  "mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-muted",
                  align === "center" && "mx-auto",
                )}
              >
                {lede}
              </p>
            )}
          </Reveal>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
}

export default Section;
