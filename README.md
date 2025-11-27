# TuneShift 🎵

A minimalist playlist migration tool for transferring playlists between Spotify, YouTube Music, SoundCloud, and Tidal.

## Features

- **Seamless Migration**: Transfer playlists between 4 major music services
- **Smart Matching**: Uses ISRC codes and fuzzy matching for accurate track matching
- **Real-time Progress**: Visual progress tracking during migration
- **Migration History**: View past migrations with detailed reports
- **Mobile-First Design**: Beautiful, responsive UI that works on any device

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js v5
- **State Management**: Zustand
- **Database**: Prisma + PostgreSQL
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API credentials for:
  - Spotify (Developer Dashboard)
  - Google/YouTube (Cloud Console)
  - SoundCloud (Developer Portal)
  - Tidal (Developer Portal)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tuneshift.git
cd tuneshift
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret"
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
SOUNDCLOUD_CLIENT_ID="..."
SOUNDCLOUD_CLIENT_SECRET="..."
TIDAL_CLIENT_ID="..."
TIDAL_CLIENT_SECRET="..."
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed with demo data:
```bash
npm run db:seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth routes
│   │   ├── spotify/              # Spotify API routes
│   │   ├── youtube/              # YouTube API routes
│   │   ├── soundcloud/           # SoundCloud API routes
│   │   ├── tidal/                # Tidal API routes
│   │   └── migrations/           # Migration history API
│   ├── select/                   # Service selection page
│   ├── migrate/                  # Migration page
│   ├── history/                  # History page
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── SelectionCards.jsx
│   ├── PlaylistTable.jsx
│   ├── ProgressReport.jsx
│   ├── HistoryTable.jsx
│   └── AuthModal.jsx
├── lib/
│   ├── auth.js                   # NextAuth configuration
│   ├── prisma.js                 # Prisma client
│   ├── store.js                  # Zustand store
│   └── utils.js                  # Utility functions
├── prisma/
│   └── schema.prisma             # Database schema
└── scripts/
    └── seed.js                   # Database seed script
```

## API Configuration

### Spotify

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `https://localhost:3443/api/auth/callback/spotify`
4. Copy Client ID and Client Secret

### YouTube Music

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://localhost:3443/api/auth/callback/youtube`

### SoundCloud

1. Go to [SoundCloud Developer Portal](https://developers.soundcloud.com)
2. Register your app
3. Add redirect URI: `https://localhost:3443/api/auth/callback/soundcloud`
4. Copy Client ID and Client Secret

### Tidal

1. Go to [Tidal Developer Portal](https://developer.tidal.com)
2. Create a new app
3. Add redirect URI: `https://localhost:3443/api/auth/callback/tidal`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

```bash
vercel
```

### Manual

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Your app URL |
| `AUTH_SECRET` | Random secret for sessions |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SOUNDCLOUD_CLIENT_ID` | SoundCloud app client ID |
| `SOUNDCLOUD_CLIENT_SECRET` | SoundCloud app client secret |
| `TIDAL_CLIENT_ID` | Tidal app client ID |
| `TIDAL_CLIENT_SECRET` | Tidal app client secret |

## License

MIT © TuneShift

---

Built with ♪ for music lovers everywhere.
