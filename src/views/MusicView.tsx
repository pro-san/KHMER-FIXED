import React, { useState } from 'react';
import { Play, Download, Check, Music, FileAudio, HardDriveUpload } from 'lucide-react';
import { MediaTrack } from '../types';

interface MusicViewProps {
  tracks: MediaTrack[];
  onPlayTrack: (track: MediaTrack) => void;
  onDownloadTrack: (track: MediaTrack) => void;
  onExportFile: (track: MediaTrack) => void;
  downloadedMediaIds: Set<string>;
}

export const MusicView: React.FC<MusicViewProps> = ({
  tracks,
  onPlayTrack,
  onDownloadTrack,
  onExportFile,
  downloadedMediaIds,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [onlyHiRes, setOnlyHiRes] = useState<boolean>(false);

  const genres = ['All', 'Synthwave / Ambient', 'Lo-Fi Jazz / Chill', 'Electronic / Cyberpunk', 'Classical / Orchestral', 'Tropical Chill / Pop', 'Ambient / Sound Therapy'];

  const filteredTracks = tracks.filter((track) => {
    if (selectedGenre !== 'All' && !track.genre.includes(selectedGenre)) return false;
    if (onlyHiRes && !track.isHiRes) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Music className="h-6 w-6 text-cyan-400" /> High-Fidelity Music Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            24-bit Lossless FLAC Master Recordings & High Quality Downloads
          </p>
        </div>

        {/* Filter Toggle */}
        <label className="flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
          <input
            type="checkbox"
            checked={onlyHiRes}
            onChange={(e) => setOnlyHiRes(e.target.checked)}
            className="rounded accent-cyan-400"
          />
          <span>Only Hi-Res FLAC (24-bit / 96kHz+)</span>
        </label>
      </div>

      {/* Genre Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap border transition-all ${
              selectedGenre === g
                ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Tracks Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Album</th>
                <th className="py-3.5 px-4">Sample Rate / Bitrate</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTracks.map((track, idx) => {
                const isDownloaded = downloadedMediaIds.has(track.id);
                return (
                  <tr key={track.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-800">
                          <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                          <button
                            onClick={() => onPlayTrack(track)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Play className="h-5 w-5 text-white fill-current" />
                          </button>
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {track.title}
                          </div>
                          <div className="text-[11px] text-slate-400">{track.artist}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400">{track.album}</td>

                    <td className="py-3 px-4 font-mono">
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-cyan-300 border border-slate-800">
                        {track.sampleRate}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">{track.fileSizeMb} MB</td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Play */}
                        <button
                          onClick={() => onPlayTrack(track)}
                          className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700"
                          title="Stream Track"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span className="hidden sm:inline">Play</span>
                        </button>

                        {/* Download for Offline (IndexedDB) */}
                        <button
                          onClick={() => onDownloadTrack(track)}
                          className={`flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
                            isDownloaded
                              ? 'border-emerald-500/40 bg-emerald-950 text-emerald-300'
                              : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                          }`}
                          title={isDownloaded ? 'Downloaded to Offline Store' : 'Download FLAC to Offline Store'}
                        >
                          {isDownloaded ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">{isDownloaded ? 'Offline' : 'Save Offline'}</span>
                        </button>

                        {/* Export File to Device Disk */}
                        <button
                          onClick={() => onExportFile(track)}
                          className="flex items-center space-x-1 rounded-lg border border-indigo-800/80 bg-indigo-950/60 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900 transition-all"
                          title="Download actual audio file (.flac / .wav / .mp3) directly to device"
                        >
                          <HardDriveUpload className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="hidden lg:inline">Export File</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
