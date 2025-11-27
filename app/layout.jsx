import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'TuneShift - Playlist Migration Made Simple',
  description: 'Transfer your playlists between Spotify, YouTube Music, SoundCloud, and Tidal effortlessly.',
  keywords: ['playlist', 'migration', 'spotify', 'youtube music', 'soundcloud', 'tidal', 'transfer'],
  authors: [{ name: 'TuneShift' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'TuneShift - Playlist Migration Made Simple',
    description: 'Transfer your playlists between music services effortlessly.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

