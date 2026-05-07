import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sagi Hatan — Senior Product Designer",
  description: "From idea to product, or as part of your team — I step in where needed.",
  openGraph: {
    title: "Sagi - The senior designer your product needs",
    description: "From idea to product, or as part of your team — I step in where needed.",
    images: ["/assets/og-image.jpg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="shortcut icon" href="/assets/favicon.ico" />
        <link rel="manifest" href="/assets/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=Caveat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet" />
        {/* Turbopack/Lightning CSS strips unprefixed backdrop-filter from these rules — injected raw to bypass optimizer */}
        <style dangerouslySetInnerHTML={{ __html: `
          .nav-inner::before {
            backdrop-filter: blur(0px) saturate(100%);
          }
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
