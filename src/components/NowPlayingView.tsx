import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Repeat1,
  Download,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  User,
  Info,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Surah, Reciter, RepeatMode } from '../types';

interface NowPlayingViewProps {
  surah: Surah;
  reciter: Reciter;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  sleepTimerMinutes: number | null;
  isDownloaded: boolean;
  downloadProgress: number | null;
  isDayMode: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onSkipSeconds: (seconds: number) => void;
  onNextSurah: () => void;
  onPrevSurah: () => void;
  onChangePlaybackRate: (rate: number) => void;
  onChangeRepeatMode: () => void;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  onDownloadSurah: () => void;
  onOpenReciterSelector: () => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onOpenVoiceAssistant: () => void;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  surah,
  reciter,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  volume,
  isMuted,
  repeatMode,
  sleepTimerMinutes,
  isDownloaded,
  downloadProgress,
  isDayMode,
  onPlayPause,
  onSeek,
  onSkipSeconds,
  onNextSurah,
  onPrevSurah,
  onChangePlaybackRate,
  onChangeRepeatMode,
  onToggleMute,
  onChangeVolume,
  onDownloadSurah,
  onOpenReciterSelector,
  onSetSleepTimer,
  onOpenVoiceAssistant,
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="now-playing-container"
      className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full justify-between select-none overflow-y-auto"
    >
      {/* Top Banner: Reciter Info & Quick Action */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={onOpenReciterSelector}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all active:scale-95 touch-manipulation min-h-[48px] ${
            isDayMode
              ? 'bg-stone-200 border-stone-300 hover:bg-stone-300 text-stone-900'
              : 'bg-[#0D1117] border-white/10 hover:bg-white/10 text-stone-100'
          }`}
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500 shadow bg-emerald-950 flex items-center justify-center shrink-0">
            <span className="absolute z-0 font-bold text-xs text-emerald-300/80 pointer-events-none select-none">
              {reciter.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
            <img
              src={reciter.photoUrl}
              alt={reciter.name}
              referrerPolicy="no-referrer"
              className="relative z-10 w-full h-full object-cover bg-emerald-950"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="text-left">
            <p className="text-xs text-stone-400 font-medium">Reciter</p>
            <p className="text-sm font-bold tracking-tight text-emerald-400">{reciter.name}</p>
          </div>
          <User className="w-4 h-4 ml-2 opacity-60" />
        </button>

        {/* Offline Download Badge & Action */}
        <div className="flex items-center gap-2">
          {isDownloaded ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Offline Ready</span>
            </div>
          ) : downloadProgress !== null ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
              <Download className="w-4 h-4 animate-bounce" />
              <span>Downloading {downloadProgress}%</span>
            </div>
          ) : (
            <button
              onClick={onDownloadSurah}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 touch-manipulation min-h-[44px] ${
                isDayMode
                  ? 'bg-stone-200 border-stone-300 text-stone-800 hover:bg-stone-300'
                  : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Save for Offline</span>
            </button>
          )}

          {/* Voice Command Button */}
          <button
            onClick={onOpenVoiceAssistant}
            className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-lg"
            title="Ask Voice Assistant"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Main Calligraphy Card & Surah Title */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 my-2">
        {/* Album Artwork / Arabic Calligraphy Card */}
        <div
          className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-2xl border transition-all ${
            isDayMode
              ? 'bg-gradient-to-br from-stone-200 to-stone-300 border-stone-300 text-stone-900'
              : 'bg-gradient-to-br from-emerald-950/60 via-[#0D1117] to-teal-950/50 border-emerald-500/30 text-stone-100 shadow-emerald-glow'
          }`}
        >
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
            <Layers className="w-3 h-3" />
            <span>Juz {surah.juzNumber}</span>
          </div>

          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30">
            {surah.revelationType}
          </div>

          <span className="text-4xl sm:text-5xl font-extrabold text-emerald-500 my-2 font-serif tracking-widest drop-shadow-md">
            {surah.name}
          </span>

          <p className="text-xl font-bold tracking-tight mt-1">{surah.englishName}</p>
          <p className="text-xs text-stone-400 font-medium tracking-wide">{surah.englishNameTranslation}</p>

