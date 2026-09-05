import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  X,
  MessageSquare,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

export const StickyAudioDock: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    playlist,
    playlistIndex,
    togglePlay,
    seek,
    skip,
    setSpeed,
    playNext,
    playPrevious,
    closePlayer,
    onJumpToMessage,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const isNila = currentTrack.senderDisplay === 'NILA';

  const formatSecs = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setSpeed(speeds[nextIdx]);
  };

  const handleJump = () => {
    if (onJumpToMessage && currentTrack.date && currentTrack.messageId) {
      onJumpToMessage(currentTrack.date, currentTrack.messageId);
    }
  };

  return (
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px)+8px)] sm:bottom-6 inset-x-2.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 sm:w-[540px] max-w-xl transition-all duration-300 animate-fade-in-opacity">
      <div className="relative rounded-2xl glass-panel p-3 sm:p-3.5 shadow-2xl border border-white/10 flex flex-col gap-2">
        {/* Glow ambient background tint */}
        <div
          className={`absolute -inset-0.5 rounded-2xl blur-xl opacity-30 -z-10 ${
            isNila ? 'bg-rose-500' : 'bg-sky-500'
          }`}
        />

        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Sender Badge */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wide shrink-0 ${
                isNila
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}
            >
              {currentTrack.senderDisplay}
            </span>

            {/* Track Info & Date */}
            <div className="min-w-0 flex items-center gap-1.5 text-xs truncate">
              <span className="text-white font-medium truncate max-w-[130px] sm:max-w-[240px]">
                {currentTrack.filename || 'Voice Note'}
              </span>
              {currentTrack.date && (
                <span className="text-[10px] sm:text-[11px] font-mono text-[#8b949e] shrink-0">
                  • {currentTrack.date}
                </span>
              )}
            </div>
          </div>

          {/* Actions: Jump to chat & Close */}
          <div className="flex items-center gap-1 shrink-0">
            {currentTrack.date && currentTrack.messageId && (
              <button
                onClick={handleJump}
                title="View in conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}

            <button
              onClick={closePlayer}
              title="Close player"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#8b949e] hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrubbable Waveform & Progress Bar */}
        <div className="space-y-1">
          <div className="relative flex items-center group/scrubber cursor-pointer">
            {/* Audio Waveform Graphic */}
            <div className="absolute inset-0 flex items-center justify-between px-1 opacity-20 pointer-events-none">
              {Array.from({ length: 32 }).map((_, i) => {
                const height = 20 + Math.sin(i * 0.7) * 40 + (i % 3) * 15;
                const isPassed = (i / 32) * 100 <= progressPercent;
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`w-[2px] rounded-full transition-all ${
                      isPassed
                        ? isNila
                          ? 'bg-rose-400 opacity-90'
                          : 'bg-sky-400 opacity-90'
                        : 'bg-slate-400'
                    }`}
                  />
                );
              })}
            </div>

            {/* Interactive Slider Input */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-4 bg-transparent appearance-none cursor-pointer relative z-10 accent-rose-500"
            />
          </div>

          {/* Time & Progress Info */}
          <div className="flex justify-between items-center text-[10px] font-mono text-[#8b949e] px-0.5">
            <span>{formatSecs(currentTime)}</span>
            {playlist.length > 1 && (
              <span className="text-[9px] text-slate-400 font-mono">
                Track {playlistIndex + 1} of {playlist.length}
              </span>
            )}
            <span>{formatSecs(duration)}</span>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between pt-0.5">
          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 transition-colors"
          >
            {playbackRate}x
          </button>

          {/* Main Controls: Previous, Skip -5s, Play/Pause, Skip +5s, Next */}
          <div className="flex items-center gap-2 sm:gap-3">
            {playlist.length > 1 && (
              <button
                onClick={playPrevious}
                disabled={playlistIndex <= 0}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => skip(-5)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Rewind 5s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isNila
                  ? 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white'
                  : 'bg-gradient-to-tr from-sky-600 to-cyan-500 text-white'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(5)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Forward 5s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {playlist.length > 1 && (
              <button
                onClick={playNext}
                disabled={playlistIndex >= playlist.length - 1}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Soundwave Animation Graphic */}
          <div className="flex items-center gap-0.5 h-4 px-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-[2px] rounded-full transition-all duration-300 ${
                  isNila ? 'bg-rose-400' : 'bg-sky-400'
                } ${isPlaying ? 'animate-pulse' : 'h-1 opacity-30'}`}
                style={{
                  height: isPlaying ? `${8 + (i % 3) * 6}px` : '4px',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
