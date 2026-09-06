/**
 * Base path support.
 *
 * When the site is served from a sub-path — a GitHub project Pages site lives
 * at /<repo> — Next rewrites its own routes and chunk URLs, but not the plain
 * `/public` paths that come out of siteConfig. Those go through `asset()`.
 *
 * Set NEXT_PUBLIC_BASE_PATH to the same value as BASE_PATH at build time.
 * Empty (the default) means the site is served from a domain root and nothing
 * is prefixed.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** "/media/x.jpg" → "/Barbershop-/media/x.jpg" (or unchanged with no base path). */
export function asset(path: string): string {
  if (!path || !path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
