import React, { useMemo } from 'react';
import { Play, Pause, Star } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface VoiceNotePlayerProps {
  src: string;
  senderDisplay: 'NILA' | 'FARHAN';
  filename?: string;
  date?: string;
  time?: string;
  messageId?: string;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  src,
  senderDisplay,
  filename,
  date,
  time,
  messageId,
}) => {
  const {
    currentTrack,
    isPlaying: globalIsPlaying,
    currentTime: globalCurrentTime,
    duration: globalDuration,
    playbackRate: globalPlaybackRate,
    playTrack,
    togglePlay,
    seek,
    setSpeed,
    isBookmarked,
    toggleBookmark,
  } = useAudioPlayer();

  const isCurrent = currentTrack?.uri === src;
  const isPlaying = isCurrent && globalIsPlaying;
  const currentTime = isCurrent ? globalCurrentTime : 0;
  const duration = isCurrent ? globalDuration : 0;
  const playbackRate = isCurrent ? globalPlaybackRate : 1;

  const isNila = senderDisplay === 'NILA';
  const bookmarked = isBookmarked(src);

  // Generate deterministic realistic audio waveform bars from filename/src hash
  const waveformBars = useMemo(() => {
    const seedStr = filename || src || 'audiotrack';
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const count = 30;
    const bars: number[] = [];
    for (let i = 0; i < count; i++) {
      const pseudo = Math.abs(Math.sin(hash + i * 1.7) * 10000);
      const val = (pseudo % 18) + 6; // height between 6px and 24px
      bars.push(Math.round(val));
    }
    return bars;
  }, [filename, src]);

  const handleToggle = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack({
        uri: src,
        senderDisplay,
        filename,
        date,
        time,
        messageId,
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCurrent) {
      playTrack({
        uri: src,
        senderDisplay,
        filename,
        date,
        time,
        messageId,
      });
      return;
    }
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    seek(fraction * duration);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCurrent) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setSpeed(speeds[nextIdx]);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0b0d10]/85 border border-[#21262d] space-y-2 min-w-[240px] sm:min-w-[290px] shadow-sm">
      {/* Controls Bar */}
      <div className="flex items-center gap-2.5">
        {/* Play/Pause Button */}
        <button
          onClick={handleToggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 shadow-md active:scale-95 ${
            isNila
              ? 'bg-gradient-to-tr from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white'
              : 'bg-gradient-to-tr from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-black'
          }`}
          title={isPlaying ? 'Pause' : 'Play voice message'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Interactive Dynamic SVG Waveform */}
        <div
          onClick={handleSeek}
          className="flex-1 flex items-center gap-[2px] h-8 cursor-pointer group py-1 select-none"
          title="Click to seek"
        >
          {waveformBars.map((h, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isPassed = progressPercent >= barProgress;
            // Add subtle oscillation when actively playing
            const currentHeight = isPlaying
              ? Math.max(4, Math.min(26, h + Math.sin(currentTime * 8 + idx) * 4))
              : h;

            return (
              <div
                key={idx}
                style={{
                  height: `${currentHeight}px`,
                }}
                className={`flex-1 rounded-full transition-all duration-100 ${
                  isPassed
                    ? isNila
                      ? 'bg-rose-500'
                      : 'bg-sky-400'
                    : 'bg-[#262c36] group-hover:bg-[#38414f]'
                }`}
              />
            );
          })}
        </div>

        {/* Action Controls: Bookmark & Speed */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(src);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked
                ? 'text-amber-400 bg-amber-400/15 border border-amber-400/30'
                : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
            }`}
            title={bookmarked ? 'Remove from audio keepsakes' : 'Save to audio keepsakes'}
          >
            <Star className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={cycleSpeed}
            className="text-[10px] font-mono px-1.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d] transition-colors"
            title="Change playback speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Elapsed / Duration Time & Audio Metadata */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#8b949e] px-1">
        <span>{formatTime(currentTime)}</span>
        <span className="truncate max-w-[170px] text-right">
          {duration > 0 ? formatTime(duration) : filename || 'Voice note'}
        </span>
      </div>
    </div>
  );
};
