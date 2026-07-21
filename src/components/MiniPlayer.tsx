import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, Music, Tv } from 'lucide-react';
import { MediaTrack, VideoTrack } from '../types';
import { WaveformVisualizer } from './WaveformVisualizer';

interface MiniPlayerProps {
  currentMedia: MediaTrack | VideoTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentMedia,
  isPlaying,
  onTogglePlay,
  onSkipNext,
  onSkipPrev,
  currentTime,
  duration,
  onSeek,
  onExpand,
}) => {
  if (!currentMedia) return null;

  const isVideo = currentMedia.type === 'video';
  const coverUrl = isVideo ? (currentMedia as VideoTrack).thumbnailUrl : (currentMedia as MediaTrack).coverUrl;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl p-4 shadow-2xl shadow-cyan-950/50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400 border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-1.5 font-semibold text-cyan-400">
          {isVideo ? <Tv className="h-3.5 w-3.5" /> : <Music className="h-3.5 w-3.5" />}
          <span>Always-On-Top Mini Player</span>
        </div>

        <button
          onClick={onExpand}
          className="flex items-center space-x-1 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Expand to Full Player"
        >
          <Maximize2 className="h-3 w-3" />
          <span>Full App</span>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {/* Artwork */}
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 shadow-md">
          <img src={coverUrl} alt={currentMedia.title} className="h-full w-full object-cover" />
          {isPlaying && (
            <div className="absolute inset-0 bg-cyan-950/30 flex items-center justify-center">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-bold text-white">{currentMedia.title}</h4>
          <p className="truncate text-[11px] text-slate-400">{currentMedia.artist}</p>
          <p className="font-mono text-[10px] text-cyan-400 mt-0.5">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
      </div>

      {/* Real-time Web Audio Waveform Visualizer */}
      {!isVideo && (
        <div className="my-3">
          <WaveformVisualizer isPlaying={isPlaying} width={288} height={28} className="w-full" />
        </div>
      )}

      {/* Progress Slider */}
      <div className="space-y-1 my-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 pt-1">
        <button
          onClick={onSkipPrev}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          title="Previous Track"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={onSkipNext}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          title="Next Track"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
