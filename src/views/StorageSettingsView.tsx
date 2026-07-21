import React, { useState } from 'react';
import { HardDrive, Settings, Trash2, CheckCircle2, ShieldCheck, Database, FileCode } from 'lucide-react';
import { AudioQuality, VideoQuality } from '../types';

interface StorageSettingsViewProps {
  storageUsageMb: number;
  storageQuotaMb: number;
  downloadedCount: number;
  defaultAudioQuality: AudioQuality;
  setDefaultAudioQuality: (q: AudioQuality) => void;
  defaultVideoQuality: VideoQuality;
  setDefaultVideoQuality: (q: VideoQuality) => void;
  onClearAllDownloads: () => void;
}

export const StorageSettingsView: React.FC<StorageSettingsViewProps> = ({
  storageUsageMb,
  storageQuotaMb,
  downloadedCount,
  defaultAudioQuality,
  setDefaultAudioQuality,
  defaultVideoQuality,
  setDefaultVideoQuality,
  onClearAllDownloads,
}) => {
  const usagePct = storageQuotaMb > 0 ? (storageUsageMb / storageQuotaMb) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-cyan-400" /> Offline Downloads & Quota Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure High-Quality Audio & Video Download Defaults and Manage IndexedDB Media Cache
        </p>
      </div>

      {/* Storage Capacity Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Browser Storage Engine (IndexedDB)</h3>
              <p className="text-xs text-slate-400">{downloadedCount} media items stored locally</p>
            </div>
          </div>
          <span className="font-mono text-xs text-cyan-300 font-semibold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {storageUsageMb} MB Used
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(3, usagePct))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Usage: {storageUsageMb} MB</span>
          <span>Max Available: {storageQuotaMb > 1000 ? `${(storageQuotaMb / 1024).toFixed(1)} GB` : `${storageQuotaMb} MB`}</span>
        </div>
      </div>

      {/* Download Quality Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-400" /> Default Download Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Audio Quality Preference */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-sm font-semibold text-white">Default Audio Download Format</h4>
            <p className="text-xs text-slate-400">
              Select the audio format bitrate used when saving tracks for offline listening.
            </p>
            <div className="space-y-2 pt-1">
              {[
                { id: 'FLAC' as AudioQuality, label: 'FLAC 24-bit Lossless (96kHz/192kHz Master)', desc: 'Highest audio fidelity (~35-60 MB per track)' },
                { id: '320k' as AudioQuality, label: 'MP3 320 kbps High Quality', desc: 'Balanced high quality (~7-10 MB per track)' },
                { id: '128k' as AudioQuality, label: 'MP3 128 kbps Standard', desc: 'Compact size (~3 MB per track)' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setDefaultAudioQuality(opt.id)}
                  className={`flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    defaultAudioQuality === opt.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="audioQuality"
                    checked={defaultAudioQuality === opt.id}
                    onChange={() => setDefaultAudioQuality(opt.id)}
                    className="mt-1 accent-cyan-400"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Video Quality Preference */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-sm font-semibold text-white">Default Video Resolution</h4>
            <p className="text-xs text-slate-400">
              Select the default resolution for offline concert & music video downloads.
            </p>
            <div className="space-y-2 pt-1">
              {[
                { id: '4K' as VideoQuality, label: '4K Ultra HD (2160p)', desc: 'Maximum sharpness & detail (~200 MB per video)' },
                { id: '1080p' as VideoQuality, label: '1080p Full HD', desc: 'Standard HD video (~80-100 MB per video)' },
                { id: '720p' as VideoQuality, label: '720p HD Compact', desc: 'Reduced storage (~40 MB per video)' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setDefaultVideoQuality(opt.id)}
                  className={`flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    defaultVideoQuality === opt.id
                      ? 'border-purple-500 bg-purple-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoQuality"
                    checked={defaultVideoQuality === opt.id}
                    onChange={() => setDefaultVideoQuality(opt.id)}
                    className="mt-1 accent-purple-400"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cache Action */}
      <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white">Clear Offline Storage</h4>
          <p className="text-xs text-rose-200">
            Deletes all downloaded FLAC tracks, MP3s, and HD videos from your browser's IndexedDB.
          </p>
        </div>
        <button
          onClick={onClearAllDownloads}
          className="flex items-center space-x-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-rose-500 transition-all flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
          <span>Purge All Offline Media</span>
        </button>
      </div>
    </div>
  );
};
