import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { resolveDataUrl } from '../lib/data';

export interface AudioTrack {
  uri: string;
  senderDisplay: string;
  filename?: string;
  date?: string;
  time?: string;
  messageId?: string;
}

interface AudioPlayerContextValue {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  playlist: AudioTrack[];
  playlistIndex: number;
  playTrack: (track: AudioTrack, playlist?: AudioTrack[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skip: (deltaSeconds: number) => void;
  setSpeed: (rate: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  closePlayer: () => void;
  onJumpToMessage?: (date: string, messageId: string) => void;
  setOnJumpToMessage: (fn: (date: string, messageId: string) => void) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onJumpRef = useRef<((date: string, messageId: string) => void) | undefined>(undefined);

  // Initialize global audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-advance if playlist has next track
      setPlaylistIndex((prevIndex) => {
        setPlaylist((currentPlaylist) => {
          if (prevIndex >= 0 && prevIndex + 1 < currentPlaylist.length) {
            const nextTrack = currentPlaylist[prevIndex + 1];
            setCurrentTrack(nextTrack);
            audio.src = resolveDataUrl(nextTrack.uri);
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
            return currentPlaylist;
          }
          return currentPlaylist;
        });
        return prevIndex >= 0 ? prevIndex + 1 : prevIndex;
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const playTrack = useCallback((track: AudioTrack, newPlaylist?: AudioTrack[]) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // If same track is already playing, just resume or pause
    if (currentTrack?.uri === track.uri) {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
      return;
    }

    setCurrentTrack(track);
    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
      const idx = newPlaylist.findIndex((t) => t.uri === track.uri);
      setPlaylistIndex(idx >= 0 ? idx : 0);
    }

    audio.src = resolveDataUrl(track.uri);
    audio.playbackRate = playbackRate;
    audio.play().catch((err) => {
      console.warn('Audio play request interrupted or prevented:', err);
    });
  }, [currentTrack, playbackRate]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack]);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(seconds, duration || 0));
    setCurrentTime(audioRef.current.currentTime);
  }, [duration]);

  const skip = useCallback((deltaSeconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + deltaSeconds, duration || 0));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const playNext = useCallback(() => {
    if (playlistIndex >= 0 && playlistIndex + 1 < playlist.length) {
      const nextTrack = playlist[playlistIndex + 1];
      setPlaylistIndex((i) => i + 1);
      setCurrentTrack(nextTrack);
      if (audioRef.current) {
        audioRef.current.src = resolveDataUrl(nextTrack.uri);
        audioRef.current.play().catch(() => {});
      }
    }
  }, [playlist, playlistIndex]);

  const playPrevious = useCallback(() => {
    if (playlistIndex > 0) {
      const prevTrack = playlist[playlistIndex - 1];
      setPlaylistIndex((i) => i - 1);
      setCurrentTrack(prevTrack);
      if (audioRef.current) {
        audioRef.current.src = resolveDataUrl(prevTrack.uri);
        audioRef.current.play().catch(() => {});
      }
    }
  }, [playlist, playlistIndex]);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const setOnJumpToMessage = useCallback((fn: (date: string, messageId: string) => void) => {
    onJumpRef.current = fn;
  }, []);

  const onJumpToMessage = onJumpRef.current;

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        playlist,
        playlistIndex,
        playTrack,
        togglePlay,
        seek,
        skip,
        setSpeed,
        playNext,
        playPrevious,
        closePlayer,
        onJumpToMessage,
        setOnJumpToMessage,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return ctx;
};
