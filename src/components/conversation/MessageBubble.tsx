import React, { useState } from 'react';
import {
  ExternalLink,
  PhoneCall,
  PhoneMissed,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Message } from '../../types/archive';
import { VoiceNotePlayer } from '../ui/VoiceNotePlayer';
import { PhotoLightbox } from '../ui/PhotoLightbox';
import { resolveDataUrl } from '../../lib/data';

const InstagramIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

interface MessageBubbleProps {
  message: Message;
  isHighlighted?: boolean;
  isGroupedWithPrevious?: boolean;
  isGroupedWithNext?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isHighlighted = false,
  isGroupedWithPrevious = false,
  isGroupedWithNext = false,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const isNila = message.sender === 'NILU';

  // Detect standalone emoji messages (e.g. 🐵, 🥺😍, ❤️, etc.)
  const isEmojiOnly = React.useMemo(() => {
    if (!message.content || message.type !== 'text') return false;
    const trimmed = message.content.replace(' (edited)', '').trim();
    if (!trimmed || trimmed.length > 20) return false;
    const stripped = trimmed.replace(
      /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\u200D\uFE0F\s]/gu,
      ''
    );
    return stripped.length === 0;
  }, [message.content, message.type]);

  return (
    <div
      id={message.id}
      className={`group w-full flex flex-col transition-all duration-200 ${
        isNila ? 'items-start' : 'items-end'
      } ${isGroupedWithPrevious ? 'mt-1' : 'mt-3 sm:mt-4'} ${
        isGroupedWithNext
          ? message.reactions?.length
            ? 'mb-3 sm:mb-3.5'
            : 'mb-0.5'
          : message.reactions?.length
          ? 'mb-4 sm:mb-4.5'
          : 'mb-2 sm:mb-2.5'
      } ${
        isHighlighted
          ? 'bg-rose-500/15 p-2 rounded-2xl ring-2 ring-rose-500/60 shadow-lg'
          : ''
      }`}
    >
      {/* Sender name label (only if not grouped with previous) */}
      {!isGroupedWithPrevious && (
        <div
          className={`flex items-center gap-1.5 text-xs text-[#8b949e] font-mono px-2 mb-1 ${
            isNila ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          <span
            className={`font-semibold tracking-wide ${
              isNila ? 'text-rose-400' : 'text-sky-400'
            }`}
          >
            {message.senderDisplay}
          </span>
          <span>•</span>
          <span className="text-[11px]">{message.time}</span>
          {message.isEdited && (
            <span className="text-[10px] text-[#8b949e] italic">(edited)</span>
          )}
        </div>
      )}

      {/* Main Bubble Container */}
      <div
        className={`relative transition-all ${
          isEmojiOnly
            ? 'p-1 select-text'
            : `min-w-[68px] sm:min-w-[76px] max-w-[85%] sm:max-w-[78%] px-4 py-2.5 sm:px-5 sm:py-3 shadow-md text-[15px] sm:text-[16px] leading-[1.55] ${
                isNila
                  ? `bg-[#181a20] border border-[#282f3a] text-[#f0f6fc] ${
                      isGroupedWithPrevious ? 'rounded-tl-sm' : 'rounded-tl-2xl'
                    } ${isGroupedWithNext ? 'rounded-bl-sm' : 'rounded-bl-2xl'} rounded-tr-2xl rounded-br-2xl`
                  : `bg-[#132030] border border-[#1e3857] text-[#f0f6fc] ${
                      isGroupedWithPrevious ? 'rounded-tr-sm' : 'rounded-tr-2xl'
                    } ${isGroupedWithNext ? 'rounded-br-sm' : 'rounded-br-2xl'} rounded-tl-2xl rounded-bl-2xl`
              }`
        }`}
      >
        {/* Rich Instagram Share Card */}
        {message.type === 'share' && (
          <div className="mb-2 p-3 rounded-xl bg-gradient-to-br from-[#1c1824] to-[#12161f] border border-rose-500/20 space-y-2 group/share hover:border-rose-500/40 transition-colors">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] uppercase tracking-wider text-[10px]">
                <InstagramIcon />
                Instagram {message.shareType || 'Share'}
              </span>
              {message.shareLink && (
                <a
                  href={message.shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {message.shareText && (
              <p className="text-xs text-[#c9d1d9] italic line-clamp-3 bg-black/30 p-2 rounded-lg border border-white/5">
                "{message.shareText}"
              </p>
            )}
          </div>
        )}

        {/* Media: Photo with Lightbox */}
        {message.type === 'photo' && message.media?.[0]?.uri && (
          <div className="mb-2">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative rounded-xl overflow-hidden border border-[#21262d] max-h-80 cursor-pointer group/photo bg-[#0b0d10]"
            >
              <img
                src={resolveDataUrl(message.media[0].uri)}
                alt={message.media[0].filename || 'Shared photo'}
                className="w-full h-auto object-cover max-h-80 rounded-xl group-hover/photo:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/10">
                  Tap to expand
                </span>
              </div>
            </div>
            {isLightboxOpen && (
              <PhotoLightbox
                src={resolveDataUrl(message.media[0].uri)}
                filename={message.media[0].filename}
                senderDisplay={message.senderDisplay}
                date={message.date}
                time={message.time}
                onClose={() => setIsLightboxOpen(false)}
              />
            )}
          </div>
        )}

        {/* Media: Video */}
        {message.type === 'video' && message.media?.[0]?.uri && (
          <div className="mb-2 rounded-xl overflow-hidden border border-[#21262d] bg-[#0b0d10]">
            <video
              src={resolveDataUrl(message.media[0].uri)}
              controls
              preload="metadata"
              className="w-full max-h-72 rounded-xl object-contain"
            />
          </div>
        )}

        {/* Media: Audio Voice Note */}
        {message.type === 'audio' && message.media?.[0]?.uri && (
          <div className="mb-1">
            <VoiceNotePlayer
              src={resolveDataUrl(message.media[0].uri)}
              senderDisplay={message.senderDisplay}
              filename={message.media[0].filename}
              date={message.date}
              time={message.time}
              messageId={message.id}
            />
          </div>
        )}

        {/* Call Event */}
        {message.type === 'call' && (
          <div className="flex items-center gap-2 text-xs py-1 text-amber-400/95 font-mono">
            {message.callDuration && message.callDuration > 0 ? (
              <>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>
                  Call ended • {Math.round(message.callDuration / 60)}m {message.callDuration % 60}s
                </span>
              </>
            ) : (
              <>
                <PhoneMissed className="w-4 h-4 text-rose-400" />
                <span>Missed audio/video call</span>
              </>
            )}
          </div>
        )}

        {/* Media: Generic File */}
        {message.type === 'file' && (
          <div className="mb-2 p-2.5 rounded-xl bg-[#0b0d10]/60 border border-[#21262d] flex items-center gap-2 text-xs text-[#8b949e]">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="truncate">{message.media?.[0]?.filename || 'File attachment'}</span>
          </div>
        )}

        {/* Message Text Content */}
        {message.content &&
          message.content !== 'NILU sent an attachment.' &&
          message.content !== 'farhannn sent an attachment.' && (
            <div
              className={`selection:bg-rose-500/30 ${
                isEmojiOnly
                  ? 'text-3xl sm:text-4xl py-1 leading-none select-text'
                  : 'whitespace-pre-wrap break-words'
              }`}
            >
              {message.content.replace(' (edited)', '')}
            </div>
          )}

        {/* Floating Reactions Pill with Spring Physics */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute ${
              isEmojiOnly ? '-bottom-4' : '-bottom-3'
            } ${
              isNila ? 'left-2' : 'right-2'
            } flex items-center gap-1.5 bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] rounded-full px-2.5 py-0.5 shadow-lg z-10`}
          >
            {message.reactions.map((r, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.35, rotate: [-5, 5, 0] }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="text-xs sm:text-sm cursor-pointer select-none"
                title={`${r.actorDisplay} reacted with ${r.reaction}`}
              >
                {r.reaction}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Subtle timestamp on end of cluster or when not grouped */}
      {isGroupedWithNext === false && isGroupedWithPrevious && (
        <span
          className={`text-[10px] font-mono text-[#8b949e]/80 px-2 mt-0.5 ${
            isNila ? 'text-left' : 'text-right'
          }`}
        >
          {message.time}
        </span>
      )}
    </div>
  );
};
