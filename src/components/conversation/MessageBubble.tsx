import React, { useState } from 'react';
import {
  ExternalLink,
  Film,
  PhoneCall,
  PhoneMissed,
  FileText,
} from 'lucide-react';
import { Message } from '../../types/archive';
import { VoiceNotePlayer } from '../ui/VoiceNotePlayer';
import { PhotoLightbox } from '../ui/PhotoLightbox';

interface MessageBubbleProps {
  message: Message;
  isHighlighted?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isHighlighted = false,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const isNila = message.sender === 'NILU';

  return (
    <div
      id={message.id}
      className={`group w-full flex flex-col my-1.5 transition-all duration-300 ${
        isNila ? 'items-start' : 'items-end'
      } ${isHighlighted ? 'bg-rose-500/10 p-2 rounded-2xl ring-2 ring-rose-500/50' : ''}`}
    >
      {/* Sender name label & timestamp for groups */}
      <div
        className={`flex items-center gap-1.5 text-[10px] text-[#8b949e] font-mono px-2 mb-1 ${
          isNila ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        <span
          className={`font-semibold ${
            isNila ? 'text-rose-400' : 'text-sky-400'
          }`}
        >
          {message.senderDisplay}
        </span>
        <span>•</span>
        <span>{message.time}</span>
        {message.isEdited && (
          <span className="text-[9px] text-[#8b949e] italic">(edited)</span>
        )}
      </div>

      {/* Main Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed transition-all ${
          isNila
            ? 'bg-[#181a20] border border-[#262c36] text-[#f0f6fc] rounded-tl-sm'
            : 'bg-[#15202b] border border-[#1e3246] text-[#f0f6fc] rounded-tr-sm'
        }`}
      >
        {/* Share: Reel / Post / Story */}
        {message.type === 'share' && (
          <div className="mb-2 p-2.5 rounded-xl bg-[#0b0d10]/70 border border-[#21262d] space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-rose-400 uppercase tracking-wider text-[10px]">
                <Film className="w-3.5 h-3.5" />
                Instagram {message.shareType || 'Share'}
              </span>
              {message.shareLink && (
                <a
                  href={message.shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline"
                >
                  <span>Open link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {message.shareText && (
              <p className="text-xs text-[#8b949e] italic line-clamp-3">
                "{message.shareText}"
              </p>
            )}
          </div>
        )}

        {/* Media: Photo */}
        {message.type === 'photo' && message.media?.[0]?.uri && (
          <div className="mb-2">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative rounded-xl overflow-hidden border border-[#21262d] max-h-72 cursor-pointer group bg-[#0b0d10]"
            >
              <img
                src={message.media[0].uri}
                alt={message.media[0].filename || 'Shared photo'}
                className="w-full h-auto object-cover max-h-72 rounded-xl group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs font-mono px-2 py-1 rounded bg-black/60 text-white backdrop-blur-sm">
                  Click to expand
                </span>
              </div>
            </div>
            {isLightboxOpen && (
              <PhotoLightbox
                src={message.media[0].uri}
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
              src={message.media[0].uri}
              controls
              preload="metadata"
              className="w-full max-h-64 rounded-xl object-contain"
            />
          </div>
        )}

        {/* Media: Audio Voice Note */}
        {message.type === 'audio' && message.media?.[0]?.uri && (
          <div className="mb-2">
            <VoiceNotePlayer
              src={message.media[0].uri}
              senderDisplay={message.senderDisplay}
              filename={message.media[0].filename}
            />
          </div>
        )}

        {/* Call Event */}
        {message.type === 'call' && (
          <div className="flex items-center gap-2 text-xs py-1 text-amber-400/90 font-mono">
            {message.callDuration && message.callDuration > 0 ? (
              <>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call ended • {Math.round(message.callDuration / 60)}m {message.callDuration % 60}s</span>
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
            <p className="whitespace-pre-wrap break-words selection:bg-rose-500/30">
              {message.content.replace(' (edited)', '')}
            </p>
          )}

        {/* Floating Reactions Pill */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-2.5 ${
              isNila ? 'left-2' : 'right-2'
            } flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-full px-2 py-0.5 shadow-md`}
          >
            {message.reactions.map((r, i) => (
              <span
                key={i}
                className="text-xs flex items-center gap-1 cursor-default"
                title={`${r.actorDisplay} reacted with ${r.reaction}`}
              >
                <span>{r.reaction}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
