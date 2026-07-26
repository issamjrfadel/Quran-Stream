import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, X, Shield, Volume2 } from 'lucide-react';
import { Surah, Reciter } from '../types';

interface CarHudModeViewProps {
  surah: Surah;
  reciter: Reciter;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSkipSeconds: (secs: number) => void;
  onNextSurah: () => void;
  onPrevSurah: () => void;
  onExitHud: () => void;
}

export const CarHudModeView: React.FC<CarHudModeViewProps> = ({
  surah,
  reciter,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSkipSeconds,
  onNextSurah,
  onPrevSurah,
  onExitHud,
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 md:p-10 safe-py safe-px select-none animate-fadeIn">
      {/* Top Bar: HUD Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-500 font-mono font-bold tracking-widest text-sm uppercase">
            CAR HUD DRIVE MODE
          </span>
        </div>

        <button
          onClick={onExitHud}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 border border-stone-700 hover:bg-stone-800 font-extrabold text-sm text-stone-200 transition-all active:scale-95 touch-manipulation min-h-[48px]"
        >
          <X className="w-5 h-5" />
          <span>Exit HUD</span>
        </button>
      </div>

      {/* Middle: Giant High-Contrast Display */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 my-4">
        {/* Arabic Calligraphy & Surah Title */}
        <div className="space-y-2">
          <p className="text-emerald-400 text-3xl font-extrabold tracking-wider font-mono">
            Surah #{surah.id}
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            {surah.englishName}
          </h1>
          <p className="text-4xl md:text-5xl font-serif text-emerald-400 my-2">{surah.name}</p>
          <p className="text-lg md:text-xl text-stone-400 font-semibold">{reciter.name}</p>
        </div>

        {/* Time Progress */}
        <div className="font-mono text-2xl md:text-3xl font-bold tracking-widest text-emerald-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* GIANT Play/Pause Button (112px+) */}
        <div className="flex items-center justify-center gap-6 md:gap-12 pt-4">
          <button
            onClick={onPrevSurah}
            className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-stone-900 border-2 border-stone-700 text-stone-200 flex items-center justify-center active:scale-90 transition-all shadow-xl"
            title="Previous Surah"
          >
            <SkipBack className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <button
            onClick={() => onSkipSeconds(-15)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 flex items-center justify-center active:scale-90 transition-all"
            title="Rewind 15s"
          >
            <RotateCcw className="w-7 h-7" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-14 h-14 md:w-18 md:h-18 fill-current" />
            ) : (
              <Play className="w-14 h-14 md:w-18 md:h-18 fill-current ml-2" />
            )}
          </button>

          <button
            onClick={() => onSkipSeconds(15)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 flex items-center justify-center active:scale-90 transition-all"
            title="Forward 15s"
          >
            <RotateCw className="w-7 h-7" />
          </button>

          <button
            onClick={onNextSurah}
            className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-stone-900 border-2 border-stone-700 text-stone-200 flex items-center justify-center active:scale-90 transition-all shadow-xl"
            title="Next Surah"
          >
            <SkipForward className="w-8 h-8 md:w-10 md:h-10" />
          </button>
        </div>
      </div>

      {/* Bottom Safety Bar */}
      <div className="flex items-center justify-between border-t border-stone-800 pt-4 text-xs font-semibold text-stone-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Driver Focused Minimal Mode</span>
        </div>
        <span>Tap anywhere to control playback</span>
      </div>
    </div>
  );
};
