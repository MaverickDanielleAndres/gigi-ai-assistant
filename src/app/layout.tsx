import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/server/site-url";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "GIGI — Think out loud",
  description: "An experimental voice, vision and research assistant. Ask, explore and make something useful.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "GIGI — Think out loud",
    description: "A cinematic multimodal assistant for voice, vision and ideas.",
    type: "website",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "GIGI — Think out loud", description: "A cinematic multimodal assistant for voice, vision and ideas." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>{children}</body></html>;
}
