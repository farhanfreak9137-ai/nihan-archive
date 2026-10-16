import React, { useState, useEffect, useMemo } from 'react';
import {
  Printer,
  X,
  BookOpen,
  Heart,
  Share2,
  Check,
} from 'lucide-react';
import { DailyStats, NicknameEntry, ExpressionEntry, MediaRecord } from '../../types/archive';
import {
  fetchDailyStats,
  fetchNicknames,
  fetchExpressions,
  fetchMediaIndex,
  resolveDataUrl,
} from '../../lib/data';

interface KeepsakeBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyStats?: DailyStats[];
}

export const KeepsakeBookModal: React.FC<KeepsakeBookModalProps> = ({
  isOpen,
  onClose,
  dailyStats: propDailyStats,
}) => {
  const [stats, setStats] = useState<DailyStats[]>(propDailyStats || []);
  const [nicknames, setNicknames] = useState<NicknameEntry[]>([]);
  const [expressions, setExpressions] = useState<ExpressionEntry[]>([]);
  const [photos, setPhotos] = useState<MediaRecord[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadBookData() {
      try {
        const [loadedStats, loadedNicknames, loadedExpressions, loadedMedia] =
          await Promise.all([
            stats.length > 0 ? Promise.resolve(stats) : fetchDailyStats(),
            fetchNicknames().catch(() => []),
            fetchExpressions().catch(() => []),
            fetchMediaIndex().catch(() => []),
          ]);

        if (isMounted) {
          if (stats.length === 0) setStats(loadedStats);
          setNicknames(loadedNicknames);
          setExpressions(loadedExpressions);
          setPhotos(loadedMedia.filter((m) => m.type === 'photo' && m.uri));
        }
      } catch (err) {
        console.error('Failed to load keepsake book data:', err);
      }
    }

    loadBookData();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Aggregate stats
  const totals = useMemo(() => {
    let totalMessages = 0;
    let sumaiyaMessages = 0;
    let nihanMessages = 0;
    let reels = 0;
    let shares = 0;
    let peakDay = { date: '2026-10-11', count: 0 };

    for (const d of stats) {
      totalMessages += d.totalMessages;
      sumaiyaMessages += d.sumaiyaMessages ?? 0;
      nihanMessages += d.nihanMessages ?? 0;
      reels += d.reels || 0;
      shares += d.shares || 0;
      if (d.totalMessages > peakDay.count) {
        peakDay = { date: d.date, count: d.totalMessages };
      }
    }

    const sumaiyaPct = totalMessages ? Math.round((sumaiyaMessages / totalMessages) * 100) : 44;
    const nihanPct = totalMessages ? 100 - sumaiyaPct : 56;

    return {
      totalMessages: totalMessages || 5436,
      sumaiyaMessages: sumaiyaMessages || 2377,
      nihanMessages: nihanMessages || 2716,
      sumaiyaPct,
      nihanPct,
      reels: reels || 361,
      shares: shares || 515,
      daysCount: stats.length || 102,
      startDate: stats[0]?.date || '2026-01-22',
      endDate: stats[stats.length - 1]?.date || '2026-10-16',
      peakDay,
    };
  }, [stats]);

  // Group stats by Month
  const monthlyStats = useMemo(() => {
    const months: Record<
      string,
      { label: string; days: number; total: number; sumaiya: number; nihan: number }
    > = {};

    for (const d of stats) {
      const monthKey = d.date.slice(0, 7); // e.g. "2026-07"
      if (!months[monthKey]) {
        const dateObj = new Date(`${d.date}T00:00:00`);
        const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        months[monthKey] = { label, days: 0, total: 0, sumaiya: 0, nihan: 0 };
      }
      months[monthKey].days += 1;
      months[monthKey].total += d.totalMessages;
      const s = d.sumaiyaMessages ?? 0;
      const n = d.nihanMessages ?? 0;
      months[monthKey].sumaiya += s;
      months[monthKey].nihan += n;
    }

    return Object.values(months);
  }, [stats]);

  // Curated photo highlights for book
  const samplePhotos = useMemo(() => {
    return photos.slice(0, 8);
  }, [photos]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `📖 The Story of Us — Archive Keepsake\n👫 Nihan & Sumaiya\n📅 ${totals.startDate} to ${totals.endDate} (${totals.daysCount} active days)\n💬 ${totals.totalMessages.toLocaleString()} Total Messages\n✨ Sumaiya: ${totals.sumaiyaMessages.toLocaleString()} (${totals.sumaiyaPct}%) | Nihan: ${totals.nihanMessages.toLocaleString()} (${totals.nihanPct}%)\n🎬 ${totals.shares.toLocaleString()} Shared Reels & Posts\n🔥 Peak Day: ${totals.peakDay.date} with ${totals.peakDay.count.toLocaleString()} messages!`;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Print-specific style tag to ensure flawless paper rendering */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          body {
            background: #ffffff !important;
            color: #111827 !important;
            font-family: serif !important;
          }
          /* Hide non-print elements */
          nav, header, aside, button, .no-print {
            display: none !important;
          }
          .keepsake-modal-wrapper {
            position: static !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .keepsake-page {
            page-break-after: always;
            break-after: page;
            background: white !important;
            color: #111827 !important;
            padding: 2rem 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .keepsake-card {
            border: 1px solid #e5e7eb !important;
            background: #f9fafb !important;
            color: #111827 !important;
            box-shadow: none !important;
          }
          .print-dark-text {
            color: #111827 !important;
          }
          .print-muted-text {
            color: #4b5563 !important;
          }
        }
      `}</style>

      {/* Main Modal Container */}
      <div className="keepsake-modal-wrapper relative w-full max-w-4xl bg-[#0e1217] border border-[#21262d] rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden print:border-none print:shadow-none print:bg-white">
        {/* Sticky Action Toolbar (Hidden in Print) */}
        <div className="no-print sticky top-0 z-30 bg-[#161b22]/95 backdrop-blur-md border-b border-[#21262d] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-400" />
            <span className="font-editorial text-white text-base font-semibold">
              The Story of Us — Keepsake Book
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Printable Edition
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-xs font-mono font-semibold text-white flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Book Content Container */}
        <div className="p-6 sm:p-12 space-y-12 text-[#e6edf3] font-serif print:text-black print:p-0">
          {/* ================= PAGE 1: COVER PAGE ================= */}
          <div className="keepsake-page text-center flex flex-col items-center justify-center min-h-[600px] border-4 border-[#30363d] rounded-2xl p-8 sm:p-16 relative bg-[#12161c] print:bg-white print:border-8 print:border-black print:rounded-none">
            {/* Corner Filigrees */}
            <div className="absolute top-4 left-4 text-rose-400/40 text-2xl print:text-black">❦</div>
            <div className="absolute top-4 right-4 text-rose-400/40 text-2xl print:text-black">❦</div>
            <div className="absolute bottom-4 left-4 text-rose-400/40 text-2xl print:text-black">❦</div>
            <div className="absolute bottom-4 right-4 text-rose-400/40 text-2xl print:text-black">❦</div>

            <div className="space-y-4 max-w-md">
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-rose-400 font-semibold print:text-gray-700">
                A Private Relationship Chronicle
              </span>
              <h1 className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight print:text-black">
                OUR ARCHIVE
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500 mx-auto my-4 print:bg-black" />
              <h2 className="text-xl sm:text-2xl font-editorial italic text-rose-200 print:text-gray-800">
                The Story of Nihan & Sumaiya
              </h2>

              <p className="text-xs sm:text-sm text-[#8b949e] italic pt-4 leading-relaxed print:text-gray-600">
                "Every message sent at 3 AM, every shared laugh across reels, every voice note
                whispered into the phone — bound together forever in these pages."
              </p>

              <div className="pt-8 border-t border-[#21262d] mt-8 text-xs font-mono text-[#8b949e] space-y-1 print:border-gray-400 print:text-gray-700">
                <p>
                  {totals.startDate} — {totals.endDate}
                </p>
                <p>{totals.daysCount} Active Days • {totals.totalMessages.toLocaleString()} Messages</p>
                <p className="text-[11px] opacity-70">Volume I • Uncut Edition</p>
              </div>
            </div>
          </div>

          {/* ================= PAGE 2: CHAPTER I - THE VITALS ================= */}
          <div className="keepsake-page space-y-8 pt-4">
            <div className="border-b border-[#21262d] pb-3 print:border-black">
              <span className="text-xs font-mono text-rose-400 uppercase tracking-wider print:text-gray-700">
                Chapter I
              </span>
              <h3 className="text-2xl font-editorial font-semibold text-white print:text-black">
                The Vitals & Conversation Balance
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="keepsake-card p-4 rounded-xl bg-[#12161c] border border-[#21262d] text-center space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase print:text-gray-600">Total Volume</span>
                <p className="text-2xl font-bold font-editorial text-white print:text-black">
                  {totals.totalMessages.toLocaleString()}
                </p>
                <span className="text-[11px] text-[#8b949e] block print:text-gray-500">Exchanged messages</span>
              </div>

              <div className="keepsake-card p-4 rounded-xl bg-[#12161c] border border-[#21262d] text-center space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase print:text-gray-600">Active Span</span>
                <p className="text-2xl font-bold font-editorial text-amber-300 print:text-black">
                  {totals.daysCount}
                </p>
                <span className="text-[11px] text-[#8b949e] block print:text-gray-500">Days of talking</span>
              </div>

              <div className="keepsake-card p-4 rounded-xl bg-[#12161c] border border-[#21262d] text-center space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase print:text-gray-600">Shared Links</span>
                <p className="text-2xl font-bold font-editorial text-rose-300 print:text-black">
                  {totals.shares.toLocaleString()}
                </p>
                <span className="text-[11px] text-[#8b949e] block print:text-gray-500">Reels, posts & links</span>
              </div>

              <div className="keepsake-card p-4 rounded-xl bg-[#12161c] border border-[#21262d] text-center space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase print:text-gray-600">Peak Marathon</span>
                <p className="text-2xl font-bold font-editorial text-emerald-300 print:text-black">
                  {totals.peakDay.count.toLocaleString()}
                </p>
                <span className="text-[11px] text-[#8b949e] block print:text-gray-500">on {totals.peakDay.date}</span>
              </div>
            </div>

            {/* Talk Ratio Visualizer */}
            <div className="keepsake-card p-6 rounded-xl bg-[#12161c] border border-[#21262d] space-y-3 print:bg-gray-50 print:border-gray-300">
              <h4 className="text-sm font-semibold font-mono text-white print:text-black flex items-center justify-between">
                <span>Conversation Balance</span>
                <span className="text-xs text-[#8b949e] font-normal print:text-gray-600">
                  Sumaiya {totals.sumaiyaPct}% vs Nihan {totals.nihanPct}%
                </span>
              </h4>

              <div className="h-4 w-full bg-[#21262d] rounded-full overflow-hidden flex print:border print:border-gray-400">
                <div
                  style={{ width: `${totals.sumaiyaPct}%` }}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 print:bg-rose-600"
                />
                <div
                  style={{ width: `${totals.nihanPct}%` }}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 print:bg-sky-600"
                />
              </div>

              <div className="flex justify-between text-xs font-mono pt-1">
                <span className="text-rose-400 font-semibold print:text-rose-700">
                  SUMAIYA: {totals.sumaiyaMessages.toLocaleString()} msgs ({totals.sumaiyaPct}%)
                </span>
                <span className="text-sky-400 font-semibold print:text-sky-700">
                  NIHAN: {totals.nihanMessages.toLocaleString()} msgs ({totals.nihanPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* ================= PAGE 3: CHAPTER II - PET NAMES & EXPRESSIONS ================= */}
          <div className="keepsake-page space-y-8 pt-4">
            <div className="border-b border-[#21262d] pb-3 print:border-black">
              <span className="text-xs font-mono text-rose-400 uppercase tracking-wider print:text-gray-700">
                Chapter II
              </span>
              <h3 className="text-2xl font-editorial font-semibold text-white print:text-black">
                Terms of Endearment & The Love Ledger
              </h3>
            </div>

            {/* Pet Names Grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold font-mono text-white print:text-black">
                Most Frequent Pet Names Exchanged
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nicknames.slice(0, 6).map((n, i) => (
                  <div
                    key={i}
                    className="keepsake-card p-3 rounded-lg bg-[#12161c] border border-[#21262d] flex items-center justify-between print:bg-gray-50 print:border-gray-300"
                  >
                    <div>
                      <span className="text-base font-editorial font-bold text-rose-300 print:text-black">
                        "{n.nickname}"
                      </span>
                      <span className="block text-[10px] font-mono text-[#8b949e] print:text-gray-600">
                        Sumaiya ({n.bySender?.SUMAIYA || 0}) • Nihan ({n.bySender?.NIHAN || 0})
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white print:text-black">
                      {n.totalCount}x
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expressions Ledger */}
            <div className="space-y-3 pt-4">
              <h4 className="text-sm font-semibold font-mono text-white print:text-black">
                Affection & Apology Balance Sheet
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {expressions.slice(0, 3).map((exp, i) => (
                  <div
                    key={i}
                    className="keepsake-card p-4 rounded-xl bg-[#12161c] border border-[#21262d] space-y-2 print:bg-gray-50 print:border-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-editorial font-bold text-amber-200 print:text-black capitalize">
                        {exp.category}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 print:border-gray-400 print:text-black">
                        {exp.totalOccurrences?.total || 0}x total
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e] print:text-gray-600 italic">
                      "{exp.label}"
                    </p>
                    <div className="text-[11px] font-mono pt-1 flex justify-between border-t border-[#21262d] print:border-gray-300">
                      <span className="text-rose-400 print:text-gray-700">Sumaiya: {exp.totalOccurrences?.SUMAIYA || 0}</span>
                      <span className="text-sky-400 print:text-gray-700">Nihan: {exp.totalOccurrences?.NIHAN || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= PAGE 4: CHAPTER III - MONTHLY CHRONICLES ================= */}
          <div className="keepsake-page space-y-8 pt-4">
            <div className="border-b border-[#21262d] pb-3 print:border-black">
              <span className="text-xs font-mono text-rose-400 uppercase tracking-wider print:text-gray-700">
                Chapter III
              </span>
              <h3 className="text-2xl font-editorial font-semibold text-white print:text-black">
                The Monthly Timeline Chronicles
              </h3>
            </div>

            <div className="space-y-4">
              {monthlyStats.map((m, idx) => (
                <div
                  key={idx}
                  className="keepsake-card p-5 rounded-xl bg-[#12161c] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:bg-gray-50 print:border-gray-300"
                >
                  <div className="space-y-1">
                    <span className="text-lg font-editorial font-bold text-white print:text-black">
                      {m.label}
                    </span>
                    <p className="text-xs font-mono text-[#8b949e] print:text-gray-600">
                      {m.days} active calendar days of conversation
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-[#8b949e] block text-[10px] print:text-gray-500">TOTAL</span>
                      <span className="font-bold text-white text-sm print:text-black">
                        {m.total.toLocaleString()} msgs
                      </span>
                    </div>
                    <div>
                      <span className="text-rose-400 block text-[10px] print:text-rose-700">SUMAIYA</span>
                      <span className="font-semibold text-rose-300 print:text-black">
                        {m.sumaiya.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sky-400 block text-[10px] print:text-sky-700">NIHAN</span>
                      <span className="font-semibold text-sky-300 print:text-black">
                        {m.nihan.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= PAGE 5: CHAPTER IV - VISUAL MEMORIES ================= */}
          {samplePhotos.length > 0 && (
            <div className="keepsake-page space-y-8 pt-4">
              <div className="border-b border-[#21262d] pb-3 print:border-black">
                <span className="text-xs font-mono text-rose-400 uppercase tracking-wider print:text-gray-700">
                  Chapter IV
                </span>
                <h3 className="text-2xl font-editorial font-semibold text-white print:text-black">
                  Visual Keepsakes & Polaroids
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {samplePhotos.map((photo, i) => (
                  <div
                    key={i}
                    className="keepsake-card p-2.5 pb-4 bg-white rounded shadow-sm text-center space-y-2 border border-gray-200"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden rounded-sm">
                      <img
                        src={resolveDataUrl(photo.uri || '')}
                        alt={photo.filename || 'Memory'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-black font-editorial">
                      <p className="text-[11px] font-bold text-gray-900 truncate">
                        {photo.date}
                      </p>
                      <p className="text-[9px] font-mono text-gray-600">
                        from {photo.sender === 'SUMAIYA' ? 'Sumaiya' : photo.sender === 'NIHAN' ? 'Nihan' : photo.sender}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Epilogue */}
              <div className="text-center pt-8 border-t border-[#21262d] print:border-gray-400 space-y-2">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500 mx-auto animate-pulse print:text-black" />
                <h4 className="font-editorial italic text-lg text-white print:text-black">
                  To be continued...
                </h4>
                <p className="text-xs font-mono text-[#8b949e] print:text-gray-600">
                  Archived with love • Forever preserved
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
