/**
 * Scroll locking, counted.
 *
 * Several things need to freeze the page — the opening screen, the mobile menu,
 * the gallery lightbox — and they can overlap. A single boolean flag breaks
 * here: whichever one unmounts or settles last wipes the flag while another is
 * still open. (That is exactly what happened between the intro and the header,
 * which cleared the intro's lock on mount.)
 *
 * So each holder takes a lock and releases its own; the page unfreezes only
 * when the last one lets go.
 */
let holders = 0;

export function lockScroll(): void {
  holders += 1;
  document.body.dataset.locked = "true";
}

export function releaseScroll(): void {
  holders = Math.max(0, holders - 1);
  if (holders === 0) {
    delete document.body.dataset.locked;
  }
}
