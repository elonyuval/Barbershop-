import type { SiteConfig } from "./types";

/**
 * ---------------------------------------------------------------------------
 * MODA BARBER CLUB — single source of truth
 * ---------------------------------------------------------------------------
 * Everything a shop owner would want to change lives in this one file: name,
 * colours, services, prices, team, hours, contact details, media and the
 * behaviour of the opening screen. No component hard-codes business content.
 *
 * To rebrand for another barbershop:
 *   1. Edit `business`, `brand.colors` and `intro.wordmark`.
 *   2. Replace the files under /public/media (see ASSET-GUIDE.md).
 *   3. Rewrite `services`, `team`, `hours`, `gallery`, `testimonials`.
 * Nothing else needs to be touched.
 *
 * NOTE: every person, review, address and phone number below is DEMO CONTENT
 * created for this template. Replace all of it before a client goes live.
 * ---------------------------------------------------------------------------
 */

const WEEK_DAYS = [0, 1, 2, 3, 4] as const; // Sunday–Thursday

/** Helper so team rotas stay readable further down. */
const rota = (
  weekdays: readonly number[],
  start: string,
  end: string,
) =>
  weekdays.map((weekday) => ({
    weekday: weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    ranges: [{ start, end }],
  }));

export const siteConfig: SiteConfig = {
  business: {
    name: "MODA BARBER CLUB",
    shortName: "MODA",
    tagline: {
      en: "Classic Gentlemen's Barber",
      he: "מספרת ג'נטלמנים קלאסית",
    },
    currency: "ILS",
    currencySymbol: "₪",
    description: {
      en: "An upscale men's barbershop — precision cuts, beard design and hot-towel shaves, by appointment.",
      he: "מספרת גברים יוקרתית — תספורות מדויקות, עיצוב זקן וגילוח מגבת חמה, בתיאום מראש.",
    },
    // DEMO address — replace with the client's real one.
    address: {
      en: "14 Ha'Arba St, Tel Aviv-Yafo",
      he: "הארבעה 14, תל אביב-יפו",
    },
    mapQuery: "HaArba'a St 14, Tel Aviv-Yafo",
    mapEmbedUrl:
      "https://www.google.com/maps?q=HaArba%27a+St+14+Tel+Aviv&output=embed",
    // DEMO contact details — replace before launch.
    phone: "+972-3-555-0140",
    whatsapp: "972355501400",
    email: "hello@modabarber.demo",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    timezone: "Asia/Jerusalem",
  },

  brand: {
    logoImage: "", // empty → the typographic MODA wordmark is used
    favicon: "/favicon.svg",
    ogImage: "/media/brand/og-image.jpg",
    colors: {
      background: "#0c0a09",
      surface: "#141210",
      surfaceRaised: "#1c1917",
      gold: "#c8a24a",
      goldSoft: "#e2c98a",
      cream: "#f1e9dc",
      offWhite: "#faf7f2",
      muted: "#a8a29e",
      line: "rgba(241, 233, 220, 0.12)",
      poleBlue: "#14367e",
      poleRed: "#cc2027",
      poleWhite: "#f6f4f0",
      introBackground: "#e8e3da",
    },
  },

  intro: {
    enabled: true,
    /**
     * The barber pole is a 3D product film rendered in Blender — real
     * geometry, real chrome, real reflections. One 9:16 master serves every
     * screen: the film is shot on a flat ivory field, and `background` is that
     * exact same ivory, so letterboxing a portrait clip on a wide screen is
     * invisible rather than a compromise.
     */
    video: {
      src: "/media/video/intro-pole.mp4",
      webm: "/media/video/intro-pole.webm",
      poster: "/media/video/intro-pole-poster.jpg",
      /** Sampled from the render. Must match it exactly or the edges show. */
      background: "#eae4d9",
    },
    showOncePerSession: true,
    sessionKey: "moda:intro-seen",
    showSkipButton: true,
    wordmark: "MODA",
    subtitle: {
      en: "Classic Gentlemen's Barber",
      he: "מספרת ג'נטלמנים קלאסית",
    },
  },

  // Set `src` to "" to fall back to the poster image alone, with a slow drift —
  // useful while a replacement clip is being shot. See ASSET-GUIDE.md.
  media: {
    heroVideo: {
      src: "/media/video/hero-barbershop.mp4",
      webm: "/media/video/hero-barbershop.webm",
      poster: "/media/video/hero-barbershop-poster.jpg",
    },
    experienceVideo: {
      src: "/media/video/experience-tools.mp4",
      webm: "/media/video/experience-tools.webm",
      poster: "/media/video/experience-tools-poster.jpg",
    },
  },

  booking: {
    slotIntervalMinutes: 15,
    minimumNoticeHours: 2,
    maxAdvanceDays: 45,
    bufferMinutes: 5,
    confirmationPrefix: "MODA",
  },

  // Opening hours. An empty `ranges` array means closed.
  hours: [
    { weekday: 0, ranges: [{ start: "09:00", end: "20:00" }] },
    { weekday: 1, ranges: [{ start: "09:00", end: "20:00" }] },
    { weekday: 2, ranges: [{ start: "09:00", end: "20:00" }] },
    { weekday: 3, ranges: [{ start: "09:00", end: "21:00" }] },
    { weekday: 4, ranges: [{ start: "09:00", end: "21:00" }] },
    { weekday: 5, ranges: [{ start: "08:00", end: "14:00" }] },
    { weekday: 6, ranges: [] },
  ],

  services: [
    {
      id: "mens-cut",
      name: { en: "Men's Haircut", he: "תספורת גבר" },
      description: {
        en: "Consultation, precision cut, wash and a finished style.",
        he: "ייעוץ, תספורת מדויקת, חפיפה וסידור סופי.",
      },
      price: 110,
      durationMinutes: 45,
      icon: "Scissors",
      image: "/media/gallery/cut-fade.jpg",
      featured: true,
    },
    {
      id: "cut-beard",
      name: { en: "Haircut & Beard", he: "תספורת וזקן" },
      description: {
        en: "A full reset: haircut, beard shaping and a hot-towel finish.",
        he: "טיפול מלא: תספורת, עיצוב זקן וסיום במגבת חמה.",
      },
      price: 160,
      durationMinutes: 60,
      icon: "UserRound",
      image: "/media/gallery/beard-line.jpg",
      featured: true,
    },
    {
      id: "beard-design",
      name: { en: "Beard Design", he: "עיצוב זקן" },
      description: {
        en: "Razor-defined lines, balanced shape and beard oil.",
        he: "קווים מדויקים בסכין, איזון הצורה ושמן זקן.",
      },
      price: 70,
      durationMinutes: 30,
      icon: "Sparkles",
      image: "/media/gallery/tools-flatlay.jpg",
    },
    {
      id: "kids-cut",
      name: { en: "Kids' Haircut", he: "תספורת ילדים" },
      description: {
        en: "Patient, unhurried cuts for ages 3–12.",
        he: "תספורת סבלנית ונינוחה לגילאי 3–12.",
      },
      price: 80,
      durationMinutes: 30,
      icon: "Baby",
      image: "/media/gallery/shop-interior.jpg",
    },
    {
      id: "grooming-facial",
      name: { en: "Grooming & Facial", he: "גרומינג וטיפול פנים" },
      description: {
        en: "Deep cleanse, steam, mask and brow tidy.",
        he: "ניקוי עמוק, אדים, מסכה וסידור גבות.",
      },
      price: 180,
      durationMinutes: 60,
      icon: "Droplets",
      image: "/media/gallery/hot-towel.jpg",
    },
    {
      id: "groom-package",
      name: { en: "Groom's Package", he: "חבילת חתן" },
      description: {
        en: "Two hours before the big day: cut, shave, facial and styling.",
        he: "שעתיים לפני היום הגדול: תספורת, גילוח, טיפול פנים וסטיילינג.",
      },
      price: 450,
      durationMinutes: 120,
      icon: "Crown",
      image: "/media/gallery/leather-chair.jpg",
      featured: true,
    },
  ],

  // DEMO team — AI-generated portraits and invented names. Replace before launch.
  team: [
    {
      id: "adam",
      name: { en: "Adam Levi", he: "אדם לוי" },
      role: { en: "Master Barber & Owner", he: "ספר ראשי ובעלים" },
      specialty: { en: "Scissor work & classic cuts", he: "עבודת מספריים ותספורות קלאסיות" },
      bio: {
        en: "Eighteen years behind the chair. Adam opened MODA to bring old-school barbering back to a room worth sitting in.",
        he: "שמונה עשרה שנים מאחורי הכיסא. אדם פתח את MODA כדי להחזיר ספרות בסגנון הישן לחלל שנעים לשבת בו.",
      },
      image: "/media/team/barber-1.jpg",
      serviceIds: [],
      availability: [...rota(WEEK_DAYS, "09:00", "18:00"), { weekday: 5, ranges: [{ start: "08:00", end: "14:00" }] }],
    },
    {
      id: "noam",
      name: { en: "Noam Azoulay", he: "נועם אזולאי" },
      role: { en: "Senior Barber", he: "ספר בכיר" },
      specialty: { en: "Skin fades & modern texture", he: "פייד עורי וטקסטורה מודרנית" },
      bio: {
        en: "The fastest clean fade in the room, and the most patient with first-timers.",
        he: "הפייד הנקי המהיר ביותר במקום, והסבלני ביותר עם מי שמגיע בפעם הראשונה.",
      },
      image: "/media/team/barber-2.jpg",
      serviceIds: [],
      availability: rota([0, 1, 2, 3, 4], "12:00", "21:00"),
    },
    {
      id: "yaron",
      name: { en: "Yaron Mizrahi", he: "ירון מזרחי" },
      role: { en: "Barber & Shave Specialist", he: "ספר ומומחה גילוח" },
      specialty: { en: "Straight razor & hot towel", he: "סכין גילוח ומגבת חמה" },
      bio: {
        en: "Trained in traditional wet shaving. Yaron treats a shave as a twenty-minute break from the week.",
        he: "הוכשר בגילוח רטוב מסורתי. ירון מתייחס לגילוח כאל הפסקה של עשרים דקות מהשבוע.",
      },
      image: "/media/team/barber-3.jpg",
      serviceIds: [],
      availability: [...rota([0, 2, 3, 4], "09:00", "17:00"), { weekday: 5, ranges: [{ start: "08:00", end: "13:00" }] }],
    },
    {
      id: "eitan",
      name: { en: "Eitan Shalev", he: "איתן שלו" },
      role: { en: "Barber", he: "ספר" },
      specialty: { en: "Kids' cuts & beard design", he: "תספורות ילדים ועיצוב זקן" },
      bio: {
        en: "Endless patience, a steady hand, and the sticker drawer every parent hopes for.",
        he: "סבלנות אינסופית, יד יציבה, ומגירת המדבקות שכל הורה מקווה לה.",
      },
      image: "/media/team/barber-4.jpg",
      serviceIds: [],
      availability: rota([1, 2, 3, 4], "10:00", "19:00"),
    },
  ],

  gallery: [
    {
      id: "g1",
      src: "/media/gallery/cut-fade.jpg",
      alt: { en: "A finished skin fade seen from behind", he: "פייד עורי מוגמר במבט מאחור" },
      category: "cuts",
    },
    {
      id: "g2",
      src: "/media/gallery/beard-line.jpg",
      alt: { en: "Beard line-up with a straight razor", he: "סידור קו הזקן בסכין גילוח" },
      category: "beards",
    },
    {
      id: "g3",
      src: "/media/gallery/shop-interior.jpg",
      alt: { en: "The shop floor with two leather chairs", he: "חלל המספרה עם שני כיסאות עור" },
      category: "shop",
      wide: true,
    },
    {
      id: "g4",
      src: "/media/gallery/leather-chair.jpg",
      alt: { en: "Vintage leather barber chair detail", he: "פרט מכיסא ספרות עור וינטג'" },
      category: "shop",
    },
    {
      id: "g5",
      src: "/media/gallery/tools-flatlay.jpg",
      alt: { en: "Clippers, scissors and razor on marble", he: "מכונה, מספריים וסכין על שיש" },
      category: "work",
    },
    {
      id: "g6",
      src: "/media/gallery/hot-towel.jpg",
      alt: { en: "A hot towel steaming in a metal tray", he: "מגבת חמה מהבילה במגש מתכת" },
      category: "work",
    },
    {
      id: "g7",
      src: "/media/gallery/at-work.jpg",
      alt: { en: "A barber at work, seen from behind", he: "ספר בעבודה, במבט מאחור" },
      category: "work",
      wide: true,
    },
  ],

  // DEMO REVIEWS — written for this template, not real customers.
  // Replace with genuine reviews (or remove the section) before launch.
  testimonials: [
    {
      id: "t1",
      author: "Daniel R.",
      rating: 5,
      quote: {
        en: "First time in years I have left a barbershop without needing to fix anything at home.",
        he: "בפעם הראשונה מזה שנים יצאתי ממספרה בלי צורך לתקן משהו בבית.",
      },
      date: "2026-06-14",
    },
    {
      id: "t2",
      author: "Ofir M.",
      rating: 5,
      quote: {
        en: "Booked at 21:40, sat in the chair the next morning. The whole thing took me forty seconds.",
        he: "קבעתי תור ב-21:40, ישבתי בכיסא למחרת בבוקר. כל התהליך לקח לי ארבעים שניות.",
      },
      date: "2026-05-30",
    },
    {
      id: "t3",
      author: "Sagi B.",
      rating: 5,
      quote: {
        en: "They start on time. As someone who books on a lunch break, that alone is worth it.",
        he: "מתחילים בזמן. בתור מישהו שקובע בהפסקת צהריים, זה לבד שווה את זה.",
      },
      date: "2026-05-02",
    },
    {
      id: "t4",
      author: "Ilan K.",
      rating: 5,
      quote: {
        en: "Took my son for his first proper cut. Eitan had him laughing within a minute.",
        he: "הבאתי את הבן שלי לתספורת רצינית ראשונה. איתן הצחיק אותו תוך דקה.",
      },
      date: "2026-04-19",
    },
    {
      id: "t5",
      author: "Tom A.",
      rating: 4,
      quote: {
        en: "The hot-towel shave is the part of my month I actually look forward to.",
        he: "הגילוח עם המגבת החמה הוא החלק בחודש שאני באמת מחכה לו.",
      },
      date: "2026-03-27",
    },
  ],

  advantages: [
    {
      id: "a1",
      icon: "Award",
      title: { en: "Barbers, not stylists", he: "ספרים, לא סטייליסטים" },
      description: {
        en: "Every barber here trained on men's hair specifically — clippers, scissors and a razor.",
        he: "כל ספר כאן הוכשר ספציפית בשיער גברי — מכונה, מספריים וסכין.",
      },
    },
    {
      id: "a2",
      icon: "Clock",
      title: { en: "We start on time", he: "מתחילים בזמן" },
      description: {
        en: "One chair, one client. Your slot is held for you, not overbooked.",
        he: "כיסא אחד, לקוח אחד. התור שלכם שמור, בלי הזמנות כפולות.",
      },
    },
    {
      id: "a3",
      icon: "Handshake",
      title: { en: "A cut that fits you", he: "תספורת שמתאימה לכם" },
      description: {
        en: "Every appointment opens with a two-minute consultation, not an assumption.",
        he: "כל תור נפתח בייעוץ של שתי דקות, לא בהנחה.",
      },
    },
    {
      id: "a4",
      icon: "Sparkles",
      title: { en: "Professional-grade kit", he: "ציוד מקצועי" },
      description: {
        en: "Sanitised tools, fresh linen and products we would use ourselves.",
        he: "כלים מעוקרים, מגבות נקיות ומוצרים שהיינו משתמשים בהם בעצמנו.",
      },
    },
    {
      id: "a5",
      icon: "Armchair",
      title: { en: "A room worth sitting in", he: "חלל שנעים לשבת בו" },
      description: {
        en: "Warm light, dark wood, good music and an espresso while you wait.",
        he: "תאורה חמה, עץ כהה, מוזיקה טובה ואספרסו בזמן ההמתנה.",
      },
    },
    {
      id: "a6",
      icon: "CalendarCheck",
      title: { en: "Booking in four taps", he: "תור בארבע לחיצות" },
      description: {
        en: "Pick a service, a barber and a time. No phone calls, no waiting on hold.",
        he: "בוחרים שירות, ספר ושעה. בלי טלפונים ובלי המתנה על הקו.",
      },
    },
  ],

  defaults: {
    // The demo is for Israeli barbershops, so Hebrew (RTL) is what a visitor
    // lands on. Switch to "en" for an English-first shop.
    language: "he",
    demoMode: true,
  },
};

export default siteConfig;
