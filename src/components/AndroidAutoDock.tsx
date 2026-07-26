import React from 'react';
import { Music, BookOpen, Layers, Users, DownloadCloud, Gauge, Sparkles } from 'lucide-react';
import { TRANSLATIONS, Language } from '../lib/translations';

export type ActiveTab = 'player' | 'surahs' | 'juz' | 'reciters' | 'offline' | 'hud';

interface AndroidAutoDockProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isDayMode: boolean;
  downloadedCount: number;
  currentSurahName?: string;
  isPlaying?: boolean;
  onOpenVoiceModal: () => void;
  language: Language;
}

export const AndroidAutoDock: React.FC<AndroidAutoDockProps> = ({
  activeTab,
  onTabChange,
  isDayMode,
  downloadedCount,
  currentSurahName,
  isPlaying,
  onOpenVoiceModal,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const tabs = [
    { id: 'player', label: t.player, icon: Music, badge: isPlaying ? '●' : undefined },
    { id: 'surahs', label: t.surahs, icon: BookOpen },
    { id: 'juz', label: t.juz, icon: Layers },
    { id: 'reciters', label: t.reciters, icon: Users },
    { id: 'offline', label: t.offline, icon: DownloadCloud, badge: downloadedCount > 0 ? downloadedCount : undefined },
    { id: 'hud', label: t.hud, icon: Gauge },
  ];

  return (
    <nav
      id="android-auto-dock"
      className={`flex md:flex-col justify-around md:justify-start gap-1 p-2 safe-px md:safe-pl safe-pb border-t md:border-t-0 md:border-r transition-colors select-none z-20 ${
        isDayMode
          ? 'bg-stone-200 border-stone-300 text-stone-800'
          : 'bg-[#0D1117] border-white/5 text-stone-200'
      }`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Brand logo in sidebar mode */}
      <div className="hidden md:flex items-center gap-3 p-3 mb-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-emerald-glow">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-md">
          ق
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-emerald-400">{t.appName}</h1>
          <p className="text-[11px] opacity-70">{language === 'ar' ? 'نسخة السيارة' : 'Driver Edition'}</p>
        </div>
      </div>

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`dock-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id as ActiveTab)}
            className={`flex flex-col md:flex-row items-center gap-1.5 md:gap-3 px-3 py-2.5 md:py-3.5 rounded-2xl font-medium transition-all min-h-[52px] touch-manipulation relative active:scale-95 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 font-semibold'
                : isDayMode
                ? 'hover:bg-stone-300/70 text-stone-700'
                : 'hover:bg-white/5 text-stone-400 hover:text-stone-100'
            }`}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[10px] font-extrabold leading-none shadow">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] md:text-sm tracking-tight whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}

      {/* Voice Assistant Shortcut in Sidebar for Desktop/Tablet */}
      <div className="hidden md:block mt-auto pt-4 border-t border-stone-800/40">
        <button
          onClick={onOpenVoiceModal}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md hover:opacity-90 active:scale-95 transition-all text-sm font-semibold"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{t.voiceCommand}</span>
        </button>
      </div>
    </nav>
  );
};
