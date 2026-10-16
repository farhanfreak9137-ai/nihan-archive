import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink } from 'lucide-react';

interface PhotoLightboxProps {
  src: string;
  filename?: string;
  senderDisplay?: string;
  date?: string;
  time?: string;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  src,
  filename,
  senderDisplay,
  date,
  time,
  onClose,
}) => {
  // Handle escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-4 select-none touch-none animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[95vh] flex flex-col items-center gap-2"
      >
        {/* Top Floating Controls */}
        <div className="w-full flex items-center justify-between px-1 text-xs text-[#8b949e] font-mono">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            {senderDisplay && (
              <span
                className={`font-semibold shrink-0 ${
                  senderDisplay === 'SUMAIYA' ? 'text-rose-400' : 'text-sky-400'
                }`}
              >
                {senderDisplay}
              </span>
            )}
            {date && <span className="truncate">• {date}</span>}
            {time && <span className="hidden sm:inline">• {time}</span>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={src}
              download={filename || 'photo.jpg'}
              className="p-2 sm:p-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 sm:p-1.5 rounded-xl bg-[#161b22] hover:bg-rose-500 hover:text-white text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Image Container */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-[#21262d] max-h-[82vh] sm:max-h-[85vh] flex items-center justify-center bg-[#0b0d10]">
          <img
            src={src}
            alt={filename || 'Photo'}
            className="max-h-[82vh] sm:max-h-[85vh] max-w-full object-contain rounded-xl"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
