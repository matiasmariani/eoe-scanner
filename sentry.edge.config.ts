// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { scrubEvent, scrubTransaction } from '@/lib/sentry-scrub';

Sentry.init({
  dsn: 'https://54d8abfb67077e10b081e03edda57df2@o4511660952846336.ingest.us.sentry.io/4511660953042944',

  // Only report from production builds.
  enabled: process.env.NODE_ENV === 'production',

  // Sample a fraction of traces in production (100% is expensive and noisy).
  tracesSampleRate: 0.1,

  // COPPA: never attach IP addresses / request headers / cookies to events.
  sendDefaultPii: false,

  // Defense-in-depth PII scrubbing (barcodes, request metadata, breadcrumbs).
  beforeSend: scrubEvent,
  beforeSendTransaction: scrubTransaction,
});
