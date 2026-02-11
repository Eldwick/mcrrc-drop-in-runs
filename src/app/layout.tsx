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
        <header className="flex items-center justify-between border-b-2 border-brand-navy bg-white px-4 py-3">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-bold text-brand-navy">
              MCRRC Run Finder
            </span>
            <span className="text-xs text-brand-steel">
              A Place For Every Pace
            </span>
          </Link>
          <Link
            href="/runs/new"
            className="text-sm font-medium text-brand-steel hover:text-brand-orange"
          >
            Add a Run
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
