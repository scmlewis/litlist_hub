import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { MobileNav } from "@/components/MobileNav";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "LitList Hub - Track Your Reading",
  description: "Track your reading progress, discover new books, and share your lists with friends.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LitList Hub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[var(--background)] bg-gradient-mesh">
        <ErrorBoundary>
          <Providers>
            <Header />
            <main className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24 pb-24 md:pb-8">
              {children}
            </main>
            <MobileNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
