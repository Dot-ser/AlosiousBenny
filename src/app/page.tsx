
'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Github, Instagram, Linkedin, Twitter, Facebook, Send, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: "Alosious Benny - Welcome",
  description: "Welcome to the personal page of Alosious Benny. Discover the gallery and social profiles.",
};

interface SocialLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
}

const SocialLinkItem: React.FC<SocialLinkProps> = ({ href, label, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent"
  >
    <Icon size={28} />
  </a>
);

export default function HomePage() {
  const socialLinks: SocialLinkProps[] = [
    { href: "http://instagram.com/_alosious_benny", label: "Instagram", icon: Instagram },
    { href: "https://www.linkedin.com/in/alosious-benny-a04bba30a", label: "LinkedIn", icon: Linkedin },
    { href: "https://twitter.com/alosious_benny", label: "X (Twitter)", icon: Twitter },
    { href: "https://github.com/DOT-007", label: "GitHub", icon: Github },
    { href: "https://www.facebook.com/alosious.benny.1", label: "Facebook", icon: Facebook },
    { href: "https://t.me/dotsermodz", label: "Telegram", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="mb-10">
          <Image
            src="/logo.png"
            alt="Alosious Benny"
            width={150}
            height={150}
            className="rounded-full shadow-xl border-4 border-card object-cover"
            priority
            data-ai-hint="profile picture large"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
          Alosious Benny
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl">
          Welcome! Discover my visual stories and connect with me across the web.
        </p>

        <Button asChild size="lg" className="px-10 py-6 text-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105">
          <Link href="/gallery">
            View Gallery <ExternalLink size={20} className="ml-2" />
          </Link>
        </Button>

        <div className="mt-16 pt-8 border-t border-border/50 w-full max-w-md">
          <h2 className="text-sm uppercase text-muted-foreground mb-6 tracking-wider">Connect with me</h2>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
            {socialLinks.map((link) => (
              <SocialLinkItem key={link.href} {...link} />
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center p-8 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Alosious Benny. All rights reserved.</p>
      </footer>
    </div>
  );
}
