import React, { useState } from 'react';
import { Calendar, Search, Sparkles, Dices, Palette, ChevronDown } from 'lucide-react';
import { ArchiveMetadata } from '../../types/archive';
import { ActiveTab } from '../../hooks/useArchive';
import { useTheme, THEMES } from '../../context/ThemeContext';

interface NavbarProps {
  metadata: ArchiveMetadata | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string;
  onOpenSearch: () => void;
  onOpenWrapped: () => void;
  onOpenSurprise: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  activeTab,
  setActiveTab,
  selectedDate,
  onOpenSearch,
  onOpenWrapped,
  onOpenSurprise,
}) => {
  const { theme, setTheme, currentThemeConfig } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#21262d] glass-panel px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-2.5 text-left group"
          >
            <img
              src="/logo.png"
              alt="Nila Archive Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-sm ring-1 ring-white/10 group-hover:scale-105 group-hover:ring-rose-500/40 transition-all shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-editorial text-base sm:text-lg tracking-wide text-white font-medium">
                  NILA ARCHIVE
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e] font-sans hidden md:block">
                52,784 Messages • 60 Active Days • July 6 – Sep 4
              </p>
            </div>
          </button>
        </div>

        {/* Center: Participant Balance Pills (Desktop only) */}
        {metadata && (
          <div className="hidden xl:flex items-center gap-2 bg-[#12161c] border border-[#21262d] rounded-full px-3 py-1 text-xs">
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

        {/* Right Actions: Wrapped, Surprise Me, Theme, Search, Date */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Our Wrapped Trigger */}
          <button
            onClick={onOpenWrapped}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-rose-500/15 to-pink-500/15 hover:from-purple-500/25 hover:to-pink-500/25 border border-rose-500/30 text-rose-300 text-xs font-mono transition-all shadow-sm active:scale-95"
            title="Open Our Archive Wrapped"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline font-semibold">Wrapped</span>
          </button>

          {/* Surprise Me Trigger */}
          <button
            onClick={onOpenSurprise}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-amber-300 text-xs font-mono transition-all active:scale-95"
            title="Remember When? (Random Memory)"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Surprise</span>
          </button>

          {/* Theme Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-slate-300 transition-colors"
              title="Switch Visual Theme"
            >
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden lg:inline">{currentThemeConfig.name}</span>
              <ChevronDown className="w-3 h-3 text-[#8b949e]" />
            </button>

            {isThemeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsThemeMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                  <div className="px-2.5 py-1 text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">
                    Select Theme
                  </div>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-mono transition-colors ${
                        theme === t.id
                          ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <div>
                          <span className="font-semibold block">{t.name}</span>
                          <span className="text-[9px] text-[#8b949e] block font-sans">
                            {t.tagline}
                          </span>
                        </div>
                      </div>
                      {theme === t.id && (
                        <span className="text-rose-400 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#f0f6fc] text-xs transition-colors shadow-sm"
            title="Search Archive (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#0b0d10] text-[#8b949e] border border-[#30363d]">
              /
            </kbd>
          </button>

          {/* Current Date Badge */}
          {selectedDate && (
            <button
              onClick={() => setActiveTab('conversation')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === 'conversation'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'bg-[#12161c] text-[#8b949e] hover:text-white border border-[#21262d]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>{selectedDate.slice(5)}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
