import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';
import { fuzzyMatch } from '@/lib/utils';

const SOUNDCLOUD_API = 'https://api.soundcloud.com';

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

    // Search and match tracks first
    const matchedIds = [];
    const skippedTracks = [];

    for (const track of tracks) {
      try {
        const artistName = Array.isArray(track.artists)
          ? track.artists[0]?.name || track.artists[0]
          : track.artist;

        const searchQuery = `${track.name} ${artistName}`;
        
        const searchResponse = await axios.get(`${SOUNDCLOUD_API}/tracks`, {
          headers: {
            Authorization: `OAuth ${session.accessToken}`,
          },
          params: {
            q: searchQuery,
            limit: 5,
          },
        });

        const results = searchResponse.data || [];
        let soundcloudTrack = null;

        for (const result of results) {
          const score = fuzzyMatch(track, {
            name: result.title,
            artists: [{ name: result.user?.username || '' }],
          });

          if (score >= 0.7) { // Slightly lower threshold for SoundCloud due to user uploads
            soundcloudTrack = result;
            break;
          }
        }

        if (soundcloudTrack) {
          matchedIds.push(soundcloudTrack.id);
        } else {
          skippedTracks.push({
            name: track.name,
            artist: artistName,
            reason: 'No match found',
          });
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (searchError) {
        console.error('SoundCloud search error:', searchError.message);
        skippedTracks.push({
          name: track.name,
          artist: track.artist || track.artists?.[0]?.name,
          reason: 'Search failed',
        });
      }
    }

    // Create playlist with matched tracks
    const createResponse = await axios.post(
      `${SOUNDCLOUD_API}/playlists`,
      {
        playlist: {
          title: playlistName,
          description: 'Migrated via TuneShift',
          sharing: 'private',
          tracks: matchedIds.map((id) => ({ id })),
        },
      },
      {
        headers: {
          Authorization: `OAuth ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const playlistId = createResponse.data?.id;

    return NextResponse.json({
      success: true,
      playlistId,
      matched: matchedIds.length,
      skipped: skippedTracks,
    });
  } catch (error) {
    console.error('SoundCloud transfer error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to transfer playlist' },
      { status: 500 }
    );
  }
}


