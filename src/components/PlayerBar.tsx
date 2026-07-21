import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Sliders,
  FileText,
  Download,
  Check,
  Maximize2,
  Minimize2,
  Tv,
  Moon,
  Timer,
  X,
  Activity,
} from 'lucide-react';
import { MediaTrack, VideoTrack, AudioQuality } from '../types';
import { WaveformVisualizer } from './WaveformVisualizer';

interface PlayerBarProps {
  currentMedia: MediaTrack | VideoTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  audioQuality: AudioQuality;
  setAudioQuality: (q: AudioQuality) => void;
  isDownloaded: boolean;
  isDownloading: boolean;
  onDownload: () => void;
  openEqualizer: () => void;
  openLyrics: () => void;
  openVideoPlayer?: () => void;
  openMiniPlayer?: () => void;
  sleepTimerSeconds?: number | null;
  onSetSleepTimer?: (minutes: number | null) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentMedia,
  isPlaying,
  onTogglePlay,
  onSkipNext,
  onSkipPrev,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isRepeat,
  onToggleRepeat,
  isShuffle,
  onToggleShuffle,
  audioQuality,
  setAudioQuality,
  isDownloaded,
  isDownloading,
  onDownload,
  openEqualizer,
  openLyrics,
  openVideoPlayer,
  openMiniPlayer,
  sleepTimerSeconds,
  onSetSleepTimer,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isSleepMenuOpen, setIsSleepMenuOpen] = React.useState(false);
  const [customMinutesInput, setCustomMinutesInput] = React.useState('');
  const [isSpectrumExpanded, setIsSpectrumExpanded] = React.useState(false);

  if (!currentMedia) return null;

  const isVideo = currentMedia.type === 'video';
  const track = isVideo ? null : (currentMedia as MediaTrack);
  const video = isVideo ? (currentMedia as VideoTrack) : null;

  const coverImage = isVideo ? video?.thumbnailUrl : track?.coverUrl;
  const title = isVideo ? video?.title : track?.title;
  const artist = isVideo ? video?.artist : track?.artist;
  const qualityTag = isVideo
    ? video?.resolution
    : track?.isHiRes
    ? `${track.sampleRate}`
    : `${audioQuality}`;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatSleepTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}m`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct * duration);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 px-4 py-3 backdrop-blur-xl shadow-2xl">
      {/* Expanded Web Audio Multi-Band Frequency Spectrum Banner */}
      {isSpectrumExpanded && !isVideo && (
        <div className="mb-3 rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-3 backdrop-blur-xl shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Web Audio API AnalyserNode — 32-Band Logarithmic Frequency Spectrum Analyzer</span>
            </div>
            <button
              onClick={() => setIsSpectrumExpanded(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Close Spectrum Visualizer Drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <WaveformVisualizer
            isPlaying={isPlaying}
            width={700}
            height={60}
            showBandLabels={true}
            className="w-full h-16 bg-slate-950/90 border border-slate-800/80 rounded-xl"
          />
        </div>
      )}

      {/* Top Seek Progress Bar */}
      <div
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        className="group relative -top-3 left-0 h-2 w-full cursor-pointer bg-slate-800/80 hover:h-2.5 transition-all rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center space-x-3.5 w-full md:w-1/4 min-w-0">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-800 shadow-md">
            <img
              src={coverImage}
              alt={title}
              className={`h-full w-full object-cover transition-transform duration-700 ${
                isPlaying && !isVideo ? 'scale-105 animate-pulse' : ''
              }`}
            />
            {isVideo && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Tv className="h-4 w-4 text-cyan-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-white tracking-tight">{title}</h4>
            <p className="truncate text-xs text-slate-400">{artist}</p>
            <div className="mt-0.5 flex items-center space-x-2">
              <span className="rounded bg-cyan-950/90 px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-300 border border-cyan-800/50">
                {qualityTag}
              </span>
              {isDownloaded && (
                <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                  <Check className="h-3 w-3" /> Offline
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Realtime Web Audio API Waveform Visualizer */}
          {!isVideo && (
            <div className="hidden lg:block flex-shrink-0">
              <WaveformVisualizer isPlaying={isPlaying} width={90} height={32} />
            </div>
          )}
        </div>

        {/* Player Controls & Time Slider */}
        <div className="flex flex-col items-center space-y-1 w-full md:w-2/4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleShuffle}
              className={`text-slate-400 hover:text-white transition-colors ${
                isShuffle ? 'text-cyan-400 font-bold' : ''
              }`}
              title="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={onSkipPrev}
              className="text-slate-300 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={onSkipNext}
              className="text-slate-300 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`text-slate-400 hover:text-white transition-colors ${
                isRepeat ? 'text-cyan-400 font-bold' : ''
              }`}
              title="Repeat"
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          {/* Time indicator */}
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 w-full max-w-md justify-center">
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Tools & Equalizer / Lyrics / Download */}
        <div className="flex items-center justify-end space-x-2.5 w-full md:w-1/4">
          {/* Quality Switcher */}
          {!isVideo && (
            <select
              value={audioQuality}
              onChange={(e) => setAudioQuality(e.target.value as AudioQuality)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              title="Audio Streaming Quality"
            >
              <option value="FLAC">FLAC 24-bit</option>
              <option value="320k">320kbps HQ</option>
              <option value="256k">256kbps</option>
              <option value="128k">128kbps</option>
            </select>
          )}

          {/* Download FLAC / Video */}
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
              isDownloaded
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : isDownloading
                ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300 animate-pulse'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={isDownloaded ? 'Downloaded for Offline' : 'Download High Quality for Offline Playback'}
          >
            {isDownloaded ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Download className={`h-3.5 w-3.5 ${isDownloading ? 'animate-bounce text-cyan-400' : ''}`} />
            )}
            <span className="hidden lg:inline">{isDownloaded ? 'Offline' : isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>

          {/* Expanded Multi-Band Frequency Spectrum Visualizer Toggle */}
          {!isVideo && (
            <button
              onClick={() => setIsSpectrumExpanded(!isSpectrumExpanded)}
              className={`rounded-lg border p-2 transition-all ${
                isSpectrumExpanded
                  ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300 shadow-md shadow-cyan-950/50'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-cyan-400'
              }`}
              title="Toggle Web Audio Multi-Band Frequency Spectrum Visualizer Banner"
            >
              <Activity className="h-4 w-4" />
            </button>
          )}

          {/* Equalizer Modal Toggle */}
          {!isVideo && (
            <button
              onClick={openEqualizer}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
              title="Web Audio 5-Band Equalizer & Visualizer"
            >
              <Sliders className="h-4 w-4" />
            </button>
          )}

          {/* Synced Lyrics Toggle */}
          {!isVideo && (
            <button
              onClick={openLyrics}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
              title="Synced Karaoke Lyrics & AI Backstory"
            >
              <FileText className="h-4 w-4" />
            </button>
          )}

          {/* Sleep Timer Toggle & Popover */}
          {onSetSleepTimer && (
            <div className="relative">
              <button
                onClick={() => setIsSleepMenuOpen(!isSleepMenuOpen)}
                className={`flex items-center space-x-1 rounded-lg border p-2 text-xs transition-all ${
                  sleepTimerSeconds !== null && sleepTimerSeconds !== undefined
                    ? 'border-purple-500/50 bg-purple-950/60 text-purple-300 font-mono font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-purple-400'
                }`}
                title="Sleep Timer - Auto Pause Playback"
              >
                <Moon className={`h-4 w-4 ${sleepTimerSeconds ? 'text-purple-400 animate-pulse' : ''}`} />
                {sleepTimerSeconds !== null && sleepTimerSeconds !== undefined && (
                  <span className="text-[11px] font-mono ml-0.5">{formatSleepTime(sleepTimerSeconds)}</span>
                )}
              </button>

              {/* Popover Menu */}
              {isSleepMenuOpen && (
                <div className="absolute bottom-12 right-0 z-50 w-60 rounded-2xl border border-purple-900/60 bg-slate-950/95 backdrop-blur-xl p-3.5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                      <Timer className="h-4 w-4 text-purple-400" />
                      <span>Sleep Timer</span>
                    </div>
                    <button
                      onClick={() => setIsSleepMenuOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          onSetSleepTimer(mins);
                          setIsSleepMenuOpen(false);
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-purple-500 hover:bg-purple-950/50 hover:text-purple-300 transition-all text-center"
                      >
                        {mins} Minutes
                      </button>
                    ))}
                  </div>

                  {/* Custom Minutes Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const num = parseInt(customMinutesInput, 10);
                      if (!isNaN(num) && num > 0) {
                        onSetSleepTimer(num);
                        setCustomMinutesInput('');
                        setIsSleepMenuOpen(false);
                      }
                    }}
                    className="flex space-x-1.5 pt-1"
                  >
                    <input
                      type="number"
                      min={1}
                      max={720}
                      placeholder="Custom mins..."
                      value={customMinutesInput}
                      onChange={(e) => setCustomMinutesInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
                    >
                      Set
                    </button>
                  </form>

                  {/* Turn Off Option if Active */}
                  {sleepTimerSeconds !== null && sleepTimerSeconds !== undefined && (
                    <button
                      onClick={() => {
                        onSetSleepTimer(null);
                        setIsSleepMenuOpen(false);
                      }}
                      className="w-full rounded-lg border border-rose-900/60 bg-rose-950/40 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900 transition-colors text-center"
                    >
                      Turn Off Sleep Timer
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Always on Top Mini Player Toggle */}
          {openMiniPlayer && (
            <button
              onClick={openMiniPlayer}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
              title="Minimize to Always-on-Top Floating Mini-Player"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}

          {/* Video Player Launcher */}
          {isVideo && openVideoPlayer && (
            <button
              onClick={openVideoPlayer}
              className="rounded-lg border border-cyan-800/80 bg-cyan-950/50 p-2 text-cyan-300 hover:bg-cyan-900 transition-colors"
              title="Open Video Player"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}

          {/* Volume Control */}
          <div className="hidden sm:flex items-center space-x-1.5 ml-1">
            <button onClick={onToggleMute} className="text-slate-400 hover:text-slate-200">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
