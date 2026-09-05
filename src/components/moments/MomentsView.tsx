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
} from 'lucide-react';
import { Moment } from '../../types/archive';

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
            Important Moments & Milestones
          </h2>
          <p className="text-xs text-[#8b949e]">
            Curated archive milestones and customizable bookmarks linking directly to conversations.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono transition-colors shadow-sm self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Moment</span>
        </button>
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
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#8b949e]">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Reconciliation talk, Birthday night"
                className="w-full px-3 py-2 rounded-lg bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#8b949e]">Date (YYYY-MM-DD)</label>
              <input
                type="date"
                min="2026-07-06"
                max="2026-09-04"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#8b949e]">Description (Optional)</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What makes this conversation memorable..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#8b949e]">Tags (comma-separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="milestone, favorite, late-night"
              className="w-full px-3 py-2 rounded-lg bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#8b949e] hover:text-white"
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

      {/* Timeline List of Moments */}
      <div className="space-y-4">
        {moments.map((moment) => (
          <div
            key={moment.id}
            className="p-5 rounded-2xl bg-[#12161c] border border-[#21262d] hover:border-[#30363d] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#161b22] border border-[#21262d] flex items-center justify-center shrink-0 mt-0.5">
                {getMomentIcon(moment.icon)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-editorial text-lg text-white font-medium">
                    {moment.title}
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
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
                        className="text-[10px] font-mono text-[#8b949e] bg-[#161b22] px-2 py-0.5 rounded border border-[#21262d]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161b22] hover:bg-rose-500 hover:text-white border border-[#21262d] text-xs font-mono text-white transition-all group-hover:border-rose-500/40"
              >
                <span>Explore Day</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
