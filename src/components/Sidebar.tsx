import React from 'react';
import {
  Compass,
  Music,
  Video,
  Download,
  ListMusic,
  Sparkles,
  HardDrive,
  Sliders,
  Disc3,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  downloadedCount: number;
  openEqualizer: () => void;
  isCompactMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  downloadedCount,
  openEqualizer,
  isCompactMode = false,
}) => {
  const navItems = [
    { id: 'discover' as ActiveTab, label: 'Discover', icon: Compass },
    { id: 'music' as ActiveTab, label: 'Music & Audio', icon: Music },
    { id: 'videos' as ActiveTab, label: 'Videos & Live', icon: Video },
    {
      id: 'downloads' as ActiveTab,
      label: 'Offline Library',
      icon: Download,
      badge: downloadedCount > 0 ? downloadedCount : undefined,
    },
    { id: 'playlists' as ActiveTab, label: 'Playlists', icon: ListMusic },
    { id: 'ai-curator' as ActiveTab, label: 'AI Playlist Curator', icon: Sparkles, highlight: true },
    { id: 'storage' as ActiveTab, label: 'Downloads & Quota', icon: HardDrive },
  ];

  return (
    <aside
      className={`${
        isCompactMode ? 'w-20 p-2.5' : 'w-64 p-4'
      } flex-shrink-0 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between hidden md:flex h-screen sticky top-0 transition-all duration-300`}
    >
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className={`flex items-center ${isCompactMode ? 'justify-center py-2' : 'space-x-3 px-2 py-2'}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <Disc3 className="h-6 w-6 text-white animate-spin-slow" />
          </div>
          {!isCompactMode && (
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Aura <span className="text-cyan-400">Stream</span>
              </h1>
              <p className="text-[10px] font-semibold tracking-wider text-cyan-400/90 uppercase">
                Hi-Res Offline Streaming
              </p>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {!isCompactMode && (
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Browse
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCompactMode ? item.label : undefined}
                className={`relative w-full flex items-center ${
                  isCompactMode ? 'justify-center py-3 px-1' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                }`}
              >
                <div className={`flex items-center ${isCompactMode ? 'justify-center' : 'space-x-3'}`}>
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? 'text-cyan-400'
                        : item.highlight
                        ? 'text-purple-400'
                        : 'text-slate-400'
                    }`}
                  />
                  {!isCompactMode && (
                    <span className={item.highlight ? 'text-purple-200' : ''}>
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCompactMode && item.badge !== undefined && (
                  <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-800/50">
                    {item.badge}
                  </span>
                )}
                {isCompactMode && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & Web Audio EQ */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <button
          onClick={openEqualizer}
          title={isCompactMode ? 'Web Audio Equalizer & FX' : undefined}
          className={`w-full flex items-center ${
            isCompactMode ? 'justify-center py-3' : 'justify-between px-3.5 py-2.5'
          } rounded-xl border border-indigo-900/40 bg-indigo-950/20 text-xs font-medium text-indigo-300 hover:bg-indigo-900/40 hover:border-indigo-700/50 transition-all`}
        >
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            {!isCompactMode && <span>Web Audio Equalizer & FX</span>}
          </div>
          {!isCompactMode && (
            <span className="rounded bg-indigo-900/60 px-1.5 py-0.5 text-[10px] text-indigo-200 font-mono">
              5-Band
            </span>
          )}
        </button>

        {!isCompactMode && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-300">Offline Engine</span>
              <span className="text-[10px] text-emerald-400 font-semibold">IndexedDB</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              High-quality FLAC audio & HD videos cached locally for instant offline playback.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
