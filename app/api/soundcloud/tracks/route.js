import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

const SOUNDCLOUD_API = 'https://api.soundcloud.com';

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

    // Get playlist with tracks
    const response = await axios.get(`${SOUNDCLOUD_API}/playlists/${playlistId}`, {
      headers: {
        Authorization: `OAuth ${session.accessToken}`,
      },
    });

    const tracks = (response.data.tracks || []).map((track) => ({
      id: track.id.toString(),
      name: track.title,
      artist: track.user?.username || 'Unknown',
      artists: [{ name: track.user?.username || 'Unknown' }],
      album: null, // SoundCloud doesn't have albums in the same way
      duration: track.duration,
      permalink: track.permalink_url,
      artwork: track.artwork_url?.replace('-large', '-t500x500'),
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('SoundCloud tracks error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}


