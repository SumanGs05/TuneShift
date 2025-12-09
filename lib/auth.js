import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';

// Spotify Provider
const SpotifyProvider = {
  id: 'spotify',
  name: 'Spotify',
  type: 'oauth',
  authorization: {
    url: 'https://accounts.spotify.com/authorize',
    params: {
      scope: 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-email user-read-private',
    },
  },
  token: 'https://accounts.spotify.com/api/token',
  userinfo: 'https://api.spotify.com/v1/me',
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id,
      name: profile.display_name,
      email: profile.email,
      image: profile.images?.[0]?.url,
    };
  },
};

// Custom Google/YouTube Provider
const YouTubeProvider = {
  id: 'youtube',
  name: 'YouTube Music',
  type: 'oauth',
  authorization: {
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    params: {
      scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  token: 'https://oauth2.googleapis.com/token',
  userinfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

// Custom Tidal Provider
const TidalProvider = {
  id: 'tidal',
  name: 'Tidal',
  type: 'oauth',
  authorization: {
    url: 'https://login.tidal.com/authorize',
    params: {
      scope: 'r_usr w_usr',
    },
  },
  token: 'https://auth.tidal.com/v1/oauth2/token',
  userinfo: 'https://api.tidal.com/v1/users/me',
  clientId: process.env.TIDAL_CLIENT_ID,
  clientSecret: process.env.TIDAL_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.userId?.toString() || profile.id,
      name: profile.username || profile.firstName,
      email: profile.email,
      image: null,
    };
  },
};

// Custom SoundCloud Provider
const SoundCloudProvider = {
  id: 'soundcloud',
  name: 'SoundCloud',
  type: 'oauth',
  authorization: {
    url: 'https://api.soundcloud.com/connect',
    params: {
      scope: 'non-expiring',
      response_type: 'code',
    },
  },
  token: 'https://api.soundcloud.com/oauth2/token',
  userinfo: 'https://api.soundcloud.com/me',
  clientId: process.env.SOUNDCLOUD_CLIENT_ID,
  clientSecret: process.env.SOUNDCLOUD_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id?.toString(),
      name: profile.username || profile.full_name,
      email: null, // SoundCloud doesn't always provide email
      image: profile.avatar_url,
    };
  },
};

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [SpotifyProvider, YouTubeProvider, SoundCloudProvider, TidalProvider],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.provider = token.provider;
      session.userId = token.userId;
      return session;
    },
  },
  pages: {
    signIn: '/select',
    error: '/select',
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

