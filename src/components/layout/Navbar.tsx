import React from 'react';
import { Calendar, Search, Heart } from 'lucide-react';
import { ArchiveMetadata } from '../../types/archive';
import { ActiveTab } from '../../hooks/useArchive';

interface NavbarProps {
  metadata: ArchiveMetadata | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  activeTab,
  setActiveTab,
  selectedDate,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#21262d] bg-[#0b0d10]/90 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Branding & Subtitle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px] shadow-sm shadow-rose-950/40">
              <div className="w-full h-full rounded-[10px] bg-[#0b0d10] flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-lg tracking-wide text-white font-medium">
                  NILA ARCHIVE
                </span>
                <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono">
                  2026
                </span>
              </div>
              <p className="text-xs text-[#8b949e] font-sans hidden sm:block">
                52,784 Messages • 60 Active Days • July 6 – Sep 4
              </p>
            </div>
          </button>
        </div>

        {/* Center: Participant Balance Pills */}
        {metadata && (
          <div className="hidden md:flex items-center gap-2 bg-[#12161c] border border-[#21262d] rounded-full px-3 py-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-200 font-medium">NILA</span>
              <span className="text-[#8b949e] font-mono">
                {metadata.participantsDisplay.NILA.toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-400/80 font-mono">
                (
                {(
                  (metadata.participantsDisplay.NILA / metadata.totalMessages) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>
            <span className="text-[#30363d]">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span className="text-sky-200 font-medium">FARHAN</span>
              <span className="text-[#8b949e] font-mono">
                {metadata.participantsDisplay.FARHAN.toLocaleString()}
              </span>
              <span className="text-[10px] text-sky-400/80 font-mono">
                (
                {(
                  (metadata.participantsDisplay.FARHAN / metadata.totalMessages) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#f0f6fc] text-xs transition-colors shadow-sm"
            title="Search Archive (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search archive...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#0b0d10] text-[#8b949e] border border-[#30363d]">
              /
            </kbd>
          </button>

          {/* Current Date Badge */}
          {selectedDate && (
            <button
              onClick={() => setActiveTab('conversation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'conversation'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'bg-[#12161c] text-[#8b949e] hover:text-white border border-[#21262d]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{selectedDate}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
