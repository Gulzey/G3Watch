import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G3WATCH - Modern Streaming Platform",
  description: "A clean and futuristic streaming service",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className={`${inter.className} min-h-screen`}>
        <main className="container mx-auto px-4">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
