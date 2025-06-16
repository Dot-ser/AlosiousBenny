
'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { School, ShieldCheck, CalendarDays, Milestone } from 'lucide-react'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface JourneyItem {
  year: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const journeyData: JourneyItem[] = [
  {
    year: '2023',
    title: 'Completed 12th Grade',
    description: 'Graduated higher secondary, focusing on subjects that sparked my interest in technology and security.',
    icon: School,
  },
  {
    year: '2023 - Present',
    title: 'B.Sc. Cyber Forensics',
    description: 'Currently pursuing a Bachelor of Science degree, specializing in Cyber Forensics and digital investigation techniques.',
    icon: ShieldCheck, 
  },
  {
    year: '2024',
    title: 'Vulnerability Assessment & Penetration Testing',
    description: 'Completed comprehensive training in Vulnerability Assessment and Penetration Testing (VAPT), enhancing practical cybersecurity skills.',
    icon: ShieldCheck, // Using ShieldCheck as it's relevant for security/VAPT
  },
];

const JourneyTimeline: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-12">
      <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center text-foreground flex items-center justify-center gap-3">
        <Milestone className="h-8 w-8 text-primary" />
        My Journey
      </h2>
      <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:md:mx-auto md:before:left-1/2 md:before:-translate-x-1/2">
        {journeyData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="relative flex flex-col md:flex-row md:items-center"
          >
            <div className="flex w-full items-center md:w-1/2 md:pr-8">
               {/* Dot on the timeline */}
              <div className="absolute left-5 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background md:left-1/2 md:top-1/2 md:-translate-y-1/2"></div>
              <Card className={`w-full shadow-xl hover:shadow-primary/20 transition-shadow duration-300 bg-card/80 backdrop-blur-sm ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto md:text-right'}`}>
                <CardHeader className={`p-4 ${index % 2 === 0 ? '' : 'md:items-end'}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <item.icon className="h-7 w-7 text-primary" />
                    <CardTitle className="text-xl font-semibold text-card-foreground">{item.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays size={16} />
                    <span>{item.year}</span>
                  </div>
                </CardHeader>
                <CardContent className={`p-4 pt-0 ${index % 2 === 0 ? '' : 'md:items-end'}`}>
                  <CardDescription className="text-card-foreground/90">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
            {/* Spacer for alternating layout on larger screens */}
            {index % 2 === 0 && <div className="hidden md:block md:w-1/2"></div>}
            {index % 2 !== 0 && <div className="hidden md:block md:w-1/2 md:order-first"></div>}

          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JourneyTimeline;
