import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is available globally if needed, or per-page

export const metadata: Metadata = {
  title: 'InstaShow',
  description: 'Showcase your images with an Instagram-like UI, powered by AI hashtag suggestions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {/* Toaster can be placed here if used across many pages, or in specific page layouts */}
        {/* For this app, page.tsx already includes it, which is fine for a single-page focus. */}
      </body>
    </html>
  );
}
