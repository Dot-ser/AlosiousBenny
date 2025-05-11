
import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group" aria-label="DOT007 Home">
      <Image 
        src="/src/images/logo.jpg" 
        alt="DOT007 Logo" 
        width={32} 
        height={32} 
        className="rounded-full border-2 border-primary/50 group-hover:border-accent transition-colors object-cover"
        data-ai-hint="logo company" 
      />
      <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
        _alosious_benny
      </span>
    </Link>
  );
}

