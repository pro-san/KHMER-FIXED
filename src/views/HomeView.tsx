import React from 'react';
import { Play, Download, Sparkles, Check, Flame, Tv, Music, ShieldCheck } from 'lucide-react';
import { MediaTrack, VideoTrack, ActiveTab } from '../types';

interface HomeViewProps {
  tracks: MediaTrack[];
  videos: VideoTrack[];
  onPlayTrack: (track: MediaTrack) => void;
  onPlayVideo: (video: VideoTrack) => void;
  onDownloadTrack: (track: MediaTrack) => void;
  onDownloadVideo: (video: VideoTrack) => void;
  downloadedMediaIds: Set<string>;
  setActiveTab: (tab: ActiveTab) => void;
  openAiCurator: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  videos,
  onPlayTrack,
  onPlayVideo,
  onDownloadTrack,
  onDownloadVideo,
  downloadedMediaIds,
  setActiveTab,
  openAiCurator,
}) => {
  const heroTrack = tracks[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      {heroTrack && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/80 p-6 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-semibold text-cyan-300">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Featured FLAC 24-bit Lossless Release</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {heroTrack.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Experience pristine studio acoustics by <span className="font-semibold text-white">{heroTrack.artist}</span>. Mastered at {heroTrack.sampleRate} with lossless {heroTrack.bitrate}.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onPlayTrack(heroTrack)}
                  className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Stream Hi-Res Now</span>
                </button>

                <button
                  onClick={() => onDownloadTrack(heroTrack)}
                  className={`flex items-center space-x-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all ${
                    downloadedMediaIds.has(heroTrack.id)
                      ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300'
                      : 'border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800'
                  }`}
                >
                  {downloadedMediaIds.has(heroTrack.id) ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Available Offline</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download FLAC ({heroTrack.fileSizeMb} MB)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Album Art Preview */}
            <div className="relative group h-56 w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl">
              <img
                src={heroTrack.coverUrl}
                alt={heroTrack.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="font-mono text-[10px] bg-black/60 px-2 py-0.5 rounded border border-slate-700">
                  {heroTrack.sampleRate}
                </span>
                <span className="font-semibold text-cyan-300">{heroTrack.genre}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hi-Res FLAC Spotlights Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">High Fidelity Audio Tracks</h3>
          </div>
          <button
            onClick={() => setActiveTab('music')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View All Music →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.slice(0, 6).map((track) => {
            const isDownloaded = downloadedMediaIds.has(track.id);
            return (
              <div
                key={track.id}
                className="group relative flex items-center space-x-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-md"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => onPlayTrack(track)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Play className="h-6 w-6 text-white fill-current" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="truncate text-xs text-slate-400 mt-0.5">{track.artist}</p>
                  <div className="mt-1.5 flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <span className="rounded bg-slate-950 px-1.5 py-0.5 border border-slate-800 text-cyan-400">
                      {track.sampleRate}
                    </span>
                    <span>{track.bitrate}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDownloadTrack(track)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                    isDownloaded
                      ? 'border-emerald-500/50 bg-emerald-950 text-emerald-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                  title={isDownloaded ? 'Downloaded for offline playback' : 'Download FLAC track'}
                >
                  {isDownloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending 4K Music Videos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tv className="h-5 w-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">4K Videos & Live Concerts</h3>
          </div>
          <button
            onClick={() => setActiveTab('videos')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            Explore All Videos →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {videos.slice(0, 2).map((video) => {
            const isDownloaded = downloadedMediaIds.has(video.id);
            return (
              <div
                key={video.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => onPlayVideo(video)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-slate-950 shadow-xl group-hover:scale-110 transition-transform"
                    >
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </button>
                  </div>

                  <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-slate-700">
                    {video.resolution}
                  </span>

                  <button
                    onClick={() => onDownloadVideo(video)}
                    className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-md transition-all ${
                      isDownloaded
                        ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300'
                        : 'border-slate-700 bg-black/60 text-white hover:bg-black/90'
                    }`}
                    title="Download Video for Offline"
                  >
                    {isDownloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  </button>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{video.artist} • {video.views}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Curator Callout Banner */}
      <div className="rounded-2xl border border-purple-900/50 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Looking for custom tailored music?</h4>
            <p className="text-xs text-purple-200">
              Use Gemini 3.6 to generate custom playlist concepts based on mood, tempo, and atmosphere.
            </p>
          </div>
        </div>
        <button
          onClick={openAiCurator}
          className="flex items-center space-x-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-purple-500 transition-all flex-shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>Launch AI Curator</span>
        </button>
      </div>
    </div>
  );
};
