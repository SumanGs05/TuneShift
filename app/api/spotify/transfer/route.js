import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';
import { fuzzyMatch } from '@/lib/utils';

const SPOTIFY_API = 'https://api.spotify.com/v1';

export async function POST(request) {
  try {
    const session = await auth();
    const { playlistName, tracks } = await request.json();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID
    const userResponse = await axios.get(`${SPOTIFY_API}/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const userId = userResponse.data.id;

    // Create new playlist
    const createResponse = await axios.post(
      `${SPOTIFY_API}/users/${userId}/playlists`,
      {
        name: playlistName,
        description: `Migrated via TuneShift`,
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const playlistId = createResponse.data.id;

    // Search and match tracks
    const matchedUris = [];
    const skippedTracks = [];

    for (const track of tracks) {
      try {
        // Try ISRC first if available
        let spotifyTrack = null;

        if (track.isrc) {
          const isrcResponse = await axios.get(`${SPOTIFY_API}/search`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
            params: {
              q: `isrc:${track.isrc}`,
              type: 'track',
              limit: 1,
            },
          });
          spotifyTrack = isrcResponse.data.tracks.items[0];
        }

        // Fallback to name/artist search
        if (!spotifyTrack) {
          const artistName = Array.isArray(track.artists)
            ? track.artists[0]?.name || track.artists[0]
            : track.artist;

          const searchQuery = `track:${track.name} artist:${artistName}`;
          const searchResponse = await axios.get(`${SPOTIFY_API}/search`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
            params: {
              q: searchQuery,
              type: 'track',
              limit: 5,
            },
          });

          const results = searchResponse.data.tracks.items;

          // Find best match using fuzzy matching
          for (const result of results) {
            const score = fuzzyMatch(track, {
              name: result.name,
              artists: result.artists,
            });

            if (score >= 0.8) {
              spotifyTrack = result;
              break;
            }
          }
        }

        if (spotifyTrack) {
          matchedUris.push(spotifyTrack.uri);
        } else {
          skippedTracks.push({
            name: track.name,
            artist: Array.isArray(track.artists)
              ? track.artists[0]?.name || track.artists[0]
              : track.artist,
            reason: 'No match found',
          });
        }
      } catch (searchError) {
        console.error('Search error:', searchError.message);
        skippedTracks.push({
          name: track.name,
          artist: track.artist || track.artists?.[0]?.name,
          reason: 'Search failed',
        });
      }
    }

    // Add tracks to playlist in batches of 100
    const batchSize = 100;
    for (let i = 0; i < matchedUris.length; i += batchSize) {
      const batch = matchedUris.slice(i, i + batchSize);
      await axios.post(
        `${SPOTIFY_API}/playlists/${playlistId}/tracks`,
        { uris: batch },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      playlistId,
      matched: matchedUris.length,
      skipped: skippedTracks,
    });
  } catch (error) {
    console.error('Spotify transfer error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to transfer playlist' },
      { status: 500 }
    );
  }
}


