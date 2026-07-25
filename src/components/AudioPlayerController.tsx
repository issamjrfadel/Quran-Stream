import React, { useEffect, useRef } from 'react';
import { Surah, Reciter, RepeatMode } from '../types';
import { getSurahAudioUrl } from '../data/quranData';
import { getOfflineSurahBlobUrl } from '../lib/offlineStorage';

interface AudioPlayerControllerProps {
  currentSurah: Surah;
  currentReciter: Reciter;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  simulatedOfflineMode: boolean;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onEnded: () => void;
  onError: (msg: string) => void;
  onPlayPauseToggle: () => void;
  onNextSurah: () => void;
  onPrevSurah: () => void;
}

export const AudioPlayerController: React.FC<AudioPlayerControllerProps> = ({
  currentSurah,
  currentReciter,
  isPlaying,
  playbackRate,
  volume,
  isMuted,
  repeatMode,
  simulatedOfflineMode,
  onTimeUpdate,
  onEnded,
  onError,
  onPlayPauseToggle,
  onNextSurah,
  onPrevSurah,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load audio source whenever Surah, Reciter, or Offline mode changes
  useEffect(() => {
    let activeBlobUrl: string | null = null;

    const setupAudioSource = async () => {
      if (!audioRef.current) return;

      // 1. Check if downloaded locally for offline playback
      const offlineBlobUrl = await getOfflineSurahBlobUrl(currentSurah.id, currentReciter.id);

      if (offlineBlobUrl) {
        activeBlobUrl = offlineBlobUrl;
        audioRef.current.src = offlineBlobUrl;
      } else if (simulatedOfflineMode) {
        // Driver activated offline test mode, but this Surah isn't downloaded yet
        audioRef.current.pause();
        onError(`Offline Test Active: Surah #${currentSurah.id} (${currentSurah.englishName}) is not saved offline. Please download it first or turn off Offline Simulation.`);
        return;
      } else {
        // Stream from online CDN
        const onlineUrl = getSurahAudioUrl(currentSurah.id, currentReciter);
        audioRef.current.src = onlineUrl;
      }

      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Playback interrupted or blocked:', err);
        });
      }
    };

    setupAudioSource();

    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [currentSurah.id, currentReciter.id, simulatedOfflineMode]);

  // Handle Play/Pause toggle
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio play request failed:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle Playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle Volume & Mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Register Android Auto / Car Bluetooth Hardware MediaSession controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${currentSurah.id}. ${currentSurah.englishName} (${currentSurah.name})`,
        artist: currentReciter.name,
        album: 'Quran Auto Stream',
        artwork: [
          { src: currentReciter.photoUrl, sizes: '300x300', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => onPlayPauseToggle());
      navigator.mediaSession.setActionHandler('pause', () => onPlayPauseToggle());
      navigator.mediaSession.setActionHandler('previoustrack', () => onPrevSurah());
      navigator.mediaSession.setActionHandler('nexttrack', () => onNextSurah());
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 15);
      });
    }
  }, [currentSurah, currentReciter, onPlayPauseToggle, onNextSurah, onPrevSurah]);

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={() => {
        if (audioRef.current) {
          onTimeUpdate(audioRef.current.currentTime, audioRef.current.duration || 0);
        }
      }}
      onEnded={() => {
        if (repeatMode === 'one' && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else {
          onEnded();
        }
      }}
      onError={() => {
        onError(`Audio playback error for Surah ${currentSurah.englishName}. Check network connection or offline download.`);
      }}
      className="hidden"
    />
  );
};
