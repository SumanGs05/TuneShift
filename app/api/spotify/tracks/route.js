import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!playlistId) {
      return NextResponse.json(
        { error: 'Playlist ID required' },
        { status: 400 }
      );
    }

    // Fetch all tracks (handling pagination)
    let allTracks = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            offset,
            limit,
            fields: 'items(track(id,name,artists,album,duration_ms,external_ids)),next,total',
          },
        }
      );

      const tracks = response.data.items
        .filter((item) => item.track) // Filter out null tracks
        .map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((a) => ({
            name: a.name,
            id: a.id,
          })),
          album: item.track.album?.name,
          duration: item.track.duration_ms,
          isrc: item.track.external_ids?.isrc,
        }));

      allTracks = [...allTracks, ...tracks];
      hasMore = response.data.next !== null;
      offset += limit;
    }

    return NextResponse.json({ tracks: allTracks });
  } catch (error) {
    console.error('Spotify tracks error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}


