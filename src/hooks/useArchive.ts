import { useState, useEffect } from 'react';
import {
  ArchiveMetadata,
  DailyStats,
  Message,
  Moment,
} from '../types/archive';
import {
  fetchMetadata,
  fetchDailyStats,
  fetchDayConversation,
  DEFAULT_MOMENTS,
} from '../lib/data';

export type ActiveTab = 'calendar' | 'conversation' | 'search' | 'analytics' | 'media' | 'moments' | 'journey' | 'vault';

export function useArchive() {
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view state
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-11'); // Default to peak day
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);

  // Day conversation state
  const [currentDayMessages, setCurrentDayMessages] = useState<Message[]>([]);
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  // Moments state (persisted in localStorage)
  const [moments, setMoments] = useState<Moment[]>(() => {
    try {
      const saved = localStorage.getItem('nihan_archive_moments');
      if (saved) {
        const parsed: Moment[] = JSON.parse(saved);
        const customMoments = parsed.filter((m) => m.isCustom);
        const favoriteIds = new Set(parsed.filter((m) => m.isFavorite).map((m) => m.id));

        // Merge enriched default moments with stored favorite flags
        const mergedDefaults = DEFAULT_MOMENTS.map((dm) => ({
          ...dm,
          isFavorite: favoriteIds.has(dm.id) || dm.isFavorite,
        }));

        return [...customMoments, ...mergedDefaults];
      }
    } catch {}
    return DEFAULT_MOMENTS;
  });

  // Load initial global data
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [meta, stats] = await Promise.all([
          fetchMetadata(),
          fetchDailyStats(),
        ]);
        setMetadata(meta);
        setDailyStats(stats);
        if (stats.length > 0) {
          setSelectedDate(stats[stats.length - 1].date);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize archive');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Load day messages when selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    let isCancelled = false;

    async function loadDay() {
      try {
        setIsLoadingDay(true);
        const msgs = await fetchDayConversation(selectedDate);
        if (!isCancelled) {
          setCurrentDayMessages(msgs);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error loading day:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingDay(false);
        }
      }
    }

    loadDay();
    return () => {
      isCancelled = true;
    };
  }, [selectedDate]);

  // Navigate directly to a day and optionally jump to a message
  const navigateToDay = (date: string, messageId?: string) => {
    setSelectedDate(date);
    if (messageId) {
      setHighlightMessageId(messageId);
    } else {
      setHighlightMessageId(null);
    }
    setActiveTab('conversation');
  };

  // Add / update custom moment
  const saveMoment = (moment: Moment) => {
    const updated = moments.some((m) => m.id === moment.id)
      ? moments.map((m) => (m.id === moment.id ? moment : m))
      : [moment, ...moments];
    setMoments(updated);
    try {
      localStorage.setItem('nihan_archive_moments', JSON.stringify(updated));
    } catch {}
  };

  const deleteMoment = (id: string) => {
    const updated = moments.filter((m) => m.id !== id);
    setMoments(updated);
    try {
      localStorage.setItem('nihan_archive_moments', JSON.stringify(updated));
    } catch {}
  };

  return {
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
    setHighlightMessageId,
    navigateToDay,
    moments,
    saveMoment,
    deleteMoment,
  };
}
