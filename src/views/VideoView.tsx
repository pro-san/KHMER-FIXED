import React from 'react';
import { Play, Download, Check, Tv, Film } from 'lucide-react';
import { VideoTrack } from '../types';

interface VideoViewProps {
  videos: VideoTrack[];
  onPlayVideo: (video: VideoTrack) => void;
  onDownloadVideo: (video: VideoTrack) => void;
  downloadedMediaIds: Set<string>;
}

export const VideoView: React.FC<VideoViewProps> = ({
  videos,
  onPlayVideo,
  onDownloadVideo,
  downloadedMediaIds,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Film className="h-6 w-6 text-purple-400" /> Ultra HD Videos & Concerts
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          4K Music Videos, Live Concert Sessions & High Quality Offline Video Downloads
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const isDownloaded = downloadedMediaIds.has(video.id);
          return (
            <div
              key={video.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => onPlayVideo(video)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-2xl group-hover:scale-110 transition-transform"
                  >
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </button>
                </div>

                <span className="absolute top-3 left-3 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-slate-700">
                  {video.resolution}
                </span>

                {video.isLiveConcert && (
                  <span className="absolute top-3 right-3 rounded-md bg-rose-950/90 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800">
                    LIVE CONCERT
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{video.artist} • {video.views}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  <span className="font-mono text-slate-400">{video.fileSizeMb} MB</span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onPlayVideo(video)}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:text-white hover:bg-slate-800"
                    >
                      Stream Video
                    </button>

                    <button
                      onClick={() => onDownloadVideo(video)}
                      className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                        isDownloaded
                          ? 'border-emerald-500/50 bg-emerald-950 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isDownloaded ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />}
                      <span>{isDownloaded ? 'Offline' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
