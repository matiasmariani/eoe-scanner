import type { Metadata } from "next";
import { Fredoka, Nunito, Andika, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AllergyProvider } from "@/contexts/AllergyContext";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: 'swap',
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: 'swap',
});

const andika = Andika({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Allergy Scout - Find Food Clues!",
  description: "Scan any product barcode to instantly check for allergens like dairy, wheat, and eggs.",
  keywords: ['allergy', 'scanner', 'food', 'nutrition', 'allergen', 'safe snacking', 'scan barcode'],
  authors: [{ name: 'Allergy Scout Team' }],
  openGraph: {
    title: 'Allergy Scout - Find Food Clues!',
    description: 'Scan any product barcode to instantly check for allergens like dairy, wheat, and eggs.',
    type: 'website',
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
      className={`${fredoka.variable} ${nunito.variable} ${andika.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AllergyProvider>
          {children}
        </AllergyProvider>
      </body>
    </html>
  );
}
