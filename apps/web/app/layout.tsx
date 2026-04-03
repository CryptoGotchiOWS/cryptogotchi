import type { Metadata } from "next";
import { Inter, Press_Start_2P, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoGotchi - AI Virtual Pet",
  description: "AI-powered virtual pet that earns crypto via x402 payments",
  keywords: ["cryptogotchi", "virtual pet", "x402", "crypto", "AI"],
  authors: [{ name: "CryptoGotchi Team" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "CryptoGotchi - AI Virtual Pet",
    description: "AI-powered virtual pet that earns crypto via x402 payments",
    type: "website",
  },
  twitter: { card: "summary" },
  other: { "theme-color": "#E2E8E6" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pressStart2P.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
