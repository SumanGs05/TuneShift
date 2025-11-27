'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Music2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export function Header() {
  const { data: session } = useSession();
  const { clearServices, clearTokens, resetMigration } = useAppStore();

  const handleLogout = async () => {
    clearServices();
    clearTokens();
    resetMigration();
    await signOut({ callbackUrl: '/select' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E9ECEF] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Link 
          href="/select" 
          className="flex items-center space-x-2 transition-smooth hover:opacity-80"
        >
          <Music2 className="h-6 w-6 text-[#4A90E2]" />
          <span className="text-xl font-semibold text-[#212529]">TuneShift</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {session ? (
            <>
              <Link 
                href="/migrate"
                className="text-sm text-[#6C757D] transition-smooth hover:text-[#212529]"
              >
                Migrate
              </Link>
              <Link 
                href="/history"
                className="text-sm text-[#6C757D] transition-smooth hover:text-[#212529]"
              >
                History
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#6C757D] hover:text-[#212529]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}


