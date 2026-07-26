import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Moon, Sun, Mic, Gauge, HardDrive, AlertTriangle, Languages, Eye } from 'lucide-react';
import { TRANSLATIONS, Language } from '../lib/translations';

interface AndroidAutoHeaderProps {
  isDayMode: boolean;
  onToggleDayMode: () => void;
  isAutoLightSensor: boolean;
  onToggleAutoLightSensor: () => void;
  isHudMode: boolean;
  onToggleHudMode: () => void;
  onOpenVoiceAssistant: () => void;
  downloadedCount: number;
  simulatedOfflineMode: boolean;
  onToggleOfflineSim: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const AndroidAutoHeader: React.FC<AndroidAutoHeaderProps> = ({
  isDayMode,
  onToggleDayMode,
  isAutoLightSensor,
  onToggleAutoLightSensor,
  isHudMode,
  onToggleHudMode,
  onOpenVoiceAssistant,
  downloadedCount,
  simulatedOfflineMode,
  onToggleOfflineSim,
  language,
  onToggleLanguage,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="android-auto-header"
      className={`min-h-[4rem] py-2 px-4 md:px-6 safe-pt safe-px flex items-center justify-between border-b transition-colors select-none z-30 ${
        isDayMode
          ? 'bg-stone-100/90 text-stone-900 border-stone-200'
          : 'bg-[#0D1117]/90 text-stone-100 border-white/5 backdrop-blur-md'
      }`}
    >
      {/* Left: Clock & Android Auto Vehicle Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-xl font-bold tracking-tight font-mono">{timeStr}</div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.connected}</span>
        </div>

        {simulatedOfflineMode && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.offlineActive}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Language, Voice Mic, Offline Sim, Day/Night, Auto Sensor, HUD */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Language Switcher */}
        <button
          id="btn-toggle-language"
          onClick={onToggleLanguage}
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] ${
            isDayMode
              ? 'bg-stone-200 text-stone-800 border-stone-300 hover:bg-stone-300'
              : 'bg-stone-800 text-emerald-400 border-stone-700 hover:bg-stone-700'
          }`}
          title="Switch App Language (English / العربية)"
        >
          <Languages className="w-4 h-4" />
          <span className="font-sans">{language === 'en' ? 'عربي' : 'EN'}</span>
        </button>

        {/* Voice Assistant Mic Button */}
        <button
          id="btn-voice-assistant"
          onClick={onOpenVoiceAssistant}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md active:scale-95 touch-manipulation min-h-[44px]"
          title={t.voiceCommand}
        >
          <Mic className="w-4 h-4 animate-bounce" />
          <span className="hidden md:inline font-semibold">{t.voiceCommand}</span>
        </button>

        {/* Offline Sim Toggle */}
        <button
          id="btn-toggle-offline-sim"
          onClick={onToggleOfflineSim}
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[44px] ${
            simulatedOfflineMode
              ? 'bg-amber-600 text-white border-amber-500'
              : isDayMode
              ? 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
              : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
          }`}
          title="Toggle Simulated No-Internet Offline Mode"
        >
          <HardDrive className="w-4 h-4" />
          <span className="hidden lg:inline">{simulatedOfflineMode ? t.offlineActive : t.offlineSim}</span>
          <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px]">{downloadedCount}</span>
        </button>

        {/* Auto Sensor Mode Button */}
        <button
          id="btn-toggle-auto-sensor"
          onClick={onToggleAutoLightSensor}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
            isAutoLightSensor
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
              : isDayMode
              ? 'bg-stone-200 text-stone-600 border-stone-300'
              : 'bg-stone-800 text-stone-400 border-stone-700'
          }`}
          title={t.autoSensorActive}
        >
          <Eye className={`w-3.5 h-3.5 ${isAutoLightSensor ? 'text-emerald-400 animate-pulse' : ''}`} />
          <span className="hidden xl:inline">{t.autoSensor}</span>
          {isAutoLightSensor && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
        </button>

        {/* Manual Day / Night Override Switch */}
        <button
          id="btn-toggle-day-night"
          onClick={onToggleDayMode}
          className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isDayMode
              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              : 'bg-stone-800 text-amber-400 border-stone-700 hover:bg-stone-700'
          }`}
          title={isDayMode ? 'Switch to Night Driving Mode' : 'Switch to Day Driving Mode'}
        >
          {isDayMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* HUD Mode Toggle */}
        <button
          id="btn-toggle-hud"
          onClick={onToggleHudMode}
          className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isHudMode
              ? 'bg-emerald-600 text-white border-emerald-500'
              : isDayMode
              ? 'bg-stone-200 text-stone-800 border-stone-300 hover:bg-stone-300'
              : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
          }`}
          title="Full Screen Driver HUD Gauge Mode"
        >
          <Gauge className="w-5 h-5" />
        </button>

        {/* Car System Indicators */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-stone-700/50 text-stone-400 text-xs">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <Battery className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
