import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  weight: ["600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Best Select — Deutschland",
  description:
    "Best Select: der ganze deutsche Markt, gefiltert vom Weitblick-Radar — eine tap-gesteuerte Beratungspräsentation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} ${openSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
