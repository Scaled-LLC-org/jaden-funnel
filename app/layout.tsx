import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
