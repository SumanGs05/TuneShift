import { ExternalLink } from 'lucide-react';

export function Footer() {
  const apiLinks = [
    { name: 'Spotify', url: 'https://developer.spotify.com/' },
    { name: 'YouTube Music', url: 'https://developers.google.com/youtube/' },
    { name: 'SoundCloud', url: 'https://developers.soundcloud.com/' },
    { name: 'Tidal', url: 'https://developer.tidal.com/' },
  ];

  return (
    <footer className="w-full border-t border-[#E9ECEF] bg-white py-6">
      <div className="container px-4 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-sm text-[#6C757D]">Powered by APIs</p>
          <div className="flex flex-wrap justify-center gap-4">
            {apiLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs text-[#6C757D] transition-smooth hover:text-[#4A90E2]"
              >
                {link.name}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            ))}
          </div>
          <p className="text-xs text-[#6C757D]">
            © {new Date().getFullYear()} TuneShift. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

