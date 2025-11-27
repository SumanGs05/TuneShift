import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';
import { fuzzyMatch } from '@/lib/utils';

const TIDAL_API = 'https://api.tidal.com/v1';

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
    const userResponse = await axios.get(`${TIDAL_API}/users/me`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    const userId = userResponse.data.userId;

    // Create new playlist
    const createResponse = await axios.post(
      `${TIDAL_API}/users/${userId}/playlists`,
      {
        title: playlistName,
        description: 'Migrated via TuneShift',
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          countryCode: 'US',
        },
      }
    );

    const playlistId = createResponse.data.uuid;

    // Search and match tracks
    const matchedIds = [];
    const skippedTracks = [];

    for (const track of tracks) {
      try {
        // Try ISRC first
        let tidalTrack = null;

        if (track.isrc) {
          const isrcResponse = await axios.get(
            `${TIDAL_API}/tracks`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
              params: {
                isrc: track.isrc,
                countryCode: 'US',
              },
            }
          );
          tidalTrack = isrcResponse.data.items?.[0];
        }

        // Fallback to search
        if (!tidalTrack) {
          const artistName = Array.isArray(track.artists)
            ? track.artists[0]?.name || track.artists[0]
            : track.artist;

          const searchQuery = `${track.name} ${artistName}`;
          const searchResponse = await axios.get(
            `${TIDAL_API}/search/tracks`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
              params: {
                query: searchQuery,
                limit: 5,
                countryCode: 'US',
              },
            }
          );

          const results = searchResponse.data.items || [];

          for (const result of results) {
            const score = fuzzyMatch(track, {
              name: result.title,
              artists: result.artists || [],
            });

            if (score >= 0.8) {
              tidalTrack = result;
              break;
            }
          }
        }

        if (tidalTrack) {
          matchedIds.push(tidalTrack.id);
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
        console.error('Tidal search error:', searchError.message);
        skippedTracks.push({
          name: track.name,
          artist: track.artist || track.artists?.[0]?.name,
          reason: 'Search failed',
        });
      }
    }

    // Add tracks to playlist in batches
    const batchSize = 100;
    for (let i = 0; i < matchedIds.length; i += batchSize) {
      const batch = matchedIds.slice(i, i + batchSize);
      await axios.post(
        `${TIDAL_API}/playlists/${playlistId}/items`,
        {
          trackIds: batch.join(','),
          onDupes: 'FAIL',
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            countryCode: 'US',
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      playlistId,
      matched: matchedIds.length,
      skipped: skippedTracks,
    });
  } catch (error) {
    console.error('Tidal transfer error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to transfer playlist' },
      { status: 500 }
    );
  }
}


