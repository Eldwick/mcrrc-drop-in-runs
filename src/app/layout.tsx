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
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <Link href="/" className="text-lg font-bold text-gray-900">
            MCRRC Run Finder
          </Link>
          <Link
            href="/runs/new"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Add a Run
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
