import type { Metadata, Viewport } from "next";
import { Heebo, Inter, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/config/siteConfig";
import { dictionaries } from "@/content";
import { BookingPrefillProvider } from "@/lib/bookingPrefill";
import { I18nProvider } from "@/lib/i18n";
import { asset } from "@/lib/paths";
import { buildLocalBusinessSchema } from "@/lib/schema";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const defaultDictionary = dictionaries[siteConfig.defaults.language];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultDictionary.meta.title,
    template: `%s · ${siteConfig.business.name}`,
  },
  description: defaultDictionary.meta.description,
  applicationName: siteConfig.business.name,
  keywords: [
    "barbershop",
    "men's haircut",
    "beard trim",
    "hot towel shave",
    "Tel Aviv barber",
    "מספרת גברים",
    "תספורת גבר",
  ],
  openGraph: {
    type: "website",
    siteName: siteConfig.business.name,
    title: defaultDictionary.meta.title,
    description: defaultDictionary.meta.description,
    url: siteUrl,
    images: [{ url: asset(siteConfig.brand.ogImage), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultDictionary.meta.title,
    description: defaultDictionary.meta.description,
    images: [asset(siteConfig.brand.ogImage)],
  },
  icons: { icon: asset(siteConfig.brand.favicon) },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: siteConfig.brand.colors.background,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** siteConfig.brand.colors → the CSS variables the whole design system reads. */
const brandVariables: Record<string, string> = {
  "--color-ink": siteConfig.brand.colors.background,
  "--color-surface": siteConfig.brand.colors.surface,
  "--color-raised": siteConfig.brand.colors.surfaceRaised,
  "--color-gold": siteConfig.brand.colors.gold,
  "--color-goldsoft": siteConfig.brand.colors.goldSoft,
  "--color-cream": siteConfig.brand.colors.cream,
  "--color-offwhite": siteConfig.brand.colors.offWhite,
  "--color-muted": siteConfig.brand.colors.muted,
  "--color-hairline": siteConfig.brand.colors.line,
  "--color-intro": siteConfig.brand.colors.introBackground,
  "--pole-blue": siteConfig.brand.colors.poleBlue,
  "--pole-red": siteConfig.brand.colors.poleRed,
  "--pole-white": siteConfig.brand.colors.poleWhite,
};

/**
 * Runs before first paint. Decides whether the opening screen is due, so a
 * returning visitor never sees a flash of it, and paints the correct
 * background colour immediately instead of a white gap.
 */
const introBootScript = `
(function(){
  try{
    var seen = ${siteConfig.intro.showOncePerSession} &&
      window.sessionStorage.getItem(${JSON.stringify(siteConfig.intro.sessionKey)});
    var due = ${siteConfig.intro.enabled} && !seen;
    document.documentElement.setAttribute("data-intro", due ? "pending" : "seen");
    if (due) { document.documentElement.style.backgroundColor = ${JSON.stringify(
      siteConfig.brand.colors.introBackground,
    )}; }
  } catch (error) {
    document.documentElement.setAttribute("data-intro", "pending");
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={siteConfig.defaults.language}
      dir={siteConfig.defaults.language === "he" ? "rtl" : "ltr"}
      className={`${playfair.variable} ${inter.variable} ${heebo.variable}`}
      style={brandVariables as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
        <style>{`html[data-intro="seen"] .intro-root{display:none!important}`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildLocalBusinessSchema(siteUrl)),
          }}
        />
      </head>
      <body className="antialiased">
        <I18nProvider>
          <BookingPrefillProvider>{children}</BookingPrefillProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
