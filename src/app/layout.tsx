import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { MobileNav } from "@/components/MobileNav";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageTransition } from "@/components/PageTransition";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "LitList Hub - Track Your Reading",
  description: "Track your reading progress, discover new books, and share your lists with friends.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LitList Hub",
  },
  openGraph: {
    title: "LitList Hub - Track Your Reading",
    description: "Track your reading progress, discover new books, and share your lists with friends.",
    images: [
      {
        url: "/icon-512.svg",
        width: 512,
        height: 512,
        alt: "LitList Hub",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LitList Hub - Track Your Reading",
    description: "Track your reading progress, discover new books, and share your lists with friends.",
    images: ["/icon-512.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#100d0a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased overflow-x-clip grain-overlay">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-medium focus:shadow-elevation-2"
        >
          Skip to content
        </a>
        <ErrorBoundary>
          <Providers>
            <ServiceWorkerRegister />
            <Header />
            <main id="main-content" className="container mx-auto px-4 py-6 sm:py-8 main-top-safe pb-24 md:pb-8">
              <PageTransition>{children}</PageTransition>
            </main>
            <MobileNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
