import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface PhotoLightboxProps {
  src: string;
  filename?: string;
  senderDisplay?: 'NILA' | 'FARHAN';
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
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
      >
        {/* Top Floating Controls */}
        <div className="w-full flex items-center justify-between pb-3 text-xs text-[#8b949e] font-mono">
          <div className="flex items-center gap-2">
            {senderDisplay && (
              <span
                className={`font-semibold ${
                  senderDisplay === 'NILA' ? 'text-rose-400' : 'text-sky-400'
                }`}
              >
                {senderDisplay}
              </span>
            )}
            {date && <span>• {date}</span>}
            {time && <span>{time}</span>}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={src}
              download={filename || 'photo.jpg'}
              className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-white transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-white transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#161b22] hover:bg-rose-500 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Image */}
        <div className="relative rounded-2xl overflow-hidden border border-[#21262d] max-h-[80vh] flex items-center justify-center bg-[#0b0d10]">
          <img
            src={src}
            alt={filename || 'Photo'}
            className="max-h-[80vh] max-w-full object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};
