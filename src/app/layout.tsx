import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AllergyProvider } from "@/contexts/AllergyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Allergy Scout - Scan Products for Allergens",
  description: "Scan any product barcode to instantly check for allergens like dairy, wheat, and eggs. Safe snacking made easy!",
  keywords: ['allergy', 'scanner', 'food', 'nutrition', 'allergen', 'safe snacking', 'scan barcode'],
  authors: [{ name: 'Allergy Scout Team' }],
  openGraph: {
    title: 'Allergy Scout - Scan Products for Allergens',
    description: 'Scan any product barcode to instantly check for allergens like dairy, wheat, and eggs',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Allergy Scout App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allergy Scout - Scan Products for Allergens',
    description: 'Scan any product barcode to instantly check for allergens',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AllergyProvider>
          {children}
        </AllergyProvider>
      </body>
    </html>
  );
}
