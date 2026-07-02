import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito, Andika, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AllergyProvider } from '@/contexts/AllergyContext';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const fredoka = Fredoka({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const nunito = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const andika = Andika({
  variable: '--font-data',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Snack Scout - Is it safe to eat?',
  description:
    "Snack Scout is a kid-friendly allergy checker. Scan any snack's barcode to instantly check it for allergens like milk, wheat, eggs, and nuts.",
  keywords: [
    'allergy',
    'scanner',
    'kids',
    'food',
    'nutrition',
    'allergen',
    'safe snacking',
    'scan barcode',
    'snack scout',
  ],
  authors: [{ name: 'Snack Scout' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Snack Scout',
    startupImage: '/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Snack Scout - Is it safe to eat?',
    description:
      "A kid-friendly allergy checker. Scan a snack's barcode to instantly check it for allergens.",
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#79d461',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} ${andika.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var theme = localStorage.getItem('app-theme') || 'minecraft';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            })()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <AllergyProvider>{children}</AllergyProvider>
      </body>
    </html>
  );
}
