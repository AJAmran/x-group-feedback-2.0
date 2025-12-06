import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2c327c" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2456" },
  ],
};

export const metadata: Metadata = {
  title: "X-Group Feedback | Share Your Dining Experience",
  description:
    "Share your dining experience with X-Group Hospitality. Quick and easy feedback form for our valued guests.",
  keywords: [
    "X-Group",
    "feedback",
    "restaurant",
    "dining experience",
    "hospitality",
  ],
  authors: [{ name: "X-Group Hospitality" }],
  creator: "X-Group Hospitality",
  publisher: "X-Group Hospitality",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "X-Group Feedback",
    description: "Share your dining experience with X-Group Hospitality",
    siteName: "X-Group Feedback",
  },
  twitter: {
    card: "summary_large_image",
    title: "X-Group Feedback",
    description: "Share your dining experience with X-Group Hospitality",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
    ${poppins.variable} ${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}
    antialiased min-h-screen bg-linear-to-br from-[#f5f6ff] to-[#eceeff]
  `}
      >
        {children}
      </body>
    </html>
  );
}
