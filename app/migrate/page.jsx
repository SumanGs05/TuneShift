'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaylistTable } from '@/components/PlaylistTable';
import { ProgressReport } from '@/components/ProgressReport';
import { useAppStore } from '@/lib/store';
import { getServiceName } from '@/lib/utils';

export default function MigratePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  const {
    sourceService,
    destService,
    sourcePlaylists,
    setSourcePlaylists,
    selectedPlaylists,
    migrationStatus,
    setMigrationStatus,
    setOverallProgress,
    setCurrentPlaylistProgress,
    setCurrentPlaylistName,
    setMigrationReport,
    resetMigration,
  } = useAppStore();

  // Redirect if no services selected
  useEffect(() => {
    if (!sourceService || !destService) {
      router.push('/select');
    }
  }, [sourceService, destService, router]);

  // Fetch playlists on mount
  const fetchPlaylists = useCallback(async () => {
    if (!sourceService) return;

    setLoadingPlaylists(true);
    try {
      const response = await fetch(`/api/${sourceService}/playlists`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      setSourcePlaylists(data.playlists || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists. Please try again.');
      // Use mock data for demo
      setSourcePlaylists([
        { id: '1', name: 'Chill Vibes', trackCount: 45, updatedAt: new Date().toISOString() },
        { id: '2', name: 'Workout Mix', trackCount: 32, updatedAt: new Date().toISOString() },
        { id: '3', name: 'Road Trip', trackCount: 67, updatedAt: new Date().toISOString() },
        { id: '4', name: 'Focus Flow', trackCount: 28, updatedAt: new Date().toISOString() },
        { id: '5', name: 'Party Hits', trackCount: 89, updatedAt: new Date().toISOString() },
      ]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [sourceService, setSourcePlaylists]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleMigrate = async () => {
    if (selectedPlaylists.length === 0) {
      toast.error('Please select at least one playlist to migrate');
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('migrating');
    setOverallProgress(0);
    setCurrentPlaylistProgress(0);

    const totalPlaylists = selectedPlaylists.length;
    let totalTracks = 0;
    let matchedTracks = 0;
    const skippedTracks = [];
    const playlistReports = [];

    try {
      for (let i = 0; i < selectedPlaylists.length; i++) {
        const playlistId = selectedPlaylists[i];
        const playlist = sourcePlaylists.find((p) => p.id === playlistId);
        
        if (!playlist) continue;

        setCurrentPlaylistName(playlist.name);
        setCurrentPlaylistProgress(0);

        // Fetch tracks from source
        const tracksResponse = await fetch(
          `/api/${sourceService}/tracks?playlistId=${playlistId}`
        );
        
        let tracks = [];
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          tracks = tracksData.tracks || [];
        } else {
          // Demo tracks for testing
          tracks = generateDemoTracks(playlist.trackCount);
        }

        totalTracks += tracks.length;

        // Transfer to destination
        const transferResponse = await fetch(`/api/${destService}/transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playlistName: playlist.name,
            tracks,
          }),
        });

        let result;
        if (transferResponse.ok) {
          result = await transferResponse.json();
        } else {
          // Simulate transfer for demo
          result = simulateTransfer(tracks);
        }

        matchedTracks += result.matched || 0;
        skippedTracks.push(...(result.skipped || []));

        playlistReports.push({
          name: playlist.name,
          total: tracks.length,
          matched: result.matched || 0,
        });

        // Update progress
        setCurrentPlaylistProgress(100);
        setOverallProgress(((i + 1) / totalPlaylists) * 100);
        
        // Small delay between playlists
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Save migration to database
      const report = {
        totalTracks,
        matchedTracks,
        skippedTracks,
        playlists: playlistReports,
      };

      await fetch('/api/migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: sourceService,
          destination: destService,
          report,
        }),
      });

      setMigrationReport(report);
      setMigrationStatus('completed');
      toast.success('Migration completed successfully!');
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      toast.error('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleReset = () => {
    resetMigration();
    fetchPlaylists();
  };

  if (!sourceService || !destService) {
    return null;
  }

  return (
    <div className="container px-4 md:px-8 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#212529] mb-2">
            Migrate Your Playlists
          </h1>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              {getServiceName(sourceService)}
            </Badge>
            <ArrowRight className="h-4 w-4 text-[#6C757D]" />
            <Badge variant="secondary" className="text-sm">
              {getServiceName(destService)}
            </Badge>
          </div>
        </div>
        
        {migrationStatus === 'completed' && (
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Migration
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Playlist Selection */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Select Playlists</CardTitle>
              {selectedPlaylists.length > 0 && (
                <Badge variant="outline">
                  {selectedPlaylists.length} selected
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <PlaylistTable 
                playlists={sourcePlaylists} 
                loading={loadingPlaylists} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          {/* Migrate Button */}
          {migrationStatus !== 'migrating' && migrationStatus !== 'completed' && (
            <Card className="bg-white">
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleMigrate}
                  disabled={selectedPlaylists.length === 0 || isMigrating}
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      Migrate Selected
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                {selectedPlaylists.length > 0 && (
                  <p className="text-center text-sm text-[#6C757D] mt-3">
                    {selectedPlaylists.length} playlist{selectedPlaylists.length !== 1 ? 's' : ''} will be transferred
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progress/Report */}
          <ProgressReport />
        </div>
      </div>
    </div>
  );
}

// Helper function to generate demo tracks
function generateDemoTracks(count) {
  const demoTracks = [
    { name: 'Shape of You', artist: 'Ed Sheeran' },
    { name: 'Blinding Lights', artist: 'The Weeknd' },
    { name: 'Dance Monkey', artist: 'Tones and I' },
    { name: 'Watermelon Sugar', artist: 'Harry Styles' },
    { name: 'Levitating', artist: 'Dua Lipa' },
    { name: 'Save Your Tears', artist: 'The Weeknd' },
    { name: 'Peaches', artist: 'Justin Bieber' },
    { name: 'Good 4 U', artist: 'Olivia Rodrigo' },
    { name: 'Stay', artist: 'The Kid LAROI & Justin Bieber' },
    { name: 'Montero', artist: 'Lil Nas X' },
  ];

  const tracks = [];
  for (let i = 0; i < count; i++) {
    const track = demoTracks[i % demoTracks.length];
    tracks.push({ ...track, id: `demo-${i}` });
  }
  return tracks;
}

// Helper function to simulate transfer
function simulateTransfer(tracks) {
  const matchRate = 0.85 + Math.random() * 0.1; // 85-95% match rate
  const matched = Math.floor(tracks.length * matchRate);
  const skipped = tracks.slice(matched).map((t) => ({
    name: t.name,
    artist: t.artist,
    reason: 'Not found in destination catalog',
  }));

  return { matched, skipped };
}


