import React, { useState } from 'react';
import { ListMusic, Plus, Play, Sparkles, Music } from 'lucide-react';
import { Playlist, MediaTrack } from '../types';

interface PlaylistsViewProps {
  playlists: Playlist[];
  tracks: MediaTrack[];
  onPlayTrack: (track: MediaTrack) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  openAiCurator: () => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  tracks,
  onPlayTrack,
  onCreatePlaylist,
  openAiCurator,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];
  const playlistTracks = tracks.filter((t) => activePlaylist?.trackIds.includes(t.id));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreatePlaylist(newTitle, newDesc);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ListMusic className="h-6 w-6 text-indigo-400" /> Curated Playlists
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Custom Playlists & AI Curated Soundscape Collections
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={openAiCurator}
            className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-500 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Curator</span>
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* New Playlist Form Modal */}
      {isCreating && (
        <form onSubmit={handleFormSubmit} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-xl">
          <h4 className="text-sm font-bold text-white">Create New Playlist</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Playlist Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Playlists Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {playlists.map((pl) => {
          const isSelected = activePlaylist?.id === pl.id;
          return (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className={`flex items-center space-x-3 rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg'
                  : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <img src={pl.coverUrl} alt={pl.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate text-white">{pl.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{pl.trackIds.length} tracks</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Playlist Tracklist */}
      {activePlaylist && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
            <img src={activePlaylist.coverUrl} alt={activePlaylist.name} className="h-20 w-20 rounded-xl object-cover border border-slate-800" />
            <div>
              <h3 className="text-xl font-bold text-white">{activePlaylist.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{activePlaylist.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            {playlistTracks.map((track, i) => (
              <div
                key={track.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs text-slate-500 w-5 text-center">{i + 1}</span>
                  <img src={track.coverUrl} alt={track.title} className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <h5 className="text-sm font-semibold text-white leading-tight">{track.title}</h5>
                    <p className="text-xs text-slate-400">{track.artist} • {track.genre}</p>
                  </div>
                </div>

                <button
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:text-white"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
