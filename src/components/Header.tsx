import React from 'react';
import { Search, Wifi, WifiOff, Sparkles, HardDrive, Maximize2, Minimize2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSimulatedOffline: boolean;
  setIsSimulatedOffline: (offline: boolean) => void;
  storageUsageMb: number;
  downloadedCount: number;
  setActiveTab: (tab: ActiveTab) => void;
  isCompactMode: boolean;
  setIsCompactMode: (compact: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  isSimulatedOffline,
  setIsSimulatedOffline,
  storageUsageMb,
  downloadedCount,
  setActiveTab,
  isCompactMode,
  setIsCompactMode,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 md:px-6 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative flex items-center w-full max-w-md">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks, artists, FLAC audio, or videos..."
          className="w-full rounded-full border border-slate-800 bg-slate-900/90 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Compact Mode Toggle */}
        <button
          onClick={() => setIsCompactMode(!isCompactMode)}
          className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
            isCompactMode
              ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/60 shadow-sm shadow-cyan-950'
              : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
          }`}
          title="Toggle Compact Mode (shrink sidebar & content padding for high-density UI)"
        >
          {isCompactMode ? (
            <>
              <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Normal View</span>
            </>
          ) : (
            <>
              <Minimize2 className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden lg:inline">Compact Mode</span>
            </>
          )}
        </button>

        {/* Storage Quick Info */}
        <button
          onClick={() => setActiveTab('downloads')}
          className="hidden sm:flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-all"
          title="Offline Storage & Downloads"
        >
          <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
          <span>{storageUsageMb} MB</span>
          <span className="rounded-full bg-cyan-950 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-800/50">
            {downloadedCount} Offline
          </span>
        </button>

        {/* AI Curator Launcher */}
        <button
          onClick={() => setActiveTab('ai-curator')}
          className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg shadow-purple-900/20 hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-purple-200" />
          <span className="hidden md:inline">AI Curator</span>
        </button>

        {/* Simulated Network Status / Offline Mode Switcher */}
        <button
          onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
          className={`flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${
            isSimulatedOffline
              ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
              : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40'
          }`}
          title="Toggle Simulated Offline Mode to test offline playback from IndexedDB"
        >
          {isSimulatedOffline ? (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
              <span>Offline Mode (Active)</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Online (Simulate Offline)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
