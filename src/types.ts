export type AudioQuality = 'FLAC' | '320k' | '256k' | '128k';
export type VideoQuality = '4K' | '1080p' | '720p' | '480p';
export type MediaType = 'audio' | 'video';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface MediaTrack {
  id: string;
  type: 'audio';
  title: string;
  artist: string;
  album: string;
  genre: string;
  coverUrl: string;
  audioUrl: string; // Direct audio URL or synth generator spec
  duration: number; // in seconds
  releaseYear: number;
  sampleRate: string; // e.g., "96 kHz / 24-bit"
  bitrate: string; // e.g., "1411 kbps (FLAC)"
  lyrics?: LyricLine[];
  isPopular?: boolean;
  isHiRes?: boolean;
  colorHex?: string;
  fileSizeMb: number; // Approx size for FLAC download
}

export interface VideoTrack {
  id: string;
  type: 'video';
  title: string;
  artist: string;
  genre: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  views: string;
  resolution: VideoQuality;
  releaseYear: number;
  fileSizeMb: number;
  isLiveConcert?: boolean;
}

export interface DownloadedItem {
  id: string;
  mediaId: string;
  mediaType: MediaType;
  title: string;
  artist: string;
  coverOrThumbnail: string;
  quality: AudioQuality | VideoQuality;
  format: string; // e.g., 'FLAC', 'MP3', 'MP4'
  fileSizeMb: number;
  downloadedAt: number; // timestamp
  blob: Blob;
  mimeType: string;
}

export interface DownloadTask {
  id: string;
  mediaId: string;
  mediaType: MediaType;
  title: string;
  quality: AudioQuality | VideoQuality;
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  speedMbps: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  createdAt: number;
  isAiGenerated?: boolean;
}

export interface EqualizerPreset {
  name: string;
  gains: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 4kHz, 14kHz
}

export type ActiveTab = 'discover' | 'music' | 'videos' | 'downloads' | 'playlists' | 'ai-curator' | 'storage';
