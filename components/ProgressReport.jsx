'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  Download 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { calculateSuccessRate, getServiceName } from '@/lib/utils';
import Link from 'next/link';

export function ProgressReport() {
  const {
    migrationStatus,
    overallProgress,
    currentPlaylistProgress,
    currentPlaylistName,
    migrationReport,
    sourceService,
    destService,
  } = useAppStore();

  // Active migration progress
  if (migrationStatus === 'migrating') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Migration in Progress</span>
            <Badge variant="secondary">{Math.round(overallProgress)}%</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6C757D]">Overall Progress</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {currentPlaylistName && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6C757D] truncate max-w-[200px]">
                  {currentPlaylistName}
                </span>
                <span className="font-medium">{Math.round(currentPlaylistProgress)}%</span>
              </div>
              <Progress value={currentPlaylistProgress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-center text-sm text-[#6C757D]">
            <div className="animate-pulse flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-[#4A90E2]" />
              <span>Transferring tracks...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed migration report
  if (migrationStatus === 'completed' && migrationReport) {
    const { totalTracks, matchedTracks, skippedTracks, playlists } = migrationReport;
    const successRate = calculateSuccessRate(matchedTracks, totalTracks);

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Migration Complete</span>
            </div>
            <Badge 
              variant={successRate >= 80 ? 'success' : successRate >= 50 ? 'warning' : 'destructive'}
            >
              {successRate}% Success
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-[#F8F9FA]">
              <p className="text-2xl font-semibold text-[#212529]">{totalTracks}</p>
              <p className="text-xs text-[#6C757D]">Total Tracks</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-2xl font-semibold text-green-600">{matchedTracks}</p>
              <p className="text-xs text-[#6C757D]">Matched</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50">
              <p className="text-2xl font-semibold text-red-600">{skippedTracks?.length || 0}</p>
              <p className="text-xs text-[#6C757D]">Skipped</p>
            </div>
          </div>

          {skippedTracks && skippedTracks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#212529]">Skipped Tracks</p>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-[#E9ECEF] p-3">
                {skippedTracks.slice(0, 10).map((track, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-2 py-1 text-sm"
                  >
                    <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <span className="text-[#6C757D] truncate">
                      {track.name} - {track.artist}
                    </span>
                  </div>
                ))}
                {skippedTracks.length > 10 && (
                  <p className="text-xs text-[#6C757D] mt-2">
                    +{skippedTracks.length - 10} more...
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/history" className="flex-1">
              <Button variant="outline" className="w-full">
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              onClick={() => {
                const blob = new Blob([JSON.stringify(migrationReport, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `migration-report-${Date.now()}.json`;
                a.click();
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (migrationStatus === 'error') {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-[#212529]">Migration Failed</p>
          <p className="text-sm text-[#6C757D] mt-1 text-center">
            Something went wrong during the migration. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}


