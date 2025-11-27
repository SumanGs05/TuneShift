import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

const SOUNDCLOUD_API = 'https://api.soundcloud.com';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's playlists
    const response = await axios.get(`${SOUNDCLOUD_API}/me/playlists`, {
      headers: {
        Authorization: `OAuth ${session.accessToken}`,
      },
      params: {
        limit: 50,
      },
    });

    const playlists = (response.data || []).map((playlist) => ({
      id: playlist.id.toString(),
      name: playlist.title,
      description: playlist.description || '',
      trackCount: playlist.track_count,
      image: playlist.artwork_url?.replace('-large', '-t500x500'),
      updatedAt: playlist.last_modified,
      owner: playlist.user?.username,
      public: playlist.sharing === 'public',
    }));

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('SoundCloud playlists error:', error.response?.data || error.message);
    
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


