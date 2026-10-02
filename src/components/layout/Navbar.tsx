import React, { useState, useEffect } from 'react';
import { Calendar, Search, Sparkles, Dices, Palette, ChevronDown, HelpCircle, BookOpen, Heart, MoreHorizontal } from 'lucide-react';
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
  onOpenTrivia: () => void;
  onOpenBook: () => void;
  onOpenAura?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  activeTab,
  setActiveTab,
  selectedDate,
  onOpenSearch,
  onOpenWrapped,
  onOpenSurprise,
  onOpenTrivia,
  onOpenBook,
  onOpenAura,
}) => {
  const { theme, setTheme, currentThemeConfig } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    setIsThemeMenuOpen(false);
    setIsExploreMenuOpen(false);
    setIsMoreMenuOpen(false);
  }, [activeTab]);

  return (
    <header className="w-full shrink-0 border-b border-[#21262d] bg-[#0b0d10]/95 backdrop-blur-xl px-3 sm:px-5 lg:px-6 py-2.5 transition-colors z-40">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3 shrink-0">
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
                <span className="font-editorial text-base sm:text-lg tracking-wide text-white font-medium whitespace-nowrap">
                  NILA ARCHIVE
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono shrink-0">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e] font-sans hidden 2xl:block whitespace-nowrap">
                {metadata
                  ? `${metadata.totalMessages.toLocaleString()} Messages • ${metadata.activeDays} Active Days`
                  : 'Conversation Archive & Analytics'}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Participant Balance Pills (Responsive) */}
        {metadata && (
          <>
            {/* Full balance pill on ultra-wide screens */}
            <div className="hidden 2xl:flex items-center gap-2 bg-[#12161c] border border-[#21262d] rounded-full px-3 py-1 text-xs shrink-0">
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

            {/* Compact balance pill on standard desktop/laptop (xl to 2xl) */}
            <div className="hidden xl:flex 2xl:hidden items-center gap-2 bg-[#12161c] border border-[#21262d] rounded-full px-2.5 py-1 text-[11px] shrink-0 font-mono">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-300 font-medium">
                  {((metadata.participantsDisplay.NILA / metadata.totalMessages) * 100).toFixed(1)}%
                </span>
              </div>
              <span className="text-[#30363d]">•</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span className="text-sky-300 font-medium">
                  {((metadata.participantsDisplay.FARHAN / metadata.totalMessages) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </>
        )}

        {/* Right Actions: Search, Highlights (Aura & Wrapped), Explore Dropdown, Theme, Date */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#f0f6fc] text-xs font-mono transition-colors shadow-sm shrink-0 whitespace-nowrap"
            title="Search Archive (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#0b0d10] text-[#8b949e] border border-[#30363d]">
              /
            </kbd>
          </button>

          {/* Relationship Aura Trigger (Feature #7) */}
          {onOpenAura && (
            <button
              onClick={onOpenAura}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-rose-500/20 hover:from-purple-500/30 hover:to-rose-500/30 border border-purple-500/40 hover:border-purple-400/60 text-purple-200 text-xs font-mono transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap group"
              title="Open Relationship Aura & Mood Spectrum"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Aura</span>
            </button>
          )}

          {/* Our Wrapped Trigger */}
          <button
            onClick={onOpenWrapped}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-500/40 hover:border-rose-400/60 text-rose-200 text-xs font-mono transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap group"
            title="Open Our Archive Wrapped"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Wrapped</span>
          </button>

          {/* Explore Activities Dropdown (Desktop & Tablet) */}
          <div className="relative hidden sm:block shrink-0">
            <button
              onClick={() => {
                setIsExploreMenuOpen(!isExploreMenuOpen);
                setIsThemeMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-sm ${
                isExploreMenuOpen
                  ? 'bg-[#21262d] border-[#484f58] text-amber-200 ring-1 ring-amber-400/20'
                  : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] text-amber-300'
              }`}
              title="More Archive Features & Activities"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">Explore</span>
              <ChevronDown
                className={`w-3 h-3 text-[#8b949e] transition-transform duration-200 ${
                  isExploreMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isExploreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsExploreMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#12161c]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-fade-in divide-y divide-white/5">
                  <div className="px-3 py-1.5 text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">
                    Archive Activities & Moments
                  </div>
                  <div className="pt-1 space-y-1">
                    <button
                      onClick={() => {
                        onOpenSurprise();
                        setIsExploreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                        <Dices className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-amber-200 font-mono">
                          Surprise Memory
                        </div>
                        <div className="text-[10px] text-[#8b949e]">
                          Flashback to a random moment
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenTrivia();
                        setIsExploreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-sky-200 font-mono">
                          Who Said It? Trivia
                        </div>
                        <div className="text-[10px] text-[#8b949e]">
                          Relationship dialogue game
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenBook();
                        setIsExploreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-rose-200 font-mono">
                          Keepsake Book
                        </div>
                        <div className="text-[10px] text-[#8b949e]">
                          Printable story & PDF export
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('journey');
                        setIsExploreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:scale-105 transition-transform">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-pink-200 font-mono">
                          The Journey
                        </div>
                        <div className="text-[10px] text-[#8b949e]">
                          Milestone chapters & story
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Dropdown Toggle */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsExploreMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-slate-300 transition-colors shrink-0 whitespace-nowrap"
              title={`Switch Theme (Current: ${currentThemeConfig.name})`}
            >
              <Palette className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="hidden xl:inline text-xs font-mono whitespace-nowrap">
                {currentThemeConfig.name}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#8b949e] shrink-0 transition-transform duration-200 ${
                  isThemeMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isThemeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsThemeMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#12161c]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
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

          {/* More Actions Menu (Mobile Only) */}
          <div className="relative sm:hidden shrink-0">
            <button
              onClick={() => {
                setIsMoreMenuOpen(!isMoreMenuOpen);
                setIsThemeMenuOpen(false);
              }}
              className="p-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-slate-300 transition-colors shrink-0"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-300" />
            </button>

            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#12161c]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                  <div className="px-2.5 py-1 text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">
                    Quick Actions
                  </div>

                  <button
                    onClick={() => {
                      onOpenSurprise();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-mono text-amber-300 hover:bg-white/5 transition-colors"
                  >
                    <Dices className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Surprise Memory</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenTrivia();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-mono text-sky-300 hover:bg-white/5 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Who Said It? Trivia</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenBook();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-mono text-rose-300 hover:bg-white/5 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Keepsake Book</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('journey');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-mono text-pink-300 hover:bg-white/5 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>The Journey</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Current Date Badge (Desktop & Tablet) */}
          {selectedDate && (
            <button
              onClick={() => setActiveTab('conversation')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'conversation'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'bg-[#12161c] text-[#8b949e] hover:text-white border border-[#21262d]'
              }`}
              title={`Jump to conversation for ${selectedDate}`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{selectedDate.slice(5)}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
