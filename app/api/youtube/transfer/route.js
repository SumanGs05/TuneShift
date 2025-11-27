import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { google } from 'googleapis';
import { fuzzyMatch } from '@/lib/utils';

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

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Create new playlist
    const createResponse = await youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: playlistName,
          description: 'Migrated via TuneShift',
        },
        status: {
          privacyStatus: 'private',
        },
      },
    });

    const playlistId = createResponse.data.id;

    // Search and add tracks
    const matchedIds = [];
    const skippedTracks = [];

    for (const track of tracks) {
      try {
        const artistName = Array.isArray(track.artists)
          ? track.artists[0]?.name || track.artists[0]
          : track.artist;

        const searchQuery = `${track.name} ${artistName}`;

        const searchResponse = await youtube.search.list({
          part: ['snippet'],
          q: searchQuery,
          type: ['video'],
          videoCategoryId: '10', // Music category
          maxResults: 5,
        });

        const results = searchResponse.data.items || [];
        let bestMatch = null;

        for (const result of results) {
          const title = result.snippet.title;
          // Try to extract song info from YouTube title
          const parts = title.split(' - ');
          const matchedTrack = {
            name: parts.length >= 2 ? parts.slice(1).join(' - ') : title,
            artists: [{ name: parts[0] || 'Unknown' }],
          };

          const score = fuzzyMatch(track, matchedTrack);
          if (score >= 0.6) {
            // Lower threshold for YouTube due to title variations
            bestMatch = result;
            break;
          }
        }

        if (bestMatch) {
          // Add to playlist
          await youtube.playlistItems.insert({
            part: ['snippet'],
            requestBody: {
              snippet: {
                playlistId,
                resourceId: {
                  kind: 'youtube#video',
                  videoId: bestMatch.id.videoId,
                },
              },
            },
          });
          matchedIds.push(bestMatch.id.videoId);
        } else {
          skippedTracks.push({
            name: track.name,
            artist: artistName,
            reason: 'No match found',
          });
        }

        // Rate limiting - YouTube API has strict quotas
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (searchError) {
        console.error('YouTube search error:', searchError.message);
        skippedTracks.push({
          name: track.name,
          artist: track.artist || track.artists?.[0]?.name,
          reason: 'Search failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      playlistId,
      matched: matchedIds.length,
      skipped: skippedTracks,
    });
  } catch (error) {
    console.error('YouTube transfer error:', error.message);
    
    return NextResponse.json(
      { error: 'Failed to transfer playlist' },
      { status: 500 }
    );
  }
}


