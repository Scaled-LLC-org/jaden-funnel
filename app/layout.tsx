import type { Metadata } from "next";
import { Inter, Caveat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Aesthetic Mastery | Jaden Levin",
  description:
    "Build a peak aesthetic physique naturally — without living in the gym, eating like a monk, or touching peptides.",
  openGraph: {
    title: "Aesthetic Mastery | Jaden Levin",
    description:
      "Build a peak aesthetic physique naturally — without living in the gym or eating like a monk.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${caveat.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
