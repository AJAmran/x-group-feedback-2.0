import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
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
    description: "Share your dining experience with X-Group Chain Restaurant and Hospitality",
    siteName: "X-Group Feedback",

  },
  twitter: {
    card: "summary_large_image",
    title: "X-Group Feedback",
    description: "Share your dining experience with X-Group Chain Restaurant and Hospitality",
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
      <head />
      <body
        className={`
          ${poppins.variable}
          antialiased min-h-screen bg-gradient-to-br from-[#f8faff] via-[#f0f4ff] to-[#e8edff] relative overflow-x-hidden
          bg-[length:400%_400%] animate-gradient-flow
        `}
      >
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 rounded-full blur-3xl animate-floating-blobs will-change-transform" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-[hsl(var(--brand-primary)/0.08)] via-[hsl(var(--brand-glow)/0.05)] to-transparent rounded-full blur-3xl animate-floating-blobs animation-delay-2000 will-change-transform" />
          <div className="absolute top-3/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-slate-300/5 via-gray-300/3 to-transparent rounded-full blur-3xl animate-floating-blobs animation-delay-4000 will-change-transform" />
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}