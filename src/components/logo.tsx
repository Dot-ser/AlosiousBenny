
import Link from 'next/link';
import { Camera } from 'lucide-react'; // Or your preferred logo icon

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group" aria-label="DOT007 Home">
      {/* You can replace Camera with an Image component for a custom logo */}
      {/* <Image src="/path/to/your/logo.png" alt="DOT007 Logo" width={32} height={32} className="rounded-full" /> */}
      <Camera className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
      <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
        DOT007
      </span>
    </Link>
  );
}
