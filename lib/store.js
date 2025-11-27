import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Service selection
      sourceService: null,
      destService: null,
      setSourceService: (service) => set({ sourceService: service }),
      setDestService: (service) => set({ destService: service }),
      clearServices: () => set({ sourceService: null, destService: null }),

      // Tokens storage
      tokens: {},
      setToken: (service, token) =>
        set((state) => ({
          tokens: { ...state.tokens, [service]: token },
        })),
      getToken: (service) => get().tokens[service],
      clearTokens: () => set({ tokens: {} }),

      // Playlists
      sourcePlaylists: [],
      setSourcePlaylists: (playlists) => set({ sourcePlaylists: playlists }),
      selectedPlaylists: [],
      setSelectedPlaylists: (ids) => set({ selectedPlaylists: ids }),
      togglePlaylistSelection: (id) =>
        set((state) => ({
          selectedPlaylists: state.selectedPlaylists.includes(id)
            ? state.selectedPlaylists.filter((p) => p !== id)
            : [...state.selectedPlaylists, id],
        })),
      selectAllPlaylists: () =>
        set((state) => ({
          selectedPlaylists: state.sourcePlaylists.map((p) => p.id),
        })),
      deselectAllPlaylists: () => set({ selectedPlaylists: [] }),

      // Migration progress
      migrationStatus: 'idle', // idle, authenticating, fetching, migrating, completed, error
      setMigrationStatus: (status) => set({ migrationStatus: status }),
      
      overallProgress: 0,
      setOverallProgress: (progress) => set({ overallProgress: progress }),
      
      currentPlaylistProgress: 0,
      setCurrentPlaylistProgress: (progress) => set({ currentPlaylistProgress: progress }),
      
      currentPlaylistName: '',
      setCurrentPlaylistName: (name) => set({ currentPlaylistName: name }),

      // Migration report
      migrationReport: null,
      setMigrationReport: (report) => set({ migrationReport: report }),
      clearMigrationReport: () => set({ migrationReport: null }),

      // Reset all migration state
      resetMigration: () =>
        set({
          sourcePlaylists: [],
          selectedPlaylists: [],
          migrationStatus: 'idle',
          overallProgress: 0,
          currentPlaylistProgress: 0,
          currentPlaylistName: '',
          migrationReport: null,
        }),

      // Error handling
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'tuneshift-storage',
      partialize: (state) => ({
        sourceService: state.sourceService,
        destService: state.destService,
        tokens: state.tokens,
      }),
    }
  )
);


