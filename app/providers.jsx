'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#F8F9FA',
            border: '1px solid #E9ECEF',
            color: '#212529',
          },
          className: 'font-sans',
        }}
        closeButton
      />
    </SessionProvider>
  );
}


