import React, { useState, useEffect, useRef } from 'react';
import { Moon } from 'lucide-react';
import {
  MediaTrack,
  VideoTrack,
  DownloadedItem,
  Playlist,
  AudioQuality,
  VideoQuality,
  ActiveTab,
} from './types';
import { INITIAL_TRACKS, INITIAL_VIDEOS, INITIAL_PLAYLISTS } from './data/mediaLibrary';
import {
  saveDownloadedMedia,
  getAllDownloadedMedia,
  deleteDownloadedMedia,
  clearAllOfflineMedia,
  getStorageStats,
} from './lib/indexedDB';
import { audioEngine, AudioEngine } from './lib/audioEngine';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { EqualizerModal } from './components/EqualizerModal';
import { LyricsPanel } from './components/LyricsPanel';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AICuratorModal } from './components/AICuratorModal';
import { MiniPlayer } from './components/MiniPlayer';

import { HomeView } from './views/HomeView';
import { MusicView } from './views/MusicView';
import { VideoView } from './views/VideoView';
import { DownloadsView } from './views/DownloadsView';
import { PlaylistsView } from './views/PlaylistsView';
import { StorageSettingsView } from './views/StorageSettingsView';

export default function App() {
  // Navigation & Search
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);

  // Library State
  const [tracks, setTracks] = useState<MediaTrack[]>(INITIAL_TRACKS);
  const [videos, setVideos] = useState<VideoTrack[]>(INITIAL_VIDEOS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);

  // Offline Downloads State
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [storageUsageMb, setStorageUsageMb] = useState<number>(0);
  const [storageQuotaMb, setStorageQuotaMb] = useState<number>(15360);

  // Preferences
  const [defaultAudioQuality, setDefaultAudioQuality] = useState<AudioQuality>('FLAC');
  const [defaultVideoQuality, setDefaultVideoQuality] = useState<VideoQuality>('1080p');

  // Playback State
  const [currentMedia, setCurrentMedia] = useState<MediaTrack | VideoTrack | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(INITIAL_TRACKS[0].duration);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('FLAC');

  // Modals & Mini Player
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isAiCuratorOpen, setIsAiCuratorOpen] = useState<boolean>(false);
  const [isMiniPlayerMode, setIsMiniPlayerMode] = useState<boolean>(false);

  // Sleep Timer State
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);
  const [sleepTimerNotification, setSleepTimerNotification] = useState<string | null>(null);

  // Audio HTML Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasCrossfadedRef = useRef<boolean>(false);

  // Sleep Timer Effect
  useEffect(() => {
    if (sleepTimerSeconds === null) return;

    if (sleepTimerSeconds <= 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setSleepTimerSeconds(null);
      setSleepTimerNotification('Sleep timer ended — playback automatically paused.');
      setTimeout(() => setSleepTimerNotification(null), 5000);
      return;
    }

    const timer = setInterval(() => {
      setSleepTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerSeconds]);

  const handleSetSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerSeconds(null);
      setSleepTimerNotification('Sleep timer turned off');
      setTimeout(() => setSleepTimerNotification(null), 3000);
    } else {
      setSleepTimerSeconds(minutes * 60);
      setSleepTimerNotification(`Sleep timer active: set for ${minutes} minute${minutes > 1 ? 's' : ''}`);
      setTimeout(() => setSleepTimerNotification(null), 3000);
    }
  };

  // Set of Downloaded IDs for fast lookup
  const downloadedMediaIds = new Set(downloadedItems.map((item) => item.mediaId));

  // Initialize & Load Offline Downloads from IndexedDB
  useEffect(() => {
    async function loadOfflineMedia() {
      try {
        const items = await getAllDownloadedMedia();
        setDownloadedItems(items);
        const stats = await getStorageStats();
        setStorageUsageMb(stats.usageMb);
        setStorageQuotaMb(stats.quotaMb);
      } catch (err) {
        console.warn('Failed to load offline storage:', err);
      }
    }
    loadOfflineMedia();
  }, []);

  // Update storage stats whenever downloads change
  const refreshStorageStats = async () => {
    const items = await getAllDownloadedMedia();
    setDownloadedItems(items);
    const stats = await getStorageStats();
    setStorageUsageMb(stats.usageMb);
  };

  // HTML5 Audio Event Listeners
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    audioEl.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime);

      // Auto Crossfade Trigger near track end
      const crossfadeDur = audioEngine.getCrossfadeDuration();
      const totalDur = audioEl.duration || currentMedia?.duration || 0;

      if (
        crossfadeDur > 0 &&
        !isRepeat &&
        totalDur > crossfadeDur + 1 &&
        audioEl.currentTime >= totalDur - crossfadeDur &&
        !hasCrossfadedRef.current
      ) {
        hasCrossfadedRef.current = true;
        audioEngine.fadeOut(crossfadeDur);
      }
    };
    const handleLoadedMetadata = () => setDuration(audioEl.duration || currentMedia?.duration || 0);
    const handleEnded = () => {
      if (isRepeat) {
        audioEl.currentTime = 0;
        audioEl.play().catch((err) => {
          if (err?.name !== 'AbortError') {
            console.warn('Repeat playback error:', err);
          }
        });
      } else {
        handleSkipNext();
      }
    };

    audioEl.addEventListener('timeupdate', handleTimeUpdate);
    audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioEl.addEventListener('ended', handleEnded);

    return () => {
      audioEl.removeEventListener('timeupdate', handleTimeUpdate);
      audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioEl.removeEventListener('ended', handleEnded);
    };
  }, [currentMedia?.id, isRepeat, isMuted, volume]);

  // Handle Play Media (Audio Track or Video Track)
  const handlePlayMedia = async (media: MediaTrack | VideoTrack) => {
    setCurrentMedia(media);

    if (media.type === 'video') {
      setIsPlaying(false);
      setIsVideoModalOpen(true);
      return;
    }

    const track = media as MediaTrack;
    const audioEl = audioRef.current;
    if (!audioEl) return;

    hasCrossfadedRef.current = false;

    // Pause current audio before changing src to prevent interrupted play request errors
    try {
      audioEl.pause();
    } catch (_) {
      // ignore
    }

    // Check if track exists in offline IndexedDB
    const offlineItem = downloadedItems.find((item) => item.mediaId === track.id);

    if (offlineItem && offlineItem.blob) {
      const blobUrl = URL.createObjectURL(offlineItem.blob);
      audioEl.src = blobUrl;
    } else if (isSimulatedOffline) {
      // In simulated offline mode, generate high quality WAV blob dynamically if not cached
      const synthBlob = AudioEngine.generateHighQualityAudioBlob(track.title, track.duration);
      audioEl.src = URL.createObjectURL(synthBlob);
    } else {
      audioEl.src = track.audioUrl;
    }

    audioEl.load();
    audioEngine.init(audioEl);
    audioEngine.resumeContext();

    const crossfadeDur = audioEngine.getCrossfadeDuration();
    if (crossfadeDur > 0) {
      audioEngine.fadeIn(crossfadeDur);
    } else {
      audioEngine.resetGain();
    }

    try {
      await audioEl.play();
      setIsPlaying(true);
    } catch (err: any) {
      // If the play request was interrupted by another load/track change, swallow gracefully
      if (err?.name === 'AbortError' || err?.message?.includes('interrupted')) {
        console.warn('Playback request interrupted by track change or load:', err.message);
        return;
      }

      // Fallback to high quality synth audio if remote audio stream is blocked by CORS/network
      try {
        const fallbackBlob = AudioEngine.generateHighQualityAudioBlob(track.title, track.duration);
        audioEl.src = URL.createObjectURL(fallbackBlob);
        audioEl.load();
        await audioEl.play();
        setIsPlaying(true);
      } catch (fallbackErr: any) {
        if (fallbackErr?.name === 'AbortError' || fallbackErr?.message?.includes('interrupted')) {
          console.warn('Fallback playback interrupted:', fallbackErr.message);
        } else {
          console.error('Failed to play fallback audio:', fallbackErr);
        }
      }
    }
  };

  // Toggle Play / Pause
  const handleTogglePlay = async () => {
    const audioEl = audioRef.current;
    if (!audioEl || !currentMedia) return;

    if (currentMedia.type === 'video') {
      setIsVideoModalOpen(true);
      return;
    }

    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      if (!audioEl.src) {
        await handlePlayMedia(currentMedia);
      } else {
        try {
          audioEngine.resumeContext();
          await audioEl.play();
          setIsPlaying(true);
        } catch (err: any) {
          if (err?.name === 'AbortError' || err?.message?.includes('interrupted')) {
            console.warn('Toggle play interrupted:', err.message);
          } else {
            console.error('Error toggling playback:', err);
          }
        }
      }
    }
  };

  // Skip Next Track
  const handleSkipNext = () => {
    if (tracks.length === 0) return;
    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * tracks.length);
      handlePlayMedia(tracks[randomIdx]);
    } else {
      const currIdx = tracks.findIndex((t) => t.id === currentMedia?.id);
      const nextIdx = (currIdx + 1) % tracks.length;
      handlePlayMedia(tracks[nextIdx]);
    }
  };

  // Skip Previous Track
  const handleSkipPrev = () => {
    if (tracks.length === 0) return;
    const currIdx = tracks.findIndex((t) => t.id === currentMedia?.id);
    const prevIdx = (currIdx - 1 + tracks.length) % tracks.length;
    handlePlayMedia(tracks[prevIdx]);
  };

  // Seek
  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Download Track / Video to IndexedDB for Offline Playback
  const handleDownloadTrack = async (track: MediaTrack) => {
    if (downloadedMediaIds.has(track.id)) return;

    setDownloadingIds((prev) => new Set(prev).add(track.id));

    try {
      // Generate or fetch audio blob
      let audioBlob: Blob;
      try {
        const res = await fetch(track.audioUrl);
        if (res.ok) {
          audioBlob = await res.blob();
        } else {
          audioBlob = AudioEngine.generateHighQualityAudioBlob(track.title, track.duration);
        }
      } catch {
        audioBlob = AudioEngine.generateHighQualityAudioBlob(track.title, track.duration);
      }

      const item: DownloadedItem = {
        id: `off-${Date.now()}-${track.id}`,
        mediaId: track.id,
        mediaType: 'audio',
        title: track.title,
        artist: track.artist,
        coverOrThumbnail: track.coverUrl,
        quality: defaultAudioQuality,
        format: defaultAudioQuality === 'FLAC' ? 'FLAC Lossless' : 'MP3',
        fileSizeMb: track.fileSizeMb,
        downloadedAt: Date.now(),
        blob: audioBlob,
        mimeType: 'audio/wav',
      };

      await saveDownloadedMedia(item);
      await refreshStorageStats();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  const handleDownloadVideo = async (video: VideoTrack) => {
    if (downloadedMediaIds.has(video.id)) return;

    setDownloadingIds((prev) => new Set(prev).add(video.id));

    try {
      // Synthesize audio/video blob placeholder for offline storage demonstration
      const dummyBlob = AudioEngine.generateHighQualityAudioBlob(video.title, 30);

      const item: DownloadedItem = {
        id: `off-vid-${Date.now()}-${video.id}`,
        mediaId: video.id,
        mediaType: 'video',
        title: video.title,
        artist: video.artist,
        coverOrThumbnail: video.thumbnailUrl,
        quality: defaultVideoQuality,
        format: 'MP4 1080p',
        fileSizeMb: video.fileSizeMb,
        downloadedAt: Date.now(),
        blob: dummyBlob,
        mimeType: 'video/mp4',
      };

      await saveDownloadedMedia(item);
      await refreshStorageStats();
    } catch (err) {
      console.error('Video download failed:', err);
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(video.id);
        return next;
      });
    }
  };

  // Export File directly to User's Disk
  const handleExportTrackFile = (track: MediaTrack) => {
    const blob = AudioEngine.generateHighQualityAudioBlob(track.title, track.duration);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.title.replace(/[^a-z0-9]/gi, '_')}_Aura_24bit_96kHz.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportDownloadedItem = (item: DownloadedItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}_Aura_Offline.${item.mediaType === 'video' ? 'mp4' : 'wav'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete Downloaded Offline Item
  const handleDeleteDownloadedItem = async (id: string) => {
    await deleteDownloadedMedia(id);
    await refreshStorageStats();
  };

  // Clear All Offline Media
  const handleClearAllDownloads = async () => {
    await clearAllOfflineMedia();
    await refreshStorageStats();
  };

  // Add AI Generated Tracks to Library
  const handleAddAiTracks = (newTracks: MediaTrack[]) => {
    setTracks((prev) => [...newTracks, ...prev]);
    setActiveTab('music');
  };

  // Create Custom Playlist
  const handleCreatePlaylist = (name: string, description: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description: description || 'Custom user created playlist.',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      trackIds: tracks.slice(0, 3).map((t) => t.id),
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [newPl, ...prev]);
  };

  // Filter Tracks & Videos based on Search Bar Query
  const searchedTracks = tracks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q);
  });

  const searchedVideos = videos.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return v.title.toLowerCase().includes(q) || v.artist.toLowerCase().includes(q) || v.genre.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          downloadedCount={downloadedItems.length}
          openEqualizer={() => setIsEqualizerOpen(true)}
          isCompactMode={isCompactMode}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSimulatedOffline={isSimulatedOffline}
            setIsSimulatedOffline={setIsSimulatedOffline}
            storageUsageMb={storageUsageMb}
            downloadedCount={downloadedItems.length}
            setActiveTab={setActiveTab}
            isCompactMode={isCompactMode}
            setIsCompactMode={setIsCompactMode}
          />

          <main className={`flex-1 ${isCompactMode ? 'p-2 md:p-4 pb-28' : 'p-4 md:p-8 pb-32'} max-w-7xl w-full mx-auto transition-all duration-300`}>
            {activeTab === 'discover' && (
              <HomeView
                tracks={searchedTracks}
                videos={searchedVideos}
                onPlayTrack={handlePlayMedia}
                onPlayVideo={handlePlayMedia}
                onDownloadTrack={handleDownloadTrack}
                onDownloadVideo={handleDownloadVideo}
                downloadedMediaIds={downloadedMediaIds}
                setActiveTab={setActiveTab}
                openAiCurator={() => setIsAiCuratorOpen(true)}
              />
            )}

            {activeTab === 'music' && (
              <MusicView
                tracks={searchedTracks}
                onPlayTrack={handlePlayMedia}
                onDownloadTrack={handleDownloadTrack}
                onExportFile={handleExportTrackFile}
                downloadedMediaIds={downloadedMediaIds}
              />
            )}

            {activeTab === 'videos' && (
              <VideoView
                videos={searchedVideos}
                onPlayVideo={handlePlayMedia}
                onDownloadVideo={handleDownloadVideo}
                downloadedMediaIds={downloadedMediaIds}
              />
            )}

            {activeTab === 'downloads' && (
              <DownloadsView
                downloadedItems={downloadedItems}
                onPlayDownloadedItem={(item) => {
                  const media = tracks.find((t) => t.id === item.mediaId) || {
                    id: item.mediaId,
                    type: 'audio',
                    title: item.title,
                    artist: item.artist,
                    album: 'Offline Downloads',
                    genre: 'Offline Media',
                    coverUrl: item.coverOrThumbnail,
                    audioUrl: '',
                    duration: 210,
                    releaseYear: 2026,
                    sampleRate: item.quality,
                    bitrate: item.format,
                    fileSizeMb: item.fileSizeMb,
                  };
                  handlePlayMedia(media as MediaTrack);
                }}
                onDeleteDownloadedItem={handleDeleteDownloadedItem}
                onExportDownloadedBlob={handleExportDownloadedItem}
                onClearAllDownloads={handleClearAllDownloads}
                storageUsageMb={storageUsageMb}
                storageQuotaMb={storageQuotaMb}
              />
            )}

            {activeTab === 'playlists' && (
              <PlaylistsView
                playlists={playlists}
                tracks={tracks}
                onPlayTrack={handlePlayMedia}
                onCreatePlaylist={handleCreatePlaylist}
                openAiCurator={() => setIsAiCuratorOpen(true)}
              />
            )}

            {activeTab === 'ai-curator' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-purple-900/60 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 p-8 text-center space-y-4">
                  <h2 className="text-3xl font-extrabold text-white">AI Music Curator & Soundscape Designer</h2>
                  <p className="text-sm text-purple-200 max-w-lg mx-auto">
                    Generate customized playlists using server-side Gemini 3.6 Flash. Preview synthesized track concepts, save them to your library, and download for offline playback.
                  </p>
                  <button
                    onClick={() => setIsAiCuratorOpen(true)}
                    className="inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:bg-purple-500 transition-all"
                  >
                    <span>Open AI Curator Tool</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <StorageSettingsView
                storageUsageMb={storageUsageMb}
                storageQuotaMb={storageQuotaMb}
                downloadedCount={downloadedItems.length}
                defaultAudioQuality={defaultAudioQuality}
                setDefaultAudioQuality={setDefaultAudioQuality}
                defaultVideoQuality={defaultVideoQuality}
                setDefaultVideoQuality={setDefaultVideoQuality}
                onClearAllDownloads={handleClearAllDownloads}
              />
            )}
          </main>
        </div>
      </div>

      {/* Persistent Bottom Player Bar */}
      <PlayerBar
        currentMedia={currentMedia}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSkipNext={handleSkipNext}
        onSkipPrev={handleSkipPrev}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={(v) => {
          setVolume(v);
          if (audioRef.current) audioRef.current.volume = v;
        }}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        isRepeat={isRepeat}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        audioQuality={audioQuality}
        setAudioQuality={setAudioQuality}
        isDownloaded={currentMedia ? downloadedMediaIds.has(currentMedia.id) : false}
        isDownloading={currentMedia ? downloadingIds.has(currentMedia.id) : false}
        onDownload={() => {
          if (!currentMedia) return;
          if (currentMedia.type === 'video') handleDownloadVideo(currentMedia as VideoTrack);
          else handleDownloadTrack(currentMedia as MediaTrack);
        }}
        openEqualizer={() => setIsEqualizerOpen(true)}
        openLyrics={() => setIsLyricsOpen(true)}
        openVideoPlayer={() => setIsVideoModalOpen(true)}
        openMiniPlayer={() => setIsMiniPlayerMode(true)}
        sleepTimerSeconds={sleepTimerSeconds}
        onSetSleepTimer={handleSetSleepTimer}
      />

      {/* Sleep Timer Toast Notification */}
      {sleepTimerNotification && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-2 rounded-2xl border border-purple-500/50 bg-slate-950/90 backdrop-blur-xl px-4 py-3 text-xs font-semibold text-purple-300 shadow-2xl shadow-purple-950/50 animate-in fade-in slide-in-from-top-4 duration-300">
          <Moon className="h-4 w-4 text-purple-400 animate-pulse" />
          <span>{sleepTimerNotification}</span>
        </div>
      )}

      {/* Always On Top Floating Mini Player */}
      {isMiniPlayerMode && (
        <MiniPlayer
          currentMedia={currentMedia}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSkipNext={handleSkipNext}
          onSkipPrev={handleSkipPrev}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onExpand={() => setIsMiniPlayerMode(false)}
        />
      )}

      {/* Modals */}
      <EqualizerModal isOpen={isEqualizerOpen} onClose={() => setIsEqualizerOpen(false)} />

      <LyricsPanel
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        track={currentMedia?.type === 'audio' ? (currentMedia as MediaTrack) : null}
        currentTime={currentTime}
      />

      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={currentMedia?.type === 'video' ? (currentMedia as VideoTrack) : null}
        isDownloaded={currentMedia ? downloadedMediaIds.has(currentMedia.id) : false}
        isDownloading={currentMedia ? downloadingIds.has(currentMedia.id) : false}
        onDownload={() => {
          if (currentMedia && currentMedia.type === 'video') {
            handleDownloadVideo(currentMedia as VideoTrack);
          }
        }}
      />

      <AICuratorModal
        isOpen={isAiCuratorOpen}
        onClose={() => setIsAiCuratorOpen(false)}
        onAddTracksToLibrary={handleAddAiTracks}
      />
    </div>
  );
}
