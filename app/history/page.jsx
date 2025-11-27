'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryTable } from '@/components/HistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [migrations, setMigrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMigrations = async () => {
      try {
        const response = await fetch('/api/migrations');
        
        if (response.ok) {
          const data = await response.json();
          setMigrations(data.migrations || []);
        } else {
          // Demo data for testing
          setMigrations([
            {
              id: '1',
              source: 'spotify',
              destination: 'soundcloud',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              status: 'completed',
              report: {
                totalTracks: 156,
                matchedTracks: 142,
                skippedTracks: [
                  { name: 'Rare Track 1', artist: 'Unknown Artist' },
                  { name: 'Local File', artist: 'Local' },
                ],
                playlists: [
                  { name: 'Summer Hits', total: 45, matched: 43 },
                  { name: 'Workout Mix', total: 32, matched: 30 },
                  { name: 'Chill Vibes', total: 79, matched: 69 },
                ],
              },
            },
            {
              id: '2',
              source: 'youtube',
              destination: 'tidal',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              status: 'completed',
              report: {
                totalTracks: 89,
                matchedTracks: 78,
                skippedTracks: [
                  { name: 'YouTube Exclusive', artist: 'Various' },
                ],
                playlists: [
                  { name: 'My Favorites', total: 89, matched: 78 },
                ],
              },
            },
            {
              id: '3',
              source: 'soundcloud',
              destination: 'spotify',
              createdAt: new Date(Date.now() - 604800000).toISOString(),
              status: 'completed',
              report: {
                totalTracks: 234,
                matchedTracks: 228,
                skippedTracks: [],
                playlists: [
                  { name: 'Road Trip', total: 67, matched: 65 },
                  { name: 'Study Music', total: 45, matched: 44 },
                  { name: 'Party Playlist', total: 122, matched: 119 },
                ],
              },
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching migrations:', error);
        // Use demo data on error
        setMigrations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMigrations();
  }, []);

  return (
    <div className="container px-4 md:px-8 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#212529] mb-2">
            Migration History
          </h1>
          <p className="text-[#6C757D]">
            View your past playlist migrations and reports
          </p>
        </div>
        
        <Link href="/select">
          <Button>
            New Migration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* History Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Past Migrations</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryTable migrations={migrations} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}

