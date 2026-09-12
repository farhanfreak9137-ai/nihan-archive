import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  ArrowRight,
  Flame,
  Heart,
  Moon,
  Trophy,
  Dices,
} from 'lucide-react';
import { Moment } from '../../types/archive';
import { SurpriseMemoryModal } from './SurpriseMemoryModal';

interface MomentsViewProps {
  moments: Moment[];
  onSelectMoment: (date: string, messageId?: string) => void;
  onSaveMoment: (moment: Moment) => void;
  onDeleteMoment: (id: string) => void;
}

export const MomentsView: React.FC<MomentsViewProps> = ({
  moments,
  onSelectMoment,
  onSaveMoment,
  onDeleteMoment,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-08-02');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('milestone');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const newMoment: Moment = {
      id: `custom_${Date.now()}`,
      date: newDate,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      isCustom: true,
      icon: 'sparkles',
    };

    onSaveMoment(newMoment);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const getMomentIcon = (iconName?: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'trophy':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-editorial text-white tracking-tight">
            Important Moments & Memory Lane
          </h2>
          <p className="text-xs text-[#8b949e]">
            Curated archive milestones, glowing timeline threads, and customizable bookmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Surprise Me Button */}
          <button
            onClick={() => setIsSurpriseOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/30 text-amber-300 text-xs font-mono transition-all shadow-sm active:scale-95"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Surprise Me 🎲</span>
          </button>

          {/* Add Moment Button */}
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Moment</span>
          </button>
        </div>
      </div>

      {/* Creation Modal / Inline Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-[#12161c] border border-rose-500/30 space-y-4 animate-fade-in"
        >
          <div className="font-editorial text-lg text-white font-medium">
            New Archive Moment
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Moment Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 3 AM confession, First shared reel..."
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={newDate}
                min="2026-07-06"
                max="2026-09-10"
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Add context or notes about why this moment matters..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g. milestone, laugh, memory"
              className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-xs font-mono text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-xs font-mono text-white"
            >
              Save Moment
            </button>
          </div>
        </form>
      )}

      {/* Connected Glowing Timeline List */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:absolute before:left-[21px] sm:before:left-[37px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-purple-500/50 before:via-rose-500/50 before:to-sky-500/50 before:rounded-full">
        {moments.map((moment) => (
          <div
            key={moment.id}
            className="relative flex items-start gap-4 group"
          >
            {/* Timeline Node Glow */}
            <div className="relative -ml-[25px] sm:-ml-[37px] w-9 h-9 rounded-xl bg-[#12161c] border-2 border-rose-500/60 shadow-lg shadow-rose-500/20 flex items-center justify-center shrink-0 z-10 group-hover:scale-110 group-hover:border-rose-400 transition-all">
              {getMomentIcon(moment.icon)}
            </div>

            {/* Moment Card */}
            <div className="flex-1 p-5 rounded-2xl bg-[#12161c] border border-[#21262d] hover:border-rose-500/40 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-editorial text-lg text-white font-medium">
                    {moment.title}
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {moment.date}
                  </span>
                </div>

                {moment.description && (
                  <p className="text-xs text-[#8b949e] leading-relaxed max-w-xl">
                    {moment.description}
                  </p>
                )}

                {moment.tags && moment.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {moment.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-[#8b949e] bg-[#0b0d10] px-2 py-0.5 rounded border border-[#21262d]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions: Jump to conversation & delete if custom */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {moment.isCustom && (
                  <button
                    onClick={() => onDeleteMoment(moment.id)}
                    className="p-2 rounded-lg text-[#8b949e] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete moment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onSelectMoment(moment.date, moment.messageId)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161b22] hover:bg-rose-500 hover:text-white border border-[#21262d] text-xs font-mono text-white transition-all group-hover:border-rose-500/40"
                >
                  <span>Explore Day</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Surprise Memory Generator Modal */}
      <SurpriseMemoryModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        onJumpToMessage={(date, msgId) => {
          setIsSurpriseOpen(false);
          onSelectMoment(date, msgId);
        }}
      />
    </div>
  );
};
