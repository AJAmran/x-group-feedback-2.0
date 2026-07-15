import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  weight: ["500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "X-Group Chain Restaurant Feedback | Share Your Dining Experience",
  description:
    "Share your dining experience with X-Group Chain Restaurant and Hospitality. Quick and easy feedback form for our valued guests.",
  keywords: [
    "X-Group",
    "feedback",
    "restaurant",
    "dining experience",
    "hospitality",
  ],
  authors: [{ name: "X-Group Chain Restaurant and Hospitality" }],
  creator: "X-Group Chain Restaurant and Hospitality",
  publisher: "X-Group Chain Restaurant and Hospitality",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "X-Group Feedback",
    description:
      "Share your dining experience with X-Group Chain Restaurant and Hospitality",
    siteName: "X-Group Feedback",
  },
  twitter: {
    card: "summary_large_image",
    title: "X-Group Feedback",
    description:
      "Share your dining experience with X-Group Chain Restaurant and Hospitality",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/logo.png"
          as="image"
          type="image/png"
          fetchPriority="high"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className={`
    ${manrope.variable}
    ${fraunces.variable}
    ${plexMono.variable}
    font-sans
    antialiased
    min-h-screen
    relative
  `}
      >
        {/* iOS 26 Mesh Background */}
        <div className="mesh-bg" aria-hidden="true" />

        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
