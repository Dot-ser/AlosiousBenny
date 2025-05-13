
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Github, Instagram, Linkedin, Twitter, Facebook, Send, ExternalLink, User, MapPin, Briefcase, Lightbulb, FolderGit2, ListMusic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HomePageLoader } from '@/components/home-page-loader';
import { cn } from '@/lib/utils';


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
    className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent/20"
  >
    <Icon size={28} />
  </a>
);

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-center text-lg space-x-2">
    <Icon className="h-5 w-5 text-primary" />
    <span className="text-muted-foreground"><span className="font-semibold text-foreground/90">{label}:</span> {value}</span>
  </div>
);


export default function HomePage() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500); // Simulate loading time, adjust as needed
    return () => clearTimeout(timer);
  }, []);

  const socialLinks: SocialLinkProps[] = [
    { href: "http://instagram.com/_alosious_benny", label: "Instagram", icon: Instagram },
    { href: "https://www.linkedin.com/in/alosious-benny-a04bba30a", label: "LinkedIn", icon: Linkedin },
    { href: "https://twitter.com/alosious_benny", label: "X (Twitter)", icon: Twitter },
    { href: "https://github.com/DOT-007", label: "GitHub", icon: Github },
    { href: "https://www.facebook.com/alosious.benny.1", label: "Facebook", icon: Facebook },
    { href: "https://t.me/dotsermodz", label: "Telegram", icon: Send },
  ];

  const personalDetails: DetailItemProps[] = [
    { icon: User, label: "Age", value: "20" },
    { icon: MapPin, label: "Location", value: "Idukki, Kerala" },
    { icon: Briefcase, label: "Studying", value: "Cyber Forensic Student" },
  ];

  const hobbies = [
    "Developing Python Projects",
    "Building Personal Tech Initiatives",
    "Exploring Cyber Security & Digital Forensics",
    "Contributing to Open Source Software",
    "Learning new Programming Languages & Frameworks",
  ];

  return (
    <>
      <HomePageLoader isLoading={isPageLoading} />
      <div className={cn(
          "min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden",
          !isPageLoading ? "opacity-100" : "opacity-0",
          "transition-opacity duration-700 ease-in-out delay-100" // Added delay for smoother transition
        )}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-12 sm:py-16 md:py-20 flex flex-col items-center text-center z-10">
          <div className="mb-8">
            <Image
              src="/images/logo.jpg"
              alt="Alosious Benny"
              width={160}
              height={160}
              className="rounded-full shadow-2xl border-4 border-primary/50 object-cover"
              priority
              data-ai-hint="profile picture person"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Alosious Benny
          </h1>
          
          {/* Personal Details Section */}
          <div className="max-w-xl mb-8 space-y-3">
            {personalDetails.map(detail => (
              <DetailItem key={detail.label} icon={detail.icon} label={detail.label} value={detail.value} />
            ))}
          </div>

          {/* Hobbies/Interests Section */}
          <div className="max-w-2xl w-full mb-10 text-left px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-foreground flex items-center justify-center gap-2">
              <Lightbulb className="h-7 w-7 text-primary" />
              Interests & Activities
            </h2>
            <ul className="list-none space-y-3 text-muted-foreground">
              {hobbies.map((hobby, index) => (
                <li key={index} className="flex items-start p-3 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-primary mr-3 mt-1">&#10003;</span> 
                  <span className="text-lg">{hobby}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild size="lg" className="px-8 py-6 text-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105">
              <Link href="/gallery">
                Explore My Gallery <ExternalLink size={20} className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 py-6 text-lg shadow-lg hover:shadow-accent/30 transition-all duration-300 transform hover:scale-105">
              <a href="https://github.com/Dot-ser?tab=repositories" target="_blank" rel="noopener noreferrer">
                My Projects <FolderGit2 size={20} className="ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="px-8 py-6 text-lg shadow-lg hover:shadow-muted-foreground/30 transition-all duration-300 transform hover:scale-105">
              <Link href="/playlist">
                 My Playlist <ListMusic size={20} className="ml-2" />
              </Link>
            </Button>
          </div>


          {/* Social Links Section */}
          <div className="mt-12 pt-10 border-t border-border/60 w-full max-w-lg">
            <h2 className="text-base uppercase text-muted-foreground mb-6 tracking-wider font-semibold">Connect With Me</h2>
            <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-4">
              {socialLinks.map((link) => (
                <SocialLinkItem key={link.href} {...link} />
              ))}
            </div>
          </div>
        </main>

        <footer className="text-center p-8 text-sm text-muted-foreground border-t border-border/60 z-10">
          <p>&copy; {new Date().getFullYear()} Alosious Benny. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}