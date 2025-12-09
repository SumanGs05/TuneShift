import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import stringSimilarity from 'string-similarity';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**

 * Compares track name and artist for similarity
 * @param {Object} sourceTrack - The source track to match
 * @param {Object} destTrack - The destination track to compare
 * @returns {number} - Similarity score between 0 and 1
 */
export function fuzzyMatch(sourceTrack, destTrack) {
  const sourceName = normalizeString(sourceTrack.name || '');
  const destName = normalizeString(destTrack.name || '');
  
  const sourceArtist = normalizeString(
    Array.isArray(sourceTrack.artists) 
      ? sourceTrack.artists.map(a => a.name || a).join(' ')
      : sourceTrack.artist || ''
  );
  const destArtist = normalizeString(
    Array.isArray(destTrack.artists)
      ? destTrack.artists.map(a => a.name || a).join(' ')
      : destTrack.artist || ''
  );

  const nameScore = stringSimilarity.compareTwoStrings(sourceName, destName);
  const artistScore = stringSimilarity.compareTwoStrings(sourceArtist, destArtist);
  
  // Weight name slightly higher than artist
  return (nameScore * 0.6) + (artistScore * 0.4);
}

/**
 
 * @param {string} str - String to normalize
 * @returns {string} - Normalized string
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format duration from milliseconds to mm:ss
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
export function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get service display name
 * @param {string} service - Service identifier
 * @returns {string} - Display name
 */
export function getServiceName(service) {
  const names = {
    spotify: 'Spotify',
    youtube: 'YouTube Music',
    soundcloud: 'SoundCloud',
    tidal: 'Tidal',
  };
  return names[service] || service;
}

/**
 * Calculate success percentage
 * @param {number} matched - Number of matched tracks
 * @param {number} total - Total number of tracks
 * @returns {number} - Success percentage
 */
export function calculateSuccessRate(matched, total) {
  if (total === 0) return 100;
  return Math.round((matched / total) * 100);
}

