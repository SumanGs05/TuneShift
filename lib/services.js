// Service configurations and helpers

export const services = {
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    color: '#1DB954',
    scopes: [
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-email',
      'user-read-private',
    ],
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    apiUrl: 'https://api.spotify.com/v1',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Music',
    color: '#FF0000',
    scopes: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    apiUrl: 'https://www.googleapis.com/youtube/v3',
  },
  soundcloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    color: '#FF5500',
    scopes: ['non-expiring'],
    authUrl: 'https://api.soundcloud.com/connect',
    tokenUrl: 'https://api.soundcloud.com/oauth2/token',
    apiUrl: 'https://api.soundcloud.com',
  },
  tidal: {
    id: 'tidal',
    name: 'Tidal',
    color: '#000000',
    scopes: ['r_usr', 'w_usr'],
    authUrl: 'https://login.tidal.com/authorize',
    tokenUrl: 'https://auth.tidal.com/v1/oauth2/token',
    apiUrl: 'https://api.tidal.com/v1',
  },
};

export function getServiceConfig(serviceId) {
  return services[serviceId] || null;
}

export function getServiceName(serviceId) {
  return services[serviceId]?.name || serviceId;
}

export function getAllServices() {
  return Object.values(services);
}

// Match rate thresholds
export const MATCH_THRESHOLDS = {
  EXACT: 1.0,      // Exact ISRC match
  HIGH: 0.9,       // Very confident match
  MEDIUM: 0.8,     // Confident match (default)
  LOW: 0.6,        // Possible match (requires verification)
};

// Rate limiting configurations per service
export const RATE_LIMITS = {
  spotify: {
    requestsPerSecond: 10,
    batchSize: 100,
  },
  youtube: {
    requestsPerSecond: 1, // YouTube has strict quotas
    batchSize: 50,
  },
  soundcloud: {
    requestsPerSecond: 5,
    batchSize: 50,
  },
  tidal: {
    requestsPerSecond: 5,
    batchSize: 100,
  },
};

// Helper to add delay for rate limiting
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to process items in batches
export async function processBatch(items, batchSize, processor) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch, i);
    results.push(...batchResults);
  }
  return results;
}

