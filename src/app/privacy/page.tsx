import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Snack Scout',
  description: 'Snack Scout privacy policy, data sources, and disclaimer.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans px-6 py-12 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-900 mb-10 transition-colors"
      >
        ← Back to Snack Scout
      </Link>

      <h1 className="text-4xl font-black tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-10">
        Effective: July 1, 2026 · Last updated: July 1, 2026
      </p>

      {/* ── DISCLAIMER ──────────────────────────────────────── */}
      <section className="mb-10 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl space-y-2">
        <h2 className="text-lg font-black uppercase tracking-wide text-amber-800">
          ⚠️ Important Disclaimer
        </h2>
        <p className="text-sm leading-relaxed text-amber-900">
          <strong>
            Snack Scout is not a medical device and does not provide medical
            advice.
          </strong>{' '}
          It is an informational tool intended to help you quickly check product
          ingredient lists against a personal list of allergens. It is not a
          substitute for reading product labels yourself or consulting a
          qualified healthcare professional.
        </p>
        <p className="text-sm leading-relaxed text-amber-900">
          Product data is sourced from <strong>Open Food Facts</strong>, a free,
          collaborative, crowdsourced food products database maintained by
          volunteers worldwide. This data may be{' '}
          <strong>incomplete, outdated, or incorrect</strong>. Manufacturers
          change recipes without notice. Always read the product label and
          consult a doctor or allergist before making dietary decisions,
          especially for severe or life-threatening allergies.
        </p>
        <p className="text-sm leading-relaxed text-amber-900 font-bold">
          Use Snack Scout at your own risk. The developers accept no liability
          for any harm resulting from reliance on information provided by this
          app.
        </p>
      </section>

      {/* ── DATA SOURCES ────────────────────────────────────── */}
      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-black">Data Sources</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Snack Scout uses the following external data sources:
        </p>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="font-black text-gray-900 shrink-0">
              Open Food Facts
            </span>
            <span>
              <a
                href="https://world.openfoodfacts.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                world.openfoodfacts.org
              </a>{' '}
              — A free, open, collaborative database of food products from
              around the world. Licensed under the{' '}
              <a
                href="https://opendatacommons.org/licenses/odbl/1-0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                Open Database License (ODbL)
              </a>
              . When you scan a barcode, a request is sent to the Open Food
              Facts API containing the barcode number. No personal information
              is included in this request. Read the{' '}
              <a
                href="https://world.openfoodfacts.org/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                Open Food Facts Terms of Use
              </a>{' '}
              and their{' '}
              <a
                href="https://world.openfoodfacts.org/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                privacy policy
              </a>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-black text-gray-900 shrink-0">
              USDA Food Data Central
            </span>
            <span>
              <a
                href="https://fdc.nal.usda.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                fdc.nal.usda.gov
              </a>{' '}
              — The USDA&apos;s official food composition database. When you
              search for products, requests containing your search query are
              sent to the USDA Food Data Central API. No personal information is
              included in these requests. Review the{' '}
              <a
                href="https://fdc.nal.usda.gov/api-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                USDA API documentation
              </a>{' '}
              and their{' '}
              <a
                href="https://www.usda.gov/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                privacy policy
              </a>
              .
            </span>
          </li>
        </ul>
      </section>

      {/* ── WHAT WE COLLECT ─────────────────────────────────── */}
      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-black">What Data We Collect</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          <strong>
            We do not collect, store, or transmit any personal information to
            our servers.
          </strong>{' '}
          Snack Scout has no backend. All app data is stored exclusively on your
          device using your browser&apos;s local storage (IndexedDB). This
          includes:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Profile names and avatars you create</li>
          <li>Your allergen selections</li>
          <li>Your scan history</li>
          <li>Your &quot;Safe Snacks&quot; collection</li>
          <li>Your preferred app theme</li>
          <li>Your premium subscription status</li>
        </ul>
        <p className="text-sm leading-relaxed text-gray-700">
          This data never leaves your device (except for the barcode queries to
          Open Food Facts described above). Uninstalling or clearing your
          browser data will permanently delete it.
        </p>
      </section>

      {/* ── CHILDREN ────────────────────────────────────────── */}
      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-black">Children&apos;s Privacy (COPPA)</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Snack Scout is designed to be used by parents and guardians on behalf
          of children, or by children under parental supervision. We do{' '}
          <strong>not</strong>:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Require account creation or registration</li>
          <li>
            Collect names, email addresses, or any personally identifiable
            information
          </li>
          <li>Display advertising</li>
          <li>Track behavior for marketing purposes</li>
          <li>Share any data with third parties</li>
        </ul>
        <p className="text-sm leading-relaxed text-gray-700">
          We comply with the Children&apos;s Online Privacy Protection Act
          (COPPA). If you believe we have inadvertently collected personal
          information from a child, please contact us immediately at{' '}
          <a
            href="mailto:hi@matiasmariani.io"
            className="text-green-700 underline"
          >
            hi@matiasmariani.io
          </a>
          .
        </p>
      </section>

      {/* ── PREMIUM / BILLING ───────────────────────────────── */}
      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-black">Premium Subscription & Billing</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Premium subscriptions are processed entirely by{' '}
          <strong>Google Play Billing</strong>. Snack Scout never receives or
          stores your payment information. Your purchase is governed by
          Google&apos;s{' '}
          <a
            href="https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=privacynotice"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            Payments Privacy Notice
          </a>
          .
        </p>
      </section>

      {/* ── ANALYTICS ───────────────────────────────────────── */}
      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-black">Analytics</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Snack Scout may use <strong>Vercel Web Analytics</strong> to collect
          anonymous, aggregated data such as page views and general geographic
          region. This data contains no personally identifiable information and
          is used solely to understand how the app is used. You can review
          Vercel&apos;s privacy practices at{' '}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            vercel.com/legal/privacy-policy
          </a>
          .
        </p>
      </section>

      {/* ── CHANGES ─────────────────────────────────────────── */}
      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-black">Changes to This Policy</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          We may update this policy from time to time. The &quot;Last
          updated&quot; date at the top of this page will reflect any changes.
          Continued use of Snack Scout after changes are posted constitutes
          acceptance of the updated policy.
        </p>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section className="mb-16 space-y-3">
        <h2 className="text-2xl font-black">Contact</h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Questions about this privacy policy? Email us at{' '}
          <a
            href="mailto:hi@matiasmariani.io"
            className="text-green-700 underline font-bold"
          >
            hi@matiasmariani.io
          </a>
          .
        </p>
      </section>

      <footer className="border-t border-gray-200 pt-6 text-xs text-gray-400">
        © 2026 Snack Scout. All rights reserved.
      </footer>
    </main>
  );
}
