"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  solid:
    "bg-gold text-ink hover:bg-goldsoft border border-transparent shadow-[0_10px_30px_-12px_rgba(200,162,74,0.7)]",
  outline:
    "border border-hairline text-cream hover:border-gold hover:text-gold bg-transparent",
  ghost: "border border-transparent text-cream hover:text-gold bg-transparent",
  whatsapp:
    "border border-[#25d366]/40 text-[#7ee2a8] hover:bg-[#25d366] hover:text-ink bg-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "min-h-11 px-4 py-2.5 text-[0.7rem]",
  // 48px tall: comfortable as a touch target on a phone.
  md: "px-7 py-3.5 text-[0.74rem]",
  lg: "px-9 py-4 text-[0.8rem]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full uppercase tracking-[0.22em] " +
  "transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-45 " +
  "hover:-translate-y-px active:translate-y-0";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href">;

export function LinkButton({
  href,
  external,
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: LinkButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classes}
        {...(external || href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
