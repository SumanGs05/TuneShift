'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Eye, ArrowRight, Download } from 'lucide-react';
import { formatDate, getServiceName, calculateSuccessRate } from '@/lib/utils';

export function HistoryTable({ migrations, loading = false }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const viewReport = (migration) => {
    setSelectedReport(migration);
    setDialogOpen(true);
  };

  const downloadReport = (migration) => {
    const blob = new Blob([JSON.stringify(migration.report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-${migration.id}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!migrations || migrations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6C757D]">No migration history</p>
        <p className="text-sm text-[#6C757D] mt-1">
          Your completed migrations will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-[#E9ECEF] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8F9FA]">
              <TableHead>Date</TableHead>
              <TableHead>Migration</TableHead>
              <TableHead className="text-center">Success</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {migrations.map((migration) => {
              const report = migration.report || {};
              const successRate = calculateSuccessRate(
                report.matchedTracks || 0,
                report.totalTracks || 0
              );

              return (
                <TableRow key={migration.id}>
                  <TableCell className="text-[#6C757D]">
                    {formatDate(migration.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {getServiceName(migration.source)}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-[#6C757D]" />
                      <Badge variant="secondary">
                        {getServiceName(migration.destination)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        successRate >= 80
                          ? 'success'
                          : successRate >= 50
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {successRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewReport(migration)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReport(migration)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Migration Report</DialogTitle>
            <DialogDescription>
              {selectedReport && formatDate(selectedReport.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {getServiceName(selectedReport.source)}
                </Badge>
                <ArrowRight className="h-4 w-4 text-[#6C757D]" />
                <Badge variant="secondary">
                  {getServiceName(selectedReport.destination)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-[#F8F9FA]">
                  <p className="text-2xl font-semibold text-[#212529]">
                    {selectedReport.report?.totalTracks || 0}
                  </p>
                  <p className="text-xs text-[#6C757D]">Total Tracks</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <p className="text-2xl font-semibold text-green-600">
                    {selectedReport.report?.matchedTracks || 0}
                  </p>
                  <p className="text-xs text-[#6C757D]">Matched</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50">
                  <p className="text-2xl font-semibold text-red-600">
                    {selectedReport.report?.skippedTracks?.length || 0}
                  </p>
                  <p className="text-xs text-[#6C757D]">Skipped</p>
                </div>
              </div>

              {selectedReport.report?.playlists && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#212529]">
                    Playlists Migrated
                  </p>
                  <div className="space-y-2">
                    {selectedReport.report.playlists.map((playlist, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg bg-[#F8F9FA]"
                      >
                        <span className="text-sm text-[#212529]">
                          {playlist.name}
                        </span>
                        <Badge
                          variant={
                            calculateSuccessRate(
                              playlist.matched,
                              playlist.total
                            ) >= 80
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {playlist.matched}/{playlist.total}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.report?.skippedTracks?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#212529]">
                    Skipped Tracks
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-[#E9ECEF] p-3">
                    {selectedReport.report.skippedTracks.map((track, index) => (
                      <div
                        key={index}
                        className="py-1 text-sm text-[#6C757D]"
                      >
                        {track.name} - {track.artist}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


