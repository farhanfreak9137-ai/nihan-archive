import { useState, useEffect } from 'react';
import { useArchive } from './hooks/useArchive';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { CalendarView } from './components/calendar/CalendarView';
import { ConversationViewer } from './components/conversation/ConversationViewer';
import { SearchView } from './components/search/SearchView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { MediaVaultView } from './components/media/MediaVaultView';
import { MomentsView } from './components/moments/MomentsView';
import { JourneyView } from './components/journey/JourneyView';
import { AiDaySummaryModal } from './components/ai/AiDaySummaryModal';
import { ArchiveWrappedModal } from './components/analytics/ArchiveWrappedModal';
import { RelationshipAuraModal } from './components/analytics/RelationshipAuraModal';
import { SurpriseMemoryModal } from './components/moments/SurpriseMemoryModal';
import { TriviaQuizModal } from './components/trivia/TriviaQuizModal';
import { KeepsakeBookModal } from './components/export/KeepsakeBookModal';
import { IntimateVaultView } from './components/vault/IntimateVaultView';
import { StickyAudioDock } from './components/ui/StickyAudioDock';
import { ThemeProvider } from './context/ThemeContext';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';
import { AvatarProvider } from './context/AvatarContext';
import { Loader2 } from 'lucide-react';

function ArchiveAppInner() {
  const {
    metadata,
    dailyStats,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    currentDayMessages,
    isLoadingDay,
    highlightMessageId,
    navigateToDay,
    moments,
    saveMoment,
    deleteMoment,
  } = useArchive();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isAuraOpen, setIsAuraOpen] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isTriviaOpen, setIsTriviaOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  const { setOnJumpToMessage } = useAudioPlayer();

  // Wire jump to message from sticky dock
  useEffect(() => {
    setOnJumpToMessage((date, msgId) => {
      navigateToDay(date, msgId);
    });
  }, [navigateToDay, setOnJumpToMessage]);

  // Global Keyboard shortcuts: '/' or 'Cmd+K' to launch search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && activeTab !== 'search') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setActiveTab('search');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, setActiveTab]);

  const handleSelectCalendarDate = (date: string) => {
    navigateToDay(date);
  };

  const handleSearchJump = (date: string, messageId?: string) => {
    navigateToDay(date, messageId);
  };

  const handleSearchExpressionFromAnalytics = (query: string) => {
    setSearchInitialQuery(query);
    setActiveTab('search');
  };

  const currentStats = dailyStats.find((d) => d.date === selectedDate);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d10] flex flex-col items-center justify-center text-slate-300 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[2px] animate-pulse">
          <div className="w-full h-full rounded-[14px] bg-[#0b0d10] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h1 className="font-editorial text-xl text-white">NILA ARCHIVE</h1>
          <p className="text-xs text-[#8b949e] font-mono">Initializing archive conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0d10] flex flex-col items-center justify-center text-rose-300 p-6 text-center gap-3">
        <div className="text-xl font-editorial">Failed to load archive</div>
        <p className="text-xs text-[#8b949e] max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-[#161b22] border border-[#21262d] text-xs text-white"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[var(--bg-base)] text-[#f0f6fc] flex flex-col selection:bg-rose-500/20 selection:text-rose-200">
      {/* Top Navigation Bar */}
      <Navbar
        metadata={metadata}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        onOpenSearch={() => setActiveTab('search')}
        onOpenWrapped={() => setIsWrappedOpen(true)}
        onOpenSurprise={() => setIsSurpriseOpen(true)}
        onOpenTrivia={() => setIsTriviaOpen(true)}
        onOpenBook={() => setIsBookOpen(true)}
        onOpenAura={() => setIsAuraOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedDate={selectedDate}
          totalDays={dailyStats.length}
        />

        {/* Content Viewport */}
        <main
          className={`flex-1 min-h-0 ${
            activeTab === 'conversation'
              ? 'overflow-hidden flex flex-col h-full'
              : 'overflow-y-auto pb-24 md:pb-8'
          }`}
        >
          {activeTab === 'calendar' && (
            <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
              <CalendarView
                dailyStats={dailyStats}
                selectedDate={selectedDate}
                onSelectDate={handleSelectCalendarDate}
              />
            </div>
          )}

          {activeTab === 'conversation' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in">
              <ConversationViewer
                date={selectedDate}
                messages={currentDayMessages}
                dailyStats={dailyStats}
                isLoading={isLoadingDay}
                onSelectDate={setSelectedDate}
                highlightMessageId={highlightMessageId}
                onOpenAiSummary={() => setIsAiModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'search' && (
            <div className="p-3 sm:p-6 lg:p-8 animate-fade-in">
              <SearchView
                onSelectResult={handleSearchJump}
                initialQuery={searchInitialQuery}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-3 sm:p-6 lg:p-8 animate-fade-in">
              <AnalyticsView
                metadata={metadata}
                dailyStats={dailyStats}
                onSearchExpression={handleSearchExpressionFromAnalytics}
                onSelectDate={handleSelectCalendarDate}
              />
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-3 sm:p-6 lg:p-8 animate-fade-in">
              <MediaVaultView onSelectMedia={handleSearchJump} />
            </div>
          )}

          {activeTab === 'journey' && (
            <div className="p-3 sm:p-6 lg:p-8 animate-fade-in">
              <JourneyView
                dailyStats={dailyStats}
                onSelectDay={handleSearchJump}
              />
            </div>
          )}

          {activeTab === 'moments' && (
            <div className="p-3 sm:p-6 lg:p-8 animate-fade-in">
              <MomentsView
                moments={moments}
                onSelectMoment={navigateToDay}
                onSaveMoment={saveMoment}
                onDeleteMoment={deleteMoment}
              />
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="p-3 sm:p-6 lg:p-8 animate-fade-in">
              <IntimateVaultView onSelectContext={handleSearchJump} />
            </div>
          )}
        </main>
      </div>

      {/* Persistent Global Sticky Audio Dock */}
      <StickyAudioDock />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Opt-in Gemini AI Day Summary Modal */}
      <AiDaySummaryModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        date={selectedDate}
        stats={currentStats}
        messages={currentDayMessages}
      />

      {/* Our Archive Wrapped Story Modal */}
      {metadata && (
        <ArchiveWrappedModal
          isOpen={isWrappedOpen}
          onClose={() => setIsWrappedOpen(false)}
          metadata={metadata}
          dailyStats={dailyStats}
        />
      )}

      {/* Surprise Memory Generator Modal */}
      <SurpriseMemoryModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        onJumpToMessage={handleSearchJump}
      />

      {/* Who Said It? Trivia Quiz Modal */}
      <TriviaQuizModal
        isOpen={isTriviaOpen}
        onClose={() => setIsTriviaOpen(false)}
        onJumpToMessage={handleSearchJump}
      />

      {/* The Story of Us Keepsake Book Modal */}
      <KeepsakeBookModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        dailyStats={dailyStats}
      />

      {/* Relationship Aura & Mood Spectrum Modal */}
      {metadata && (
        <RelationshipAuraModal
          isOpen={isAuraOpen}
          onClose={() => setIsAuraOpen(false)}
          metadata={metadata}
          dailyStats={dailyStats}
          onSelectDate={handleSearchJump}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AudioPlayerProvider>
        <AvatarProvider>
          <ArchiveAppInner />
        </AvatarProvider>
      </AudioPlayerProvider>
    </ThemeProvider>
  );
}
