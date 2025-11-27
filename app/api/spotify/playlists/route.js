import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        limit: 50,
      },
    });

    const playlists = response.data.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      trackCount: playlist.tracks.total,
      image: playlist.images?.[0]?.url,
      updatedAt: playlist.snapshot_id, // Spotify doesn't provide updated date
      owner: playlist.owner.display_name,
      public: playlist.public,
    }));

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('Spotify playlists error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}


