import { siteConfig } from "@/config/siteConfig";
import { dictionaries } from "@/content";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * schema.org HairSalon, generated from siteConfig so it never drifts from the
 * hours and prices shown on the page.
 */
export function buildLocalBusinessSchema(siteUrl: string) {
  const dictionary = dictionaries[siteConfig.defaults.language];

  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${siteUrl}#business`,
    name: siteConfig.business.name,
    description: dictionary.meta.description,
    url: siteUrl,
    telephone: siteConfig.business.phone,
    email: siteConfig.business.email,
    image: `${siteUrl}${siteConfig.brand.ogImage}`,
    priceRange: "₪₪",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.business.address.en,
      addressLocality: "Tel Aviv-Yafo",
      addressCountry: "IL",
    },
    sameAs: [siteConfig.business.instagram, siteConfig.business.facebook],
    openingHoursSpecification: siteConfig.hours
      .filter((day) => day.ranges.length > 0)
      .flatMap((day) =>
        day.ranges.map((range) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${DAY_NAMES[day.weekday]}`,
          opens: range.start,
          closes: range.end,
        })),
      ),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: dictionary.services.title,
      itemListElement: siteConfig.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name.en,
          description: service.description.en,
        },
        price: service.price,
        priceCurrency: siteConfig.business.currency,
      })),
    },
  };
}
