import type { Metadata } from "next";
import { Inter, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500"],
  subsets: ["latin"],
});

/* Headline-Fallback: Schibsted Grotesk steht der lizenzierten Selecta am
   nächsten (charaktervolle Grotesk mit Vor-Helvetica-Details) — beim Build
   selbst gehostet, läuft also auch offline auf dem Präsentationsrechner. */
const schibsted = Schibsted_Grotesk({
  variable: "--font-display",
  weight: ["600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Best Select — Deutschland",
  description:
    "Best Select: der ganze deutsche Markt, gefiltert vom Weitblick-Radar — eine tap-gesteuerte Beratungspräsentation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} ${schibsted.variable}`}>
      <body>{children}</body>
    </html>
  );
}
