// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { scrubEvent, scrubTransaction } from '@/lib/sentry-scrub';

Sentry.init({
  dsn: 'https://54d8abfb67077e10b081e03edda57df2@o4511660952846336.ingest.us.sentry.io/4511660953042944',

  // Only report from production builds.
  enabled: process.env.NODE_ENV === 'production',

  // COPPA: NO Session Replay. Recording a child's screen would capture typed
  // allergy/health data and profile names. Do not add replayIntegration().
  integrations: [],

  // Sample a fraction of traces in production (100% is expensive and noisy).
  tracesSampleRate: 0.1,

  // COPPA: never attach IP addresses to events.
  sendDefaultPii: false,

  // Defense-in-depth PII scrubbing (barcodes, request metadata, breadcrumbs).
  beforeSend: scrubEvent,
  beforeSendTransaction: scrubTransaction,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
