import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCRRC Run Finder",
  description:
    "Find weekly drop-in group runs near you in Montgomery County, MD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-navy px-4 py-3">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-bold text-white">
              MCRRC Run Finder
            </span>
            <span className="text-xs text-gray-300">
              A Place For Every Pace
            </span>
          </Link>
          <Link
            href="/runs/new"
            className="text-sm font-medium text-brand-orange hover:text-white"
          >
            Add a Run
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
