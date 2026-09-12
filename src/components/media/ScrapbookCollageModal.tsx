import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Shuffle,
  Image as ImageIcon,
  Camera,
  Check,
  Loader2,
} from 'lucide-react';
import { MediaRecord } from '../../types/archive';
import { resolveDataUrl } from '../../lib/data';

interface ScrapbookCollageModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: MediaRecord[];
  onSelectPhoto?: (date: string, messageId: string) => void;
}

export const ScrapbookCollageModal: React.FC<ScrapbookCollageModalProps> = ({
  isOpen,
  onClose,
  photos,
  onSelectPhoto,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | '2026-07' | '2026-08' | '2026-09'>('ALL');
  const [layoutSeed, setLayoutSeed] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Available photos for collage
  const validPhotos = useMemo(() => {
    return photos.filter((p) => p.type === 'photo' && p.uri);
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (selectedMonth === 'ALL') return validPhotos;
    return validPhotos.filter((p) => p.date.startsWith(selectedMonth));
  }, [validPhotos, selectedMonth]);

  // Selected 6 to 8 photos for current scrapbook spread
  const spreadPhotos = useMemo(() => {
    if (filteredPhotos.length === 0) return [];
    // Pseudo-random deterministic selection using layoutSeed
    const shuffled = [...filteredPhotos].sort((a, b) => {
      const hashA = (a.id.charCodeAt(a.id.length - 1) + layoutSeed * 7) % 100;
      const hashB = (b.id.charCodeAt(b.id.length - 1) + layoutSeed * 7) % 100;
      return hashA - hashB;
    });
    return shuffled.slice(0, 6);
  }, [filteredPhotos, layoutSeed]);

  // Fixed tilt angles for realistic organic Polaroid layout
  const tilts = [-4.5, 3.2, -2.8, 4.1, -3.5, 2.7];

  const handleShuffle = () => {
    setLayoutSeed((s) => s + 1);
  };

  // High-Resolution HTML5 Canvas Export
  const handleExportCanvas = async () => {
    if (spreadPhotos.length === 0) return;
    try {
      setIsExporting(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1800;
      const height = 1350;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw vintage textured dark corkboard background
      const bgGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        width / 1.2
      );
      bgGradient.addColorStop(0, '#1c1917');
      bgGradient.addColorStop(1, '#0c0a09');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Header Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NILA & FARHAN • MEMORY SCRAPBOOK', width / 2, 85);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '22px monospace';
      ctx.fillText(
        `COLLECTION: ${selectedMonth === 'ALL' ? 'FULL ARCHIVE' : selectedMonth} • ${spreadPhotos.length} MEMORIES`,
        width / 2,
        125
      );

      // 2. Load and draw each Polaroid
      const cols = 3;
      const cardWidth = 460;
      const cardHeight = 520;
      const startX = 140;
      const startY = 170;
      const gapX = 100;
      const gapY = 80;

      for (let i = 0; i < spreadPhotos.length; i++) {
        const item = spreadPhotos[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (cardWidth + gapX);
        const y = startY + row * (cardHeight + gapY);
        const tilt = (tilts[i % tilts.length] * Math.PI) / 180;

        ctx.save();
        ctx.translate(x + cardWidth / 2, y + cardHeight / 2);
        ctx.rotate(tilt);

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 12;

        // White Polaroid Frame
        ctx.fillStyle = '#fefdfb';
        ctx.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

        // Reset shadow for inner photo
        ctx.shadowColor = 'transparent';

        // Load image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = resolveDataUrl(item.uri || '');

        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
        });

        // Photo cutout inside polaroid
        const photoPad = 22;
        const photoWidth = cardWidth - photoPad * 2;
        const photoHeight = 390;

        ctx.fillStyle = '#111';
        ctx.fillRect(-cardWidth / 2 + photoPad, -cardHeight / 2 + photoPad, photoWidth, photoHeight);

        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(
            img,
            -cardWidth / 2 + photoPad,
            -cardHeight / 2 + photoPad,
            photoWidth,
            photoHeight
          );
        }

        // Handwritten-style Caption & Date at bottom of frame
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${item.date} • ${item.sender === 'NILU' ? 'NILA' : 'FARHAN'}`,
          -cardWidth / 2 + photoPad + 4,
          cardHeight / 2 - 40
        );

        ctx.fillStyle = '#78716c';
        ctx.font = '17px sans-serif';
        const snippet = item.contextSnippet ? `"${item.contextSnippet.slice(0, 36)}..."` : 'Photo keepsake';
        ctx.fillText(snippet, -cardWidth / 2 + photoPad + 4, cardHeight / 2 - 16);

        ctx.restore();
      }

      // 3. Trigger PNG download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Our_Archive_Scrapbook_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export canvas scrapbook:', err);
      alert('Failed to generate image download');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl bg-gradient-to-b from-[#1c1917] via-[#141210] to-[#0b0d10] border border-amber-900/40 shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-editorial text-white font-semibold leading-tight">
                Polaroid Scrapbook Studio
              </h2>
              <p className="text-xs text-[#8b949e] font-sans">
                Curated memory wall • Rendered into downloadable vintage polaroid boards
              </p>
            </div>
          </div>

          {/* Month Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-mono">
            {[
              { id: 'ALL', label: 'All Photos' },
              { id: '2026-07', label: 'July' },
              { id: '2026-08', label: 'August' },
              { id: '2026-09', label: 'September' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id as any)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedMonth === m.id
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors border border-white/10"
              title="Shuffle layout & photos"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>

            <button
              onClick={handleExportCanvas}
              disabled={isExporting || spreadPhotos.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-black font-semibold text-xs font-mono shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Rendering...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Collage</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Scrapbook Board Canvas Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0e0c0a] relative flex justify-center">
          {spreadPhotos.length === 0 ? (
            <div className="py-24 text-center text-[#8b949e]">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No photos found for this month.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl w-full py-4">
              {spreadPhotos.map((photo, i) => {
                const tilt = tilts[i % tilts.length];
                const isNila = photo.sender === 'NILU';

                return (
                  <div
                    key={`${photo.id}_${layoutSeed}`}
                    style={{ transform: `rotate(${tilt}deg)` }}
                    onClick={() => {
                      if (onSelectPhoto) {
                        onClose();
                        onSelectPhoto(photo.date, photo.messageId);
                      }
                    }}
                    className="group relative cursor-pointer polaroid-card p-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 select-none bg-[#fefdfb]"
                  >
                    {/* Fake tape sticker on top */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/70 backdrop-blur-sm border border-black/5 shadow-sm transform -rotate-1 rounded-sm pointer-events-none z-10" />

                    {/* Photo Container */}
                    <div className="relative rounded overflow-hidden aspect-[4/3] bg-[#1a1a1a]">
                      <img
                        src={resolveDataUrl(photo.uri || '')}
                        alt={photo.filename || 'Scrapbook photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Bottom Polaroid Caption Label */}
                    <div className="pt-3 pb-1 px-1 flex flex-col justify-between min-h-[58px]">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-tight text-neutral-800">
                        <span>{photo.date}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${isNila ? 'text-rose-600 bg-rose-50' : 'text-sky-600 bg-sky-50'}`}>
                          {isNila ? 'NILA' : 'FARHAN'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 truncate italic font-sans">
                        {photo.contextSnippet ? `"${photo.contextSnippet}"` : 'Captured in conversation'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
