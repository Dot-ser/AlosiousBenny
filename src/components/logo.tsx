
import Link from 'next/link';
import { Camera } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group" aria-label="InstaShow Home">
      <Camera className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
      <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
        InstaShow
      </span>
    </Link>
  );
}
