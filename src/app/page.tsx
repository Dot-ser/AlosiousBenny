
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Github, Instagram, Linkedin, Twitter, Facebook, Send, ExternalLink, User, MapPin, Briefcase, Lightbulb, FolderGit2, ListMusic, GraduationCap, ChevronDown, Code, Music, Camera, ShieldAlert, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HomePageLoader } from '@/components/home-page-loader';
import { cn } from '@/lib/utils';
import JourneyTimeline from '@/components/journey-timeline';
import { incrementAndGetVisitorCount } from '@/actions/visitorActions';
import { motion } from 'framer-motion';


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
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);

    const fetchVisitorCount = async () => {
      const result = await incrementAndGetVisitorCount();
      if (result.success && typeof result.count === 'number') {
        setVisitorCount(result.count);
      } else {
        console.warn("Failed to fetch or increment visitor count:", result.error);
      }
    };
    fetchVisitorCount();
    
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
    { icon: GraduationCap, label: "Studying", value: "Cyber Forensic Student" },
  ];

  const hobbies = [
    "Developing Python Projects",
    "Building Personal Tech Initiatives",
    "Exploring Cyber Security & Digital Forensics",
    "Contributing to Open Source Software",
    "Learning new Programming Languages & Frameworks",
  ];

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay, ease: "easeOut" },
    }),
  };
  
  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      },
    }),
  };


  return (
    <>
      <HomePageLoader isLoading={isPageLoading} />
      <div className={cn(
          "min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden", 
          !isPageLoading ? "opacity-100" : "opacity-0",
          "transition-opacity duration-700 ease-in-out delay-100"
        )}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => scrollToSection('profile')}>Profile</Button>
              <Button variant="ghost" onClick={() => scrollToSection('journey')}>Journey</Button>
              <Button variant="ghost" onClick={() => scrollToSection('interests')}>Interests</Button>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {/* Section 1: Profile */}
          <motion.section 
            id="profile" 
            className="min-h-screen flex flex-col items-center justify-center text-center py-16 px-4 relative"
            variants={sectionVariants}
            initial="hidden"
            animate={!isPageLoading ? "visible" : "hidden"} // Animate when page is loaded
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto flex flex-col items-center">
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={!isPageLoading ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              >
                <Image
                  src="/images/logo.jpg"
                  alt="Alosious Benny"
                  width={160}
                  height={160}
                  className="rounded-full shadow-2xl border-4 border-primary/50 object-cover"
                  priority
                  data-ai-hint="profile picture person"
                />
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
                variants={itemVariants} custom={0.3}
              >
                Alosious Benny
              </motion.h1>
              <motion.div 
                className="max-w-xl mb-6 space-y-3"
                variants={itemVariants} custom={0.4}
              >
                {personalDetails.map(detail => (
                  <DetailItem key={detail.label} icon={detail.icon} label={detail.label} value={detail.value} />
                ))}
              </motion.div>
              <motion.p 
                className="max-w-xl text-lg text-muted-foreground mb-8 px-4"
                variants={itemVariants} custom={0.5}
              >
                A passionate individual with a keen interest in <strong className="text-foreground/90">developing</strong> innovative software solutions, exploring the realms of <strong className="text-foreground/90">ethical hacking</strong>, enjoying <strong className="text-foreground/90">music</strong>, and capturing moments through <strong className="text-foreground/90">photography</strong>.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-12"
                variants={itemVariants} custom={0.6}
              >
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
              </motion.div>
              <Button variant="ghost" onClick={() => scrollToSection('journey')} className="absolute bottom-10 animate-bounce">
                <ChevronDown size={32} />
                <span className="sr-only">Scroll to Journey</span>
              </Button>
            </div>
          </motion.section>

          {/* Section 2: Journey */}
          <motion.section 
            id="journey" 
            className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-secondary/30 relative"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto">
              <JourneyTimeline />
            </div>
            <Button variant="ghost" onClick={() => scrollToSection('interests')} className="absolute bottom-10 animate-bounce">
              <ChevronDown size={32} />
              <span className="sr-only">Scroll to Interests</span>
            </Button>
          </motion.section>

          {/* Section 3: Interests & Connect */}
          <motion.section 
            id="interests" 
            className="min-h-screen flex flex-col items-center justify-center py-16 px-4 relative"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="container mx-auto flex flex-col items-center">
              <motion.div 
                className="max-w-2xl w-full mb-10 text-left"
                variants={itemVariants} custom={0.1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-foreground flex items-center justify-center gap-2">
                  <Lightbulb className="h-7 w-7 text-primary" />
                  Interests & Activities
                </h2>
                <ul className="list-none space-y-3 text-muted-foreground">
                  {hobbies.map((hobby, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start p-3 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      custom={index}
                      variants={listItemVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      <span className="text-primary mr-3 mt-1">&#10003;</span>
                      <span className="text-lg">{hobby}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                className="mt-12 pt-10 border-t border-border/60 w-full max-w-lg"
                variants={itemVariants} custom={0.3} // Stagger after hobbies potentially
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <h2 className="text-base uppercase text-muted-foreground mb-6 tracking-wider font-semibold text-center">Connect With Me</h2>
                <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-4">
                  {socialLinks.map((link, index) => (
                     <motion.div
                        key={link.href}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                      <SocialLinkItem {...link} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        </main>

        <motion.footer 
          className="text-center p-8 text-sm text-muted-foreground border-t border-border/60 z-10"
          initial={{ opacity: 0 }}
          animate={!isPageLoading ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }} // Late animation for footer
        >
          <p>&copy; {new Date().getFullYear()} Alosious Benny. All rights reserved.</p>
           {visitorCount !== null && (
            <div className="mt-2 flex items-center justify-center text-xs text-muted-foreground/80">
              <Eye size={14} className="mr-1.5" />
              <span>Site visits: {visitorCount.toLocaleString()}</span>
            </div>
          )}
        </motion.footer>
      </div>
    </>
  );
}

