import React, { useState } from 'react';
import { Download, Play, Trash2, HardDriveUpload, Check, WifiOff, Music, Film, HardDrive, AlertCircle } from 'lucide-react';
import { DownloadedItem } from '../types';

interface DownloadsViewProps {
  downloadedItems: DownloadedItem[];
  onPlayDownloadedItem: (item: DownloadedItem) => void;
  onDeleteDownloadedItem: (id: string) => void;
  onExportDownloadedBlob: (item: DownloadedItem) => void;
  onClearAllDownloads: () => void;
  storageUsageMb: number;
  storageQuotaMb: number;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloadedItems,
  onPlayDownloadedItem,
  onDeleteDownloadedItem,
  onExportDownloadedBlob,
  onClearAllDownloads,
  storageUsageMb,
  storageQuotaMb,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video'>('all');

  const filteredItems = downloadedItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.mediaType === filterType;
  });

  const usagePct = storageQuotaMb > 0 ? (storageUsageMb / storageQuotaMb) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Download className="h-6 w-6 text-emerald-400" /> Offline Media Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Stored in browser IndexedDB. Playable completely offline with zero data usage.
          </p>
        </div>

        {downloadedItems.length > 0 && (
          <button
            onClick={onClearAllDownloads}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Offline Storage</span>
          </button>
        )}
      </div>

      {/* Storage Meter Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-cyan-950 p-2.5 text-cyan-400 border border-cyan-800/50">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">IndexedDB Storage Capacity</h3>
              <p className="text-xs text-slate-400">
                {downloadedItems.length} Offline Items Stored ({storageUsageMb} MB used)
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-semibold text-cyan-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {storageUsageMb} MB / {storageQuotaMb > 1000 ? `${(storageQuotaMb / 1024).toFixed(1)} GB` : `${storageQuotaMb} MB`}
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(2, usagePct))}%` }}
          />
        </div>
      </div>

      {/* Offline Mode Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-center space-x-3 text-xs text-amber-200">
        <WifiOff className="h-5 w-5 text-amber-400 flex-shrink-0" />
        <p>
          <strong className="font-semibold text-amber-300">Offline playback ready:</strong> All downloaded items listed below contain full binary audio/video Blobs and will play smoothly even if you disconnect from the internet or toggle Simulated Offline mode!
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        {(['all', 'audio', 'video'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
              filterType === t
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'all' ? `All Downloads (${downloadedItems.length})` : t === 'audio' ? 'Audio Tracks' : 'Videos'}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-12 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-300">No Offline Downloads Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the download button on any track or video to store high quality media locally in your browser!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <img
                  src={item.coverOrThumbnail}
                  alt={item.title}
                  className="h-12 w-12 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-white text-sm truncate">{item.title}</h4>
                    <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-300 border border-emerald-800/50">
                      {item.quality}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{item.artist}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {item.format} • {item.fileSizeMb} MB • Downloaded {new Date(item.downloadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0">
                {/* Play Offline */}
                <button
                  onClick={() => onPlayDownloadedItem(item)}
                  className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play Offline</span>
                </button>

                {/* Export File */}
                <button
                  onClick={() => onExportDownloadedBlob(item)}
                  className="flex items-center space-x-1.5 rounded-lg border border-indigo-800 bg-indigo-950 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-900 transition-all"
                  title="Save actual file (.flac / .mp3 / .mp4) to user computer disk"
                >
                  <HardDriveUpload className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export File</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDeleteDownloadedItem(item.id)}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-colors"
                  title="Remove from offline storage"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
