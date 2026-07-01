// Shared PII scrubbing for all Sentry init sites (client, server, edge).
//
// Snack Scout is a COPPA-friendly kids' app. We must not send any personal or
// health data to Sentry. This scrubber is defense-in-depth ON TOP OF
// `sendDefaultPii: false` and Session Replay being disabled:
//   - drops user identity (IP, id, email) and request headers/cookies/query
//   - redacts barcodes from error messages, URLs, and breadcrumbs
//   - drops `console` breadcrumbs entirely (they can capture product names,
//     allergens, and profile names that are logged during a session)
//
// Product names, brands, and allergen strings are free-text and can't be
// reliably regex-scrubbed — the real guarantee is that we never attach them to
// Sentry events (logError sends only the Error), and we drop the breadcrumb
// channels that could otherwise capture them.

import type { Event } from '@sentry/nextjs';

// EAN-8 / UPC-A / EAN-13 / GTIN-14 style runs of 8–14 digits.
const BARCODE_RE = /\b\d{8,14}\b/g;
// Open Food Facts / USDA product paths embed the barcode.
const PRODUCT_PATH_RE = /(\/product\/)\d{8,14}/g;

function redact(value: string): string {
  return value
    .replace(PRODUCT_PATH_RE, '$1[redacted]')
    .replace(BARCODE_RE, '[redacted]');
}

/**
 * `beforeSend` hook. Returning `null` would drop the event entirely; here we
 * always return a redacted copy so real errors still reach Sentry. Generic so
 * it satisfies both `beforeSend` (ErrorEvent) and the transaction hook below.
 */
export function scrubEvent<T extends Event>(event: T): T {
  return scrub(event) as T;
}

/** `beforeSendTransaction` hook — same scrubbing for performance events. */
export function scrubTransaction<T extends Event>(event: T): T {
  return scrub(event) as T;
}

function scrub(event: Event): Event {
  // 1. Never send user identity (sendDefaultPii would otherwise attach IP).
  delete event.user;

  // 2. Strip request metadata that can carry PII.
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
    delete event.request.data;
    if (event.request.url) event.request.url = redact(event.request.url);
  }

  // 3. Redact barcodes from the top-level message.
  if (typeof event.message === 'string') {
    event.message = redact(event.message);
  }

  // 4. Redact barcodes from exception messages.
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redact(ex.value);
  }

  // 5. Drop console breadcrumbs (may contain product/allergen/profile data);
  //    redact URLs on the rest (fetch/xhr breadcrumbs embed barcodes).
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .filter((b) => b.category !== 'console')
      .map((b) => {
        if (typeof b.message === 'string') b.message = redact(b.message);
        if (b.data && typeof b.data.url === 'string') {
          b.data.url = redact(b.data.url);
        }
        return b;
      });
  }

  return event;
}
