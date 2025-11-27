import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

const TIDAL_API = 'https://api.tidal.com/v1';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user info first
    const userResponse = await axios.get(`${TIDAL_API}/users/me`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const userId = userResponse.data.userId;

    // Get playlists
    const response = await axios.get(
      `${TIDAL_API}/users/${userId}/playlists`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          limit: 50,
          countryCode: 'US',
        },
      }
    );

    const playlists = (response.data.items || []).map((playlist) => ({
      id: playlist.uuid,
      name: playlist.title,
      description: playlist.description || '',
      trackCount: playlist.numberOfTracks,
      image: playlist.image
        ? `https://resources.tidal.com/images/${playlist.image.replace(/-/g, '/')}/320x320.jpg`
        : null,
      updatedAt: playlist.lastUpdated,
    }));

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('Tidal playlists error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}


