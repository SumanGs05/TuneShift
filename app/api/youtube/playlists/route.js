import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: 50,
    });

    const playlists = (response.data.items || []).map((playlist) => ({
      id: playlist.id,
      name: playlist.snippet.title,
      description: playlist.snippet.description,
      trackCount: playlist.contentDetails.itemCount,
      image: playlist.snippet.thumbnails?.medium?.url,
      updatedAt: playlist.snippet.publishedAt,
    }));

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('YouTube playlists error:', error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}


