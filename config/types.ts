/**
 * Types backing config/siteConfig.ts.
 *
 * Every piece of business content on the site is described here, so a new
 * barbershop can be launched by editing one file rather than any component.
 */

/** A string that exists in both site languages. */
export type Localized = {
  en: string;
  he: string;
};

export type Language = "en" | "he";

/** 0 = Sunday … 6 = Saturday — matches JavaScript's Date.getDay(). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** "HH:mm" in 24h form, e.g. "09:30". */
export type TimeString = string;

export type TimeRange = {
  start: TimeString;
  end: TimeString;
};

export type BusinessDay = {
  weekday: Weekday;
  /** Empty array = closed that day. Several ranges = split shift. */
  ranges: TimeRange[];
};

export type Service = {
  id: string;
  name: Localized;
  description: Localized;
  /** Price in the currency configured on siteConfig.business.currency. */
  price: number;
  /** Chair time in minutes. Drives the booking slot maths. */
  durationMinutes: number;
  /** Any icon name exported by lucide-react. */
  icon: string;
  image: string;
  /** Highlighted in the services grid. */
  featured?: boolean;
};

export type Barber = {
  id: string;
  name: Localized;
  role: Localized;
  specialty: Localized;
  bio: Localized;
  image: string;
  /** Which services this barber performs. Empty array = all of them. */
  serviceIds: string[];
  /** Weekly working hours. Overrides nothing — it is intersected with opening hours. */
  availability: BusinessDay[];
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: Localized;
  category: "cuts" | "beards" | "shop" | "work";
  /** Rendered as a wide tile in the masonry grid. */
  wide?: boolean;
};

export type Testimonial = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: Localized;
  /** ISO date, shown as a relative month/year. */
  date: string;
};

export type Advantage = {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
};

export type VideoAsset = {
  /** MP4 (H.264) path under /public — the universally supported format.
   *  Leave empty to fall back to the poster image alone. */
  src: string;
  /** Optional WebM (VP9). Smaller than the MP4; browsers that support it
   *  pick it first, everything else falls through to `src`. */
  webm?: string;
  poster: string;
};

export type SiteConfig = {
  business: {
    name: string;
    /** Shown under the wordmark on the intro screen. */
    tagline: Localized;
    shortName: string;
    currency: string;
    currencySymbol: string;
    description: Localized;
    address: Localized;
    /** Used for the "navigate" button. */
    mapQuery: string;
    mapEmbedUrl: string;
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
    facebook: string;
    /** IANA timezone, used for all booking maths. */
    timezone: string;
  };

  brand: {
    /** Typographic logo is used when logoImage is empty. */
    logoImage: string;
    favicon: string;
    ogImage: string;
    colors: {
      /** Dark site shell. */
      background: string;
      surface: string;
      surfaceRaised: string;
      /** Warm accent — used sparingly, per the design language. */
      gold: string;
      goldSoft: string;
      cream: string;
      offWhite: string;
      muted: string;
      line: string;
      /** Barber pole stripes on the intro screen. */
      poleBlue: string;
      poleRed: string;
      poleWhite: string;
      /** Intro screen background — warm light grey, never pure white. */
      introBackground: string;
    };
  };

  intro: {
    enabled: boolean;
    /** false = the intro plays on every page load, handy while designing it. */
    showOncePerSession: boolean;
    /** Storage key for the once-per-session flag. */
    sessionKey: string;
    /** Milliseconds from first paint to the ENTER button appearing. */
    revealDurationMs: number;
    showSkipButton: boolean;
    wordmark: string;
    subtitle: Localized;
  };

  media: {
    heroVideo: VideoAsset;
    experienceVideo: VideoAsset;
  };

  booking: {
    /** Booking grid granularity in minutes. */
    slotIntervalMinutes: number;
    /** How soon from now a slot may be booked. */
    minimumNoticeHours: number;
    /** How far ahead the calendar opens. */
    maxAdvanceDays: number;
    /** Padding added after each appointment for clean-up. */
    bufferMinutes: number;
    confirmationPrefix: string;
  };

  hours: BusinessDay[];
  services: Service[];
  team: Barber[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  advantages: Advantage[];

  defaults: {
    language: Language;
    /** true = bookings live in localStorage. Auto-disabled once Supabase env vars exist. */
    demoMode: boolean;
  };
};
