import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "The Counsel Brief",
  description: "Sharp legal analysis, case updates, and policy commentary.",
  metadataBase: new URL("https://thecounselbrief.vercel.app"),
  openGraph: {
    title: "The Counsel Brief",
    description: "Sharp legal analysis, case updates, and policy commentary.",
    siteName: "The Counsel Brief",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Counsel Brief",
    description: "Sharp legal analysis, case updates, and policy commentary.",
  },
};

function NavbarFallback() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <div className="h-3 w-28 rounded bg-stone-200" />
          <div className="mt-2 h-5 w-40 rounded bg-stone-200" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-16 rounded-full bg-stone-200" />
          <div className="h-9 w-20 rounded-full bg-stone-200" />
          <div className="h-9 w-24 rounded-full bg-stone-200" />
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Suspense fallback={<NavbarFallback />}>
          <Navbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}