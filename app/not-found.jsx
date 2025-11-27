import Link from 'next/link';
import { Home, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <Music2 className="h-16 w-16 text-[#E9ECEF] mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-[#212529] mb-2">404</h1>
        <h2 className="text-xl font-medium text-[#6C757D] mb-6">
          Page not found
        </h2>
        <p className="text-[#6C757D] mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/select">
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}


