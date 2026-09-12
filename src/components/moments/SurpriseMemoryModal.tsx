import React, { useState, useEffect } from 'react';
import {
  X,
  Dices,
  MessageSquare,
  Sparkles,
  Quote,
  Loader2,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchItem } from '../../types/archive';
import { fetchSearchIndex } from '../../lib/data';

interface SurpriseMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToMessage: (date: string, messageId: string) => void;
}

export const SurpriseMemoryModal: React.FC<SurpriseMemoryModalProps> = ({
  isOpen,
  onClose,
  onJumpToMessage,
}) => {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [currentMemory, setCurrentMemory] = useState<SearchItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const allItems = await fetchSearchIndex();
        if (!isCancelled) {
          // Filter for meaningful conversational items (> 15 chars, not system notices)
          const meaningful = allItems.filter(
            (item) =>
              item.content &&
              item.content.length >= 15 &&
              !item.content.includes('sent an attachment') &&
              !item.content.includes('started a call')
          );
          setItems(meaningful);
          pickRandom(meaningful);
        }
      } catch (err) {
        console.error('Failed to load memories:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const pickRandom = (pool = items) => {
    if (pool.length === 0) return;
    setIsRolling(true);
    const randomIndex = Math.floor(Math.random() * pool.length);
    setCurrentMemory(pool[randomIndex]);
    setTimeout(() => setIsRolling(false), 400);
  };

  if (!isOpen) return null;

  const isNila = currentMemory?.sender === 'NILU';
  const senderDisplay = isNila ? 'NILA' : 'FARHAN';

  const formattedDate = currentMemory
    ? new Date(`${currentMemory.date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Ambient Glow */}
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
            isNila ? 'bg-rose-500' : 'bg-sky-500'
          }`}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-editorial text-lg text-white font-semibold leading-tight">
                Remember When?
              </h3>
              <span className="text-[10px] font-mono text-[#8b949e]">
                Surprise memory pulled from archive conversations
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Memory Quote Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="text-xs font-mono">Searching the archive memory vault...</span>
          </div>
        ) : currentMemory ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMemory.id}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Date & Sender Metadata */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span
                  className={`px-2.5 py-1 rounded-full font-semibold border ${
                    isNila
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  }`}
                >
                  {senderDisplay}
                </span>

                <div className="flex items-center gap-2 text-[#8b949e]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {currentMemory.time}
                  </span>
                </div>
              </div>

              {/* Quote Card */}
              <div className="relative p-6 sm:p-7 rounded-2xl bg-[#0b0d10]/70 border border-white/10 shadow-inner">
                <Quote className="w-8 h-8 text-rose-500/20 absolute top-3 left-3 -scale-x-100" />
                <p className="relative z-10 text-base sm:text-lg font-editorial text-white leading-relaxed italic text-center selection:bg-rose-500/30">
                  "{currentMemory.content.replace(' (edited)', '')}"
                </p>
                <Quote className="w-8 h-8 text-rose-500/20 absolute bottom-3 right-3" />
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => pickRandom()}
            disabled={isLoading}
            className="w-full sm:flex-1 py-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Dices
              className={`w-4 h-4 text-amber-400 ${
                isRolling ? 'animate-spin' : ''
              }`}
            />
            <span>Roll Another Memory 🎲</span>
          </button>

          {currentMemory && (
            <button
              onClick={() => {
                onJumpToMessage(currentMemory.date, currentMemory.id);
                onClose();
              }}
              className="w-full sm:flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Jump to in Chat 💬</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
