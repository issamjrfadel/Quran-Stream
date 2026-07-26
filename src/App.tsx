import React, { useState, useEffect } from 'react';
import { SURAHS, RECITERS } from './data/quranData';
import { Surah, Reciter, RepeatMode, VoiceCommandResponse } from './types';
import { AndroidAutoHeader } from './components/AndroidAutoHeader';
import { AndroidAutoDock, ActiveTab } from './components/AndroidAutoDock';
import { NowPlayingView } from './components/NowPlayingView';
import { SurahListView } from './components/SurahListView';
import { JuzListView } from './components/JuzListView';
import { ReciterSelectorView } from './components/ReciterSelectorView';
import { OfflineLibraryView } from './components/OfflineLibraryView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { CarHudModeView } from './components/CarHudModeView';
import { AudioPlayerController } from './components/AudioPlayerController';
import {
  getAllDownloadedSurahs,
  downloadAndCacheSurah,
} from './lib/offlineStorage';
import { parseVoiceCommandLocally } from './lib/voiceParser';
import { Language, TRANSLATIONS } from './lib/translations';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('player');
  const [currentSurah, setCurrentSurah] = useState<Surah>(SURAHS[0]); // Al-Fatiha
  const [currentReciter, setCurrentReciter] = useState<Reciter>(RECITERS[0]); // Mishary Alafasy
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  const [isDayMode, setIsDayMode] = useState<boolean>(false);
  const [isAutoLightSensor, setIsAutoLightSensor] = useState<boolean>(true);
  const [isHudMode, setIsHudMode] = useState<boolean>(false);
  const [simulatedOfflineMode, setSimulatedOfflineMode] = useState<boolean>(false);

  const [downloadedIds, setDownloadedIds] = useState<number[]>([]);
  const [downloadingSurahId, setDownloadingSurahId] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-Language State (Default English or stored choice)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('quran_auto_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('quran_auto_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Car Ambient Light Sensor & System Dark/Day Auto Switching
  useEffect(() => {
    if (!isAutoLightSensor) return;

    let ambientSensor: any = null;

    // 1. Try W3C AmbientLightSensor API if available (in supported car head units/Android browser)
    if ('AmbientLightSensor' in window) {
      try {
        const Sensor = (window as any).AmbientLightSensor;
        ambientSensor = new Sensor({ frequency: 1 });
        ambientSensor.addEventListener('reading', () => {
          const lux = ambientSensor.illuminance;
          // Tunnel or dark night -> Dark mode, bright daylight -> Day mode
          if (lux < 30) {
            setIsDayMode(false);
          } else if (lux >= 30) {
            setIsDayMode(true);
          }
        });
        ambientSensor.start();
      } catch (e) {
        console.warn('AmbientLightSensor initialization fallback:', e);
      }
    }

    // 2. System prefers-color-scheme / Android Auto Dark Mode query listener
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSchemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (isAutoLightSensor && !ambientSensor) {
        setIsDayMode(!e.matches);
      }
    };

    colorSchemeQuery.addEventListener('change', handleSchemeChange);

    // 3. Solar / Local Time Fallback if no light sensor
    const updateTimeBasedTheme = () => {
      if (!isAutoLightSensor || ambientSensor) return;
      const hours = new Date().getHours();
      // Between 7 PM (19:00) and 6 AM (06:00) -> Night/Dark mode
      if (hours >= 19 || hours < 6) {
        setIsDayMode(false);
      } else {
        setIsDayMode(true);
      }
    };

    updateTimeBasedTheme();
    const interval = setInterval(updateTimeBasedTheme, 60000);

    return () => {
      colorSchemeQuery.removeEventListener('change', handleSchemeChange);
      clearInterval(interval);
      if (ambientSensor) {
        try {
          ambientSensor.stop();
        } catch (e) {}
      }
    };
  }, [isAutoLightSensor]);

  // Load downloaded Surah list on launch
  const refreshDownloadedList = async () => {
    const list = await getAllDownloadedSurahs();
    setDownloadedIds(list.map((item) => item.surahId));
  };

  useEffect(() => {
    refreshDownloadedList();
  }, []);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sleep Timer logic
  useEffect(() => {
    if (!sleepTimerMinutes) return;
    const timeout = setTimeout(() => {
      setIsPlaying(false);
      setSleepTimerMinutes(null);
      showToast(language === 'ar' ? 'انتهت مدة مؤقت النوم. تم إيقاف الصوت.' : 'Sleep timer reached. Audio paused.');
    }, sleepTimerMinutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [sleepTimerMinutes, language]);

  // Pause audio function (used when driver starts voice input or opens voice modal)
  const handlePauseAudio = () => {
    setIsPlaying(false);
  };

  // Handle Play/Pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Skip Seconds
  const handleSkipSeconds = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)));
    const audioEl = document.querySelector('audio');
    if (audioEl) {
      audioEl.currentTime = Math.max(0, Math.min(duration, audioEl.currentTime + seconds));
    }
  };

  // Seek
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    const audioEl = document.querySelector('audio');
    if (audioEl) {
      audioEl.currentTime = seconds;
    }
  };

  // Next Surah
  const handleNextSurah = () => {
    const currentIndex = SURAHS.findIndex((s) => s.id === currentSurah.id);
    const nextIndex = (currentIndex + 1) % SURAHS.length;
    setCurrentSurah(SURAHS[nextIndex]);
    setIsPlaying(true);
    showToast(language === 'ar' ? `يتلى الآن: سورة ${SURAHS[nextIndex].name}` : `Now Playing: Surah #${SURAHS[nextIndex].id} ${SURAHS[nextIndex].englishName}`);
  };

  // Previous Surah
  const handlePrevSurah = () => {
    const currentIndex = SURAHS.findIndex((s) => s.id === currentSurah.id);
    const prevIndex = (currentIndex - 1 + SURAHS.length) % SURAHS.length;
    setCurrentSurah(SURAHS[prevIndex]);
    setIsPlaying(true);
    showToast(language === 'ar' ? `يتلى الآن: سورة ${SURAHS[prevIndex].name}` : `Now Playing: Surah #${SURAHS[prevIndex].id} ${SURAHS[prevIndex].englishName}`);
  };

  // Select Surah
  const handleSelectSurah = (surah: Surah) => {
    setCurrentSurah(surah);
    setIsPlaying(true);
    setActiveTab('player');
    showToast(language === 'ar' ? `تم تحميل سورة ${surah.name}` : `Loaded Surah #${surah.id} ${surah.englishName}`);
  };

  // Select Surah by ID
  const handleSelectSurahById = (surahId: number) => {
    const surah = SURAHS.find((s) => s.id === surahId);
    if (surah) {
      handleSelectSurah(surah);
    }
  };

  // Select Reciter
  const handleSelectReciter = (reciter: Reciter) => {
    setCurrentReciter(reciter);
    showToast(language === 'ar' ? `تم تغيير القارئ إلى ${reciter.arabicName}` : `Changed Reciter to ${reciter.name}`);
  };

  // Download Surah for Offline
  const handleDownloadSurah = async (surah: Surah) => {
    try {
      setDownloadingSurahId(surah.id);
      setDownloadProgress(0);
      showToast(language === 'ar' ? `جاري تحميل سورة ${surah.name}...` : `Downloading Surah ${surah.englishName} for offline storage...`);

      await downloadAndCacheSurah(surah.id, currentReciter, (percent) => {
        setDownloadProgress(percent);
      });

      await refreshDownloadedList();
      setDownloadingSurahId(null);
      setDownloadProgress(null);
      showToast(language === 'ar' ? `تم حفظ سورة ${surah.name} للاستماع بدون إنترنت!` : `Surah ${surah.englishName} saved for offline listening!`);
    } catch (err: any) {
      setDownloadingSurahId(null);
      setDownloadProgress(null);
      showToast(`Download failed: ${err.message || 'Error saving file'}`);
    }
  };

  // Batch Download Driver Pack
  const handleBatchDownloadSurahs = async (surahsToDownload: Surah[]) => {
    showToast(language === 'ar' ? `جاري تحميل ${surahsToDownload.length} سورة...` : `Starting batch download for ${surahsToDownload.length} Surahs...`);
    for (const s of surahsToDownload) {
      if (!downloadedIds.includes(s.id)) {
        await handleDownloadSurah(s);
      }
    }
    showToast(language === 'ar' ? 'تم اكتمال تحميل باقة القيادة!' : 'Essential Driver Pack downloaded completely!');
  };

  // Voice Command Processor via Express Gemini backend with native/offline fallback
  const handleProcessVoiceCommand = async (transcript: string): Promise<VoiceCommandResponse | null> => {
    let data: VoiceCommandResponse | null = null;

    try {
      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (res.ok) {
        data = await res.json();
      }
    } catch (err: any) {
      console.warn('Voice command server unavailable, using local parser:', err);
    }

    // Fallback to client-side local parser if server response failed or wasn't ok
    if (!data || !data.action) {
      data = parseVoiceCommandLocally(transcript);
    }

    // Execute returned action
    if (data) {
      if (data.action === 'PLAY_SURAH' && data.surahNumber) {
        handleSelectSurahById(data.surahNumber);
      } else if (data.action === 'DOWNLOAD_SURAH' && data.surahNumber) {
        const s = SURAHS.find((item) => item.id === data.surahNumber);
        if (s) handleDownloadSurah(s);
      } else if (data.action === 'CHANGE_RECITER' && data.reciterId) {
        const r = RECITERS.find((rec) => rec.id === data.reciterId);
        if (r) handleSelectReciter(r);
      } else if (data.action === 'TOGGLE_HUD') {
        setIsHudMode(true);
      } else if (data.action === 'PAUSE') {
        setIsPlaying(false);
      } else if (data.action === 'RESUME') {
        setIsPlaying(true);
      } else if (data.action === 'SET_SLEEP_TIMER' && data.minutes) {
        setSleepTimerMinutes(data.minutes);
      } else if (data.action === 'EXPLAIN_SURAH' && data.surahNumber) {
        handleSelectSurahById(data.surahNumber);
      }
    }

    return data;
  };

  const isCurrentSurahDownloaded = downloadedIds.includes(currentSurah.id);

  return (
    <div
      className={`h-screen w-screen flex flex-col font-sans transition-colors overflow-hidden ${
        isDayMode ? 'bg-stone-50 text-stone-900' : 'bg-[#05070A] text-stone-100'
      }`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Driver Header Status Bar */}
      <AndroidAutoHeader
        isDayMode={isDayMode}
        onToggleDayMode={() => {
          setIsAutoLightSensor(false);
          setIsDayMode(!isDayMode);
        }}
        isAutoLightSensor={isAutoLightSensor}
        onToggleAutoLightSensor={() => {
          const next = !isAutoLightSensor;
          setIsAutoLightSensor(next);
          showToast(next ? (language === 'ar' ? 'مستشعار الإضاءة التلقائي مفعل' : 'Auto Light Sensor Activated') : (language === 'ar' ? 'التحكم اليدوي بالإضاءة مفعل' : 'Manual Day/Night Mode'));
        }}
        isHudMode={isHudMode}
        onToggleHudMode={() => setIsHudMode(true)}
        onOpenVoiceAssistant={() => {
          handlePauseAudio();
          setIsVoiceModalOpen(true);
        }}
        downloadedCount={downloadedIds.length}
        simulatedOfflineMode={simulatedOfflineMode}
        onToggleOfflineSim={() => {
          setSimulatedOfflineMode(!simulatedOfflineMode);
          showToast(!simulatedOfflineMode ? (language === 'ar' ? 'تم تفعيل وضع الأوفلاين التجريبي' : 'Offline Test Enabled (No Internet)') : (language === 'ar' ? 'وضع الاستماع عبر الإنترنت' : 'Online Streaming Mode'));
        }}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      />

      {/* Main Container with Sidebar Navigation Dock */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <AndroidAutoDock
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'hud') {
              setIsHudMode(true);
            } else {
              setActiveTab(tab);
            }
          }}
          isDayMode={isDayMode}
          downloadedCount={downloadedIds.length}
          currentSurahName={currentSurah.englishName}
          isPlaying={isPlaying}
          onOpenVoiceModal={() => {
            handlePauseAudio();
            setIsVoiceModalOpen(true);
          }}
          language={language}
        />

        {/* Tab Content Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative safe-px safe-pb">
          {activeTab === 'player' && (
            <NowPlayingView
              surah={currentSurah}
              reciter={currentReciter}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              playbackRate={playbackRate}
              volume={volume}
              isMuted={isMuted}
              repeatMode={repeatMode}
              sleepTimerMinutes={sleepTimerMinutes}
              isDownloaded={isCurrentSurahDownloaded}
              downloadProgress={downloadingSurahId === currentSurah.id ? downloadProgress : null}
              isDayMode={isDayMode}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSkipSeconds={handleSkipSeconds}
              onNextSurah={handleNextSurah}
              onPrevSurah={handlePrevSurah}
              onChangePlaybackRate={(rate) => setPlaybackRate(rate)}
              onChangeRepeatMode={() => {
                const modes: RepeatMode[] = ['none', 'one', 'all'];
                const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
                setRepeatMode(nextMode);
              }}
              onToggleMute={() => setIsMuted(!isMuted)}
              onChangeVolume={(vol) => setVolume(vol)}
              onDownloadSurah={() => handleDownloadSurah(currentSurah)}
              onOpenReciterSelector={() => setActiveTab('reciters')}
              onSetSleepTimer={(mins) => setSleepTimerMinutes(mins)}
              onOpenVoiceAssistant={() => {
                handlePauseAudio();
                setIsVoiceModalOpen(true);
              }}
            />
          )}

          {activeTab === 'surahs' && (
            <SurahListView
              surahs={SURAHS}
              currentSurahId={currentSurah.id}
              isPlaying={isPlaying}
              downloadedIds={downloadedIds}
              downloadingSurahId={downloadingSurahId}
              downloadProgress={downloadProgress}
              isDayMode={isDayMode}
              onSelectSurah={handleSelectSurah}
              onDownloadSurah={handleDownloadSurah}
            />
          )}

          {activeTab === 'juz' && (
            <JuzListView
              isDayMode={isDayMode}
              onSelectSurahById={handleSelectSurahById}
            />
          )}

          {activeTab === 'reciters' && (
            <ReciterSelectorView
              currentReciterId={currentReciter.id}
              isDayMode={isDayMode}
              onSelectReciter={(r) => {
                handleSelectReciter(r);
                setActiveTab('player');
              }}
            />
          )}

          {activeTab === 'offline' && (
            <OfflineLibraryView
              isDayMode={isDayMode}
              simulatedOfflineMode={simulatedOfflineMode}
              onToggleOfflineSim={() => setSimulatedOfflineMode(!simulatedOfflineMode)}
              onSelectSurah={handleSelectSurah}
              onBatchDownloadSurahs={handleBatchDownloadSurahs}
            />
          )}
        </main>
      </div>

      {/* Driver Toast Alert Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 px-5 py-3 rounded-2xl bg-stone-900 border border-emerald-500/50 text-white shadow-2xl flex items-center gap-3 animate-slideUp text-sm font-semibold">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden Audio Controller Engine */}
      <AudioPlayerController
        currentSurah={currentSurah}
        currentReciter={currentReciter}
        isPlaying={isPlaying}
        playbackRate={playbackRate}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        simulatedOfflineMode={simulatedOfflineMode}
        onTimeUpdate={(cur, dur) => {
          setCurrentTime(cur);
          if (dur > 0) setDuration(dur);
        }}
        onEnded={() => {
          if (repeatMode === 'all') {
            handleNextSurah();
          } else {
            setIsPlaying(false);
          }
        }}
        onError={(err) => {
          showToast(err);
          setIsPlaying(false);
        }}
        onPlayPauseToggle={handlePlayPause}
        onNextSurah={handleNextSurah}
        onPrevSurah={handlePrevSurah}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onProcessCommand={handleProcessVoiceCommand}
        onPauseAudio={handlePauseAudio}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      />

      {/* Full-Screen Car HUD Gauge View */}
      {isHudMode && (
        <CarHudModeView
          surah={currentSurah}
          reciter={currentReciter}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onSkipSeconds={handleSkipSeconds}
          onNextSurah={handleNextSurah}
          onPrevSurah={handlePrevSurah}
          onExitHud={() => setIsHudMode(false)}
        />
      )}
    </div>
  );
}
