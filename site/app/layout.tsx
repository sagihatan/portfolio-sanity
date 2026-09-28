import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Caveat, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted fonts: no render-blocking requests to other sites.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument" });
// Only the desktop signature uses Caveat, so it isn't preloaded.
const caveat = Caveat({ subsets: ["latin"], weight: "400", preload: false, variable: "--font-caveat" });
// Satoshi has no 600; 600 text renders with 700, as it did from Fontshare.
const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-400.woff2", weight: "400" },
    { path: "./fonts/Satoshi-500.woff2", weight: "500" },
    { path: "./fonts/Satoshi-700.woff2", weight: "700" },
  ],
  variable: "--font-satoshi",
});

export const metadata: Metadata = {
  title: "Sagi - One designer. Full coverage.",
  description: "From early ideas and UX to polished digital products and websites.",
  openGraph: {
    title: "Sagi - One designer. Full coverage.",
    description: "From early ideas and UX to polished digital products and websites.",
    images: ["/assets/og-image.jpg"],
    type: "website",
  },
};

// The site is light-only by design. Without an explicit declaration, force-dark
// engines (Google app's Auto Dark Mode on iOS, Chrome Auto Dark Theme, Samsung
// Internet, Android WebViews) rewrite our colors while leaving video and images
// untouched, which breaks the design. `only light` forbids that transformation.
export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#FAF8F8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrumentSerif.variable} ${caveat.variable} ${satoshi.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="shortcut icon" href="/assets/favicon.ico" />
        <link rel="manifest" href="/assets/site.webmanifest" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
        {/* Turbopack/Lightning CSS strips unprefixed backdrop-filter from these rules — injected raw to bypass optimizer */}
        <style dangerouslySetInnerHTML={{ __html: `
          nav.topnav.compact .nav-inner::before {
            backdrop-filter: blur(24px) saturate(160%);
          }
          .btn-ghost {
            backdrop-filter: blur(24px) saturate(160%);
          }
          .love-nav button {
            backdrop-filter: blur(24px) saturate(160%);
          }
        `}} />
      </head>
      <body className="init-load">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
