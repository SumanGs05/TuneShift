'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export function PlaylistTable({ playlists, loading = false }) {
  const {
    selectedPlaylists,
    togglePlaylistSelection,
    selectAllPlaylists,
    deselectAllPlaylists,
  } = useAppStore();

  const allSelected = 
    playlists.length > 0 && 
    playlists.every((p) => selectedPlaylists.includes(p.id));

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAllPlaylists();
    } else {
      selectAllPlaylists();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6C757D]">No playlists found</p>
        <p className="text-sm text-[#6C757D] mt-1">
          Create some playlists in your source service first
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#E9ECEF] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F8F9FA]">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all playlists"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Tracks</TableHead>
            <TableHead className="hidden md:table-cell">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlists.map((playlist) => (
            <TableRow
              key={playlist.id}
              data-state={selectedPlaylists.includes(playlist.id) ? 'selected' : undefined}
              className="cursor-pointer"
              onClick={() => togglePlaylistSelection(playlist.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedPlaylists.includes(playlist.id)}
                  onCheckedChange={() => togglePlaylistSelection(playlist.id)}
                  aria-label={`Select ${playlist.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  {playlist.image && (
                    <img
                      src={playlist.image}
                      alt={playlist.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-[#212529]">{playlist.name}</p>
                    {playlist.description && (
                      <p className="text-xs text-[#6C757D] line-clamp-1">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center text-[#6C757D]">
                {playlist.trackCount}
              </TableCell>
              <TableCell className="hidden md:table-cell text-[#6C757D]">
                {playlist.updatedAt ? formatDate(playlist.updatedAt) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


