import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: 'DOT007 - Alosious Benny',
  description: 'Alosious Benny , Song4u - Lesson My Favorite Songs',
  keywords: ['Alosious Benny', 'Song4u', 'Music', 'Player', 'Web App'],
  authors: [{ name: 'DOTSERMODZ' }],
  themeColor: '#000000',
  openGraph: {
    title: 'Alosious Benny , Favorite Playlist',
    description: 'Alosious Benny , Song4u - listen to My Favorite Songs',
    url: 'https://alosiousbenny.vercel.app/Playlist',
    type: 'website',
    siteName: 'Alosious Benny',
    images: ['https://files.catbox.moe/jkwu5t.jpg'],
  },
  icons: {
    icon: 'https://files.catbox.moe/alaz7q.png',
  },
  twitter: {
    images: ['https://files.catbox.moe/jkwu5t.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="ui-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
