import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Music2, Loader2, Clock, RotateCcw } from 'lucide-react';
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
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !track) return;
    setStoryText('');
    setSyncOffsetMs(0);
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
            {/* Manual Sync Offset Adjustment */}
            {track.lyrics && track.lyrics.length > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-slate-800/90 bg-slate-900/80 px-3.5 py-2 text-xs flex-shrink-0">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span className="font-medium">Sync Offset:</span>
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded ${
                      syncOffsetMs > 0
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                        : syncOffsetMs < 0
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {syncOffsetMs > 0 ? `+${syncOffsetMs} ms` : `${syncOffsetMs} ms`}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setSyncOffsetMs((prev) => prev - 500)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95 font-mono"
                    title="Delay lyrics timing by 500ms"
                  >
                    -500ms
                  </button>
                  <button
                    onClick={() => setSyncOffsetMs((prev) => prev + 500)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95 font-mono"
                    title="Advance lyrics timing by 500ms"
                  >
                    +500ms
                  </button>
                  {syncOffsetMs !== 0 && (
                    <button
                      onClick={() => setSyncOffsetMs(0)}
                      className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                      title="Reset offset to 0ms"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-medium">Reset</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto space-y-4 py-4 pr-2 text-center custom-scrollbar"
            >
              {track.lyrics && track.lyrics.length > 0 ? (
                track.lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <p
                      key={idx}
                      className={`text-base font-medium transition-all duration-300 ${
                        isActive
                          ? 'text-cyan-300 scale-105 font-bold drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                          : 'text-slate-500 opacity-60 hover:opacity-90'
                      }`}
                    >
                      {line.text}
                    </p>
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
