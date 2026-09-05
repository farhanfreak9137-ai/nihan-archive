import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';

interface VoiceNotePlayerProps {
  src: string;
  senderDisplay: 'NILA' | 'FARHAN';
  filename?: string;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  src,
  senderDisplay,
  filename,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasError, setHasError] = useState(false);

  const isNila = senderDisplay === 'NILA';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => setHasError(true);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Playback prevented:', e);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = fraction * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [1, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Visual wave bars heights
  const waveHeights = [
    6, 12, 18, 10, 22, 14, 8, 16, 24, 18, 12, 20, 16, 10, 14, 22, 8, 16, 12, 6,
  ];

  if (hasError) {
    return (
      <div className="p-2.5 rounded-xl bg-[#0b0d10]/60 border border-[#21262d] flex items-center gap-2 text-xs text-[#8b949e]">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="truncate">{filename || 'Audio file'}</span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl bg-[#0b0d10]/80 border border-[#21262d] space-y-2 min-w-[260px] sm:min-w-[300px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Controls Bar */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 shadow-md ${
            isNila
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-sky-400 hover:bg-sky-500 text-black'
          }`}
          title={isPlaying ? 'Pause' : 'Play voice message'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Interactive Scrubbable Waveform */}
        <div
          onClick={handleSeek}
          className="flex-1 flex items-center gap-0.5 h-7 cursor-pointer group py-1"
          title="Click to seek"
        >
          {waveHeights.map((h, idx) => {
            const barProgress = (idx / waveHeights.length) * 100;
            const isPassed = progressPercent >= barProgress;

            return (
              <div
                key={idx}
                style={{
                  height: `${isPlaying ? Math.max(4, (h * (idx % 2 === 0 ? 1 : 1.3))) : h}px`,
                }}
                className={`flex-1 rounded-full transition-all ${
                  isPassed
                    ? isNila
                      ? 'bg-rose-500'
                      : 'bg-sky-400'
                    : 'bg-[#262c36] group-hover:bg-[#30363d]'
                }`}
              />
            );
          })}
        </div>

        {/* Speed button (1x, 1.5x, 2x) */}
        <button
          onClick={cycleSpeed}
          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d] transition-colors shrink-0"
          title="Change playback speed"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Elapsed / Duration Time */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#8b949e] px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
