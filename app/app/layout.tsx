import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Sans, Averia_Serif_Libre } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const averia = Averia_Serif_Libre({
  subsets: ["latin"],
  variable: "--font-aver",
  weight: ["300", "400", "700"],
  style: ["italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vishlex – Modern Web Analytics with BYODB",
  description:
    "Vishlex is a clean, privacy-focused web analytics platform with a bring-your-own-database model. Track users, events, and performance without vendor lock-in.",
  keywords: [
    "web analytics",
    "BYODB analytics",
    "privacy analytics",
    "Google Analytics alternative",
    "Next.js analytics tool",
    "developer analytics",
  ],
  authors: [{ name: "Vishlex" }],
  creator: "Vishlex",
  metadataBase: new URL("https://vishlex.com"), // change to your domain

  openGraph: {
    title: "Vishlex – Web Analytics Reimagined",
    description:
      "Track your app with full control using your own database. Fast, minimal, and developer-first analytics.",
    url: "https://vishlex.com",
    siteName: "Vishlex",
    type: "website",
  },

  twitter: {
    // card: "summary_large_image",
    title: "Vishlex – Web Analytics Reimagined",
    description:
      "Privacy-first analytics with BYODB. No lock-in. Built for developers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${averia.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
