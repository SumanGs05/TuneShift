import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

const TIDAL_API = 'https://api.tidal.com/v1';

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

    while (true) {
      const response = await axios.get(
        `${TIDAL_API}/playlists/${playlistId}/items`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            offset,
            limit,
            countryCode: 'US',
          },
        }
      );

      const items = response.data.items || [];
      if (items.length === 0) break;

      const tracks = items
        .filter((item) => item.type === 'track')
        .map((item) => ({
          id: item.item.id.toString(),
          name: item.item.title,
          artist: item.item.artist?.name || 'Unknown',
          artists: item.item.artists?.map((a) => ({ name: a.name })) || [],
          album: item.item.album?.title,
          duration: item.item.duration * 1000, // Convert to ms
          isrc: item.item.isrc,
        }));

      allTracks = [...allTracks, ...tracks];

      if (items.length < limit) break;
      offset += limit;
    }

    return NextResponse.json({ tracks: allTracks });
  } catch (error) {
    console.error('Tidal tracks error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}