          {/* Animated Audio Equalizer Bar when playing */}
          {isPlaying && (
            <div className="absolute bottom-4 flex items-end justify-center gap-1 h-5">
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_300ms] h-3" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms] h-5" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_400ms] h-2" />
            </div>
          )}
        </div>

        {/* Surah Detail & Summary Drawer */}
        <div className="flex-1 text-center md:text-left space-y-3 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Surah #{surah.id} • {surah.numberOfAyahs} Verses</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{surah.englishName}</h2>
          <p className="text-sm opacity-80">{surah.summary}</p>

          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold pt-1"
          >
            <Info className="w-4 h-4" />
            <span>{showSummary ? 'Hide Driver Summary' : 'Read Driver Overview'}</span>
          </button>

          {showSummary && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-stone-300 space-y-1.5 animate-fadeIn">
              <p className="font-semibold text-emerald-400">About {surah.englishName}:</p>
              <p>{surah.summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Controls Section */}
      <div className="space-y-4 pt-4 border-t border-stone-800/40">
        {/* Scrubber Bar */}
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-3 bg-stone-700/60 rounded-lg appearance-none cursor-pointer accent-emerald-500 touch-none"
            />
          </div>
          <div className="flex justify-between text-xs font-mono font-medium text-stone-400 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Giant Play/Pause & Track Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {/* Previous Surah */}
          <button
            id="btn-prev-surah"
            onClick={onPrevSurah}
            className={`p-3 sm:p-4 rounded-2xl border transition-all active:scale-90 min-h-[56px] min-w-[56px] flex items-center justify-center ${
              isDayMode
                ? 'bg-stone-200 border-stone-300 text-stone-800 hover:bg-stone-300'
                : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
            }`}
            title="Previous Surah"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Skip Back 15s */}
          <button
            id="btn-rewind-15s"
            onClick={() => onSkipSeconds(-15)}
            className={`p-3 rounded-2xl transition-all active:scale-90 min-h-[52px] min-w-[52px] flex items-center justify-center ${
              isDayMode ? 'text-stone-700 hover:bg-stone-200' : 'text-stone-300 hover:bg-stone-800'
            }`}
            title="Rewind 15 Seconds"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {/* GIANT Play / Pause Button (72px) */}
          <button
            id="btn-play-pause"
            onClick={onPlayPause}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all active:scale-95 min-h-[72px] min-w-[72px]"
            title={isPlaying ? 'Pause Quran Audio' : 'Play Quran Audio'}
          >
            {isPlaying ? (
              <Pause className="w-9 h-9 fill-current" />
            ) : (
              <Play className="w-9 h-9 fill-current ml-1" />
            )}
          </button>

          {/* Fast Forward 15s */}
          <button
            id="btn-forward-15s"
            onClick={() => onSkipSeconds(15)}
            className={`p-3 rounded-2xl transition-all active:scale-90 min-h-[52px] min-w-[52px] flex items-center justify-center ${
              isDayMode ? 'text-stone-700 hover:bg-stone-200' : 'text-stone-300 hover:bg-stone-800'
            }`}
            title="Forward 15 Seconds"
          >
            <RotateCw className="w-6 h-6" />
          </button>

          {/* Next Surah */}
          <button
            id="btn-next-surah"
            onClick={onNextSurah}
            className={`p-3 sm:p-4 rounded-2xl border transition-all active:scale-90 min-h-[56px] min-w-[56px] flex items-center justify-center ${
              isDayMode
                ? 'bg-stone-200 border-stone-300 text-stone-800 hover:bg-stone-300'
                : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
            }`}
            title="Next Surah"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Secondary Driver Controls: Repeat, Sleep Timer, Volume */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/30">
          {/* Repeat Mode Toggle */}
          <button
            onClick={onChangeRepeatMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all min-h-[38px] ${
              repeatMode !== 'none'
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                : isDayMode
                ? 'bg-stone-200 text-stone-700 border-stone-300'
                : 'bg-stone-800 text-stone-300 border-stone-700'
            }`}
            title="Toggle Repeat Mode"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            <span className="capitalize">{repeatMode === 'none' ? 'No Repeat' : repeatMode}</span>
          </button>

          {/* Sleep Timer button & menu */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all min-h-[38px] ${
                sleepTimerMinutes
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : isDayMode
                  ? 'bg-stone-200 text-stone-700 border-stone-300'
                  : 'bg-stone-800 text-stone-300 border-stone-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{sleepTimerMinutes ? `${sleepTimerMinutes}m Timer` : 'Sleep Timer'}</span>
            </button>

            {showSleepMenu && (
              <div className="absolute right-0 bottom-12 w-44 p-2 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl z-50 text-xs space-y-1">
                <p className="px-2 py-1 text-stone-400 font-bold border-b border-stone-800">Set Sleep Timer</p>
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      onSetSleepTimer(mins);
                      setShowSleepMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-800 text-stone-200 font-medium"
                  >
                    {mins} Minutes
                  </button>
                ))}
                {sleepTimerMinutes && (
                  <button
                    onClick={() => {
                      onSetSleepTimer(null);
                      setShowSleepMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-900/30 text-red-400 font-bold"
                  >
                    Turn Off Timer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mute / Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-2 text-stone-400 hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-20 h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
