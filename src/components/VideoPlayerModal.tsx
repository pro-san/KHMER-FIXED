import React, { useState } from 'react';
import { X, Tv, Download, Check, Maximize, Film } from 'lucide-react';
import { VideoTrack, VideoQuality } from '../types';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoTrack | null;
  isDownloaded: boolean;
  isDownloading: boolean;
  onDownload: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  video,
  isDownloaded,
  isDownloading,
  onDownload,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(video?.resolution || '1080p');

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-3">
          <div className="flex items-center space-x-2.5">
            <Film className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{video.title}</h3>
              <p className="text-xs text-slate-400">{video.artist} • {video.views}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Resolution Switcher */}
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value as VideoQuality)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none"
            >
              <option value="4K">4K Ultra HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
            </select>

            {/* Offline Download Button */}
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1 text-xs font-medium border transition-all ${
                isDownloaded
                  ? 'border-emerald-500/40 bg-emerald-950 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isDownloaded ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />}
              <span>{isDownloaded ? 'Downloaded' : 'Download Video'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          <video
            src={video.videoUrl}
            controls
            autoPlay
            className="h-full w-full object-contain"
            poster={video.thumbnailUrl}
          />
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between bg-slate-950 px-5 py-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-slate-300">
              {video.genre}
            </span>
            <span>Approx Size: {video.fileSizeMb} MB</span>
          </div>
          <span className="text-emerald-400 font-medium">
            High Quality Video Streaming & Offline Storage
          </span>
        </div>
      </div>
    </div>
  );
};
