import React, { useState } from 'react';
import { X, Sparkles, Music, Loader2, Play, Plus, Download } from 'lucide-react';
import { MediaTrack } from '../types';

interface AICuratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTracksToLibrary: (tracks: MediaTrack[]) => void;
}

export const AICuratorModal: React.FC<AICuratorModalProps> = ({
  isOpen,
  onClose,
  onAddTracksToLibrary,
}) => {
  const [prompt, setPrompt] = useState<string>('Late night rainy lo-fi beats with jazz piano & sub-bass');
  const [genre, setGenre] = useState<string>('Lo-Fi / Ambient');
  const [mood, setMood] = useState<string>('Melancholic & Focused');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedTracks, setGeneratedTracks] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedTracks([]);

    try {
      const res = await fetch('/api/gemini/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, genre, mood }),
      });
      const data = await res.json();
      setGeneratedTracks(data.tracks || []);
    } catch (err) {
      console.error('Error in AI Curator:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedTracks.length) return;

    const newTracks: MediaTrack[] = generatedTracks.map((gt, i) => ({
      id: `ai-tr-${Date.now()}-${i}`,
      type: 'audio',
      title: gt.title || 'AI Soundscape',
      artist: gt.artist || 'Aura AI Synthesis',
      album: 'AI Curated Mix 2026',
      genre: gt.genre || genre,
      coverUrl: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop`,
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=midnight-forest-18430.mp3',
      duration: 210,
      releaseYear: 2026,
      sampleRate: '96 kHz / 24-bit AI FLAC',
      bitrate: '1411 kbps',
      fileSizeMb: 32.5,
      isHiRes: true,
      colorHex: gt.suggestedColor || '#8b5cf6',
      lyrics: [
        { time: 0, text: `♪ (${gt.tempo || '115 BPM'} - ${gt.description}) ♪` },
        { time: 15, text: `Synthesized harmonic progression in ${gt.keySignature || 'A Minor'}` },
        { time: 45, text: 'Aura AI high fidelity audio stream active' },
      ],
    }));

    onAddTracksToLibrary(newTracks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-purple-900/60 bg-slate-950 p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 text-white shadow-lg shadow-purple-900/30">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Playlist Curator</h3>
              <p className="text-xs text-purple-300">Powered by Gemini 3.6 Server-Side Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-4 flex-shrink-0">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Describe your desired vibe or soundscape
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Cyberpunk synthwave for high focus coding session..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Lo-Fi / Ambient">Lo-Fi / Ambient</option>
                <option value="Synthwave / Cyberpunk">Synthwave / Cyberpunk</option>
                <option value="Jazz & Coffee Keys">Jazz & Coffee Keys</option>
                <option value="Deep Electronic House">Deep Electronic House</option>
                <option value="Classical Orchestral">Classical Orchestral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Mood & Energy
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Relaxed & Focused">Relaxed & Focused</option>
                <option value="Energetic & Uplifting">Energetic & Uplifting</option>
                <option value="Melancholic & Reflective">Melancholic & Reflective</option>
                <option value="Dark & Atmospheric">Dark & Atmospheric</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-purple-200" />
                <span>Generating AI Curated Tracklist...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-purple-200" />
                <span>Generate Custom Playlist</span>
              </>
            )}
          </button>
        </form>

        {/* Results List */}
        {generatedTracks.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-3 pt-2 pr-1 custom-scrollbar">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                Generated Tracks ({generatedTracks.length})
              </h4>
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Add All to Music Library</span>
              </button>
            </div>

            <div className="space-y-2">
              {generatedTracks.map((track, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-950 text-purple-300 font-bold text-xs border border-purple-800/50">
                      #{idx + 1}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white leading-tight">{track.title}</h5>
                      <p className="text-xs text-slate-400">{track.artist} • {track.genre}</p>
                      <p className="text-[11px] text-purple-300/80 mt-0.5">{track.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-400">
                    <div>{track.tempo}</div>
                    <div className="text-[10px] text-cyan-400">{track.keySignature}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
