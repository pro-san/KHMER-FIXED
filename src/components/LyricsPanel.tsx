import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Music2, Loader2, Clock, RotateCcw, Mic2, Eye, EyeOff } from 'lucide-react';
import { MediaTrack } from '../types';

interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  track: MediaTrack | null;
  currentTime: number;
}

export const LyricsPanel: React.FC<LyricsPanelProps> = ({
  isOpen,
  onClose,
  track,
  currentTime,
}) => {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'story'>('lyrics');
  const [storyText, setStoryText] = useState<string>('');
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(0);
  const [isKaraokeMode, setIsKaraokeMode] = useState<boolean>(true);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [revealedLines, setRevealedLines] = useState<Record<number, boolean>>({});

  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !track) return;
    setStoryText('');
    setSyncOffsetMs(0);
    setRevealedLines({});
  }, [track?.id, isOpen]);

  // Adjusted time considering manual sync offset (+/- 500ms)
  const adjustedTime = currentTime + syncOffsetMs / 1000;

  // Find active lyric index based on adjustedTime
  const activeLyricIndex = track?.lyrics
    ? track.lyrics.findIndex((line, i) => {
        const nextTime = track.lyrics![i + 1]?.time ?? Infinity;
        return adjustedTime >= line.time && adjustedTime < nextTime;
      })
    : -1;

  // Auto-scroll active line to center
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex]);

  const toggleLineReveal = (idx: number) => {
    setRevealedLines((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const fetchAiStory = async () => {
    if (!track) return;
    setIsLoadingStory(true);
    try {
      const res = await fetch('/api/gemini/lyrics-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          artist: track.artist,
          genre: track.genre,
        }),
      });
      const data = await res.json();
      setStoryText(data.story || 'No backstory generated.');
    } catch (err) {
      setStoryText('Failed to fetch AI backstory. Check network connection.');
    } finally {
      setIsLoadingStory(false);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="h-12 w-12 rounded-lg object-cover border border-slate-800"
            />
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{track.title}</h3>
              <p className="text-xs text-slate-400">{track.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-slate-800/80 pb-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'lyrics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music2 className="h-4 w-4" />
            <span>Synced Karaoke Lyrics</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('story');
              if (!storyText && !isLoadingStory) fetchAiStory();
            }}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'story'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>AI Story & Analysis</span>
          </button>
        </div>

        {/* Lyrics Content */}
        {activeTab === 'lyrics' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Mode Controls & Offset Adjustment */}
            {track.lyrics && track.lyrics.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/90 bg-slate-900/80 p-2.5 text-xs flex-shrink-0">
                {/* Karaoke & Practice Mode Toggles */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsKaraokeMode(!isKaraokeMode)}
                    className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                      isKaraokeMode
                        ? 'border-pink-500/60 bg-pink-950/60 text-pink-300 shadow-sm shadow-pink-950'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle Karaoke Mode (highlights active sung line with progress fill)"
                  >
                    <Mic2 className={`h-3.5 w-3.5 ${isKaraokeMode ? 'text-pink-400 animate-pulse' : 'text-slate-400'}`} />
                    <span>Karaoke: {isKaraokeMode ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => setIsPracticeMode(!isPracticeMode)}
                    className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                      isPracticeMode
                        ? 'border-amber-500/60 bg-amber-950/60 text-amber-300 shadow-sm shadow-amber-950'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle Practice Mode (hides lyrics for memory practice, hover/click to reveal)"
                  >
                    {isPracticeMode ? (
                      <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span>Practice Mode: {isPracticeMode ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Manual Sync Offset Controls */}
                <div className="flex items-center space-x-2 text-slate-300">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-mono text-[11px]">
                      {syncOffsetMs > 0 ? `+${syncOffsetMs}ms` : `${syncOffsetMs}ms`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSyncOffsetMs((prev) => prev - 500)}
                      className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-700 transition-all font-mono"
                      title="-500ms delay"
                    >
                      -500ms
                    </button>
                    <button
                      onClick={() => setSyncOffsetMs((prev) => prev + 500)}
                      className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-700 transition-all font-mono"
                      title="+500ms advance"
                    >
                      +500ms
                    </button>
                    {syncOffsetMs !== 0 && (
                      <button
                        onClick={() => setSyncOffsetMs(0)}
                        className="rounded border border-slate-700 bg-slate-800 p-1 text-slate-400 hover:text-white"
                        title="Reset offset"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lyrics Stream Window */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto space-y-4 py-4 pr-2 text-center custom-scrollbar"
            >
              {track.lyrics && track.lyrics.length > 0 ? (
                track.lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const lineTime = line.time;
                  const nextLineTime = track.lyrics![idx + 1]?.time ?? (lineTime + 4);
                  const lineDuration = Math.max(1, nextLineTime - lineTime);
                  const progressRatio = Math.min(
                    1,
                    Math.max(0, (adjustedTime - lineTime) / lineDuration)
                  );
                  const progressPercent = Math.round(progressRatio * 100);

                  const isRevealed = revealedLines[idx];
                  const shouldHide = isPracticeMode && !isRevealed && !isActive;

                  return (
                    <div
                      key={idx}
                      onClick={() => isPracticeMode && toggleLineReveal(idx)}
                      className={`group relative flex flex-col items-center justify-center transition-all duration-300 rounded-xl p-2 ${
                        isPracticeMode ? 'cursor-pointer hover:bg-slate-900/40' : ''
                      }`}
                    >
                      {/* Sung Line Text */}
                      <p
                        className={`text-base font-medium transition-all duration-300 ${
                          shouldHide
                            ? 'blur-sm select-none opacity-30 text-slate-600'
                            : isActive
                            ? isKaraokeMode
                              ? 'text-pink-300 scale-105 font-bold drop-shadow-[0_0_16px_rgba(236,72,153,0.7)]'
                              : 'text-cyan-300 scale-105 font-bold drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                            : 'text-slate-500 opacity-60 hover:opacity-90'
                        }`}
                      >
                        {shouldHide ? '•••• ••••••••• ••••' : line.text}
                      </p>

                      {/* Karaoke Active Line Fill Progress Indicator */}
                      {isActive && isKaraokeMode && !shouldHide && (
                        <div className="w-48 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700/60 shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 transition-all duration-100 ease-linear rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      )}

                      {/* Practice Mode Hint Badge */}
                      {isPracticeMode && shouldHide && (
                        <span className="text-[10px] text-amber-500/80 font-mono opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          (Click to reveal lyric)
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 italic py-12">
                  No lyrics available for this track. Enjoy the instrumental soundscape!
                </p>
              )}
            </div>
          </div>
        )}

        {/* AI Story Content */}
        {activeTab === 'story' && (
          <div className="flex-1 overflow-y-auto pr-2 text-sm text-slate-300 space-y-3 leading-relaxed custom-scrollbar">
            {isLoadingStory ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                <p className="text-xs text-purple-300 font-medium">Generating AI musical analysis & story...</p>
              </div>
            ) : (
              <div className="whitespace-pre-line rounded-xl bg-slate-900/60 p-4 border border-slate-800 text-slate-200">
                {storyText}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

