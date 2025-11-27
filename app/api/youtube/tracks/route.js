import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { google } from 'googleapis';

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

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Fetch all tracks (handling pagination)
    let allTracks = [];
    let pageToken = null;

    do {
      const response = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId,
        maxResults: 50,
        pageToken,
      });

      const tracks = (response.data.items || [])
        .filter((item) => item.snippet.title !== 'Deleted video')
        .map((item) => {
          // Try to extract artist and track name from title
          const title = item.snippet.title;
          const parts = title.split(' - ');
          
          let artist = 'Unknown Artist';
          let name = title;

          if (parts.length >= 2) {
            artist = parts[0].trim();
            name = parts.slice(1).join(' - ').trim();
          }

          return {
            id: item.contentDetails.videoId,
            name,
            artist,
            artists: [{ name: artist }],
            videoId: item.contentDetails.videoId,
            thumbnail: item.snippet.thumbnails?.default?.url,
          };
        });

      allTracks = [...allTracks, ...tracks];
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return NextResponse.json({ tracks: allTracks });
  } catch (error) {
    console.error('YouTube tracks error:', error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}


