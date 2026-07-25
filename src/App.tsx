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
  getOfflineSurahBlobUrl,
} from './lib/offlineStorage';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

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
  const [isHudMode, setIsHudMode] = useState<boolean>(false);
  const [simulatedOfflineMode, setSimulatedOfflineMode] = useState<boolean>(false);

  const [downloadedIds, setDownloadedIds] = useState<number[]>([]);
  const [downloadingSurahId, setDownloadingSurahId] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      showToast('Sleep timer reached. Audio paused.');
    }, sleepTimerMinutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [sleepTimerMinutes]);

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
    showToast(`Now Playing: Surah #${SURAHS[nextIndex].id} ${SURAHS[nextIndex].englishName}`);
  };

  // Previous Surah
  const handlePrevSurah = () => {
    const currentIndex = SURAHS.findIndex((s) => s.id === currentSurah.id);
    const prevIndex = (currentIndex - 1 + SURAHS.length) % SURAHS.length;
    setCurrentSurah(SURAHS[prevIndex]);
    setIsPlaying(true);
    showToast(`Now Playing: Surah #${SURAHS[prevIndex].id} ${SURAHS[prevIndex].englishName}`);
  };

  // Select Surah
  const handleSelectSurah = (surah: Surah) => {
    setCurrentSurah(surah);
    setIsPlaying(true);
    setActiveTab('player');
    showToast(`Loaded Surah #${surah.id} ${surah.englishName}`);
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
    showToast(`Changed Reciter to ${reciter.name}`);
  };

  // Download Surah for Offline
  const handleDownloadSurah = async (surah: Surah) => {
    try {
      setDownloadingSurahId(surah.id);
      setDownloadProgress(0);
      showToast(`Downloading Surah ${surah.englishName} for offline storage...`);

      await downloadAndCacheSurah(surah.id, currentReciter, (percent) => {
        setDownloadProgress(percent);
      });

      await refreshDownloadedList();
      setDownloadingSurahId(null);
      setDownloadProgress(null);
      showToast(`Surah ${surah.englishName} saved for offline listening!`);
    } catch (err: any) {
      setDownloadingSurahId(null);
      setDownloadProgress(null);
      showToast(`Download failed: ${err.message || 'Error saving file'}`);
    }
  };

  // Batch Download Driver Pack
  const handleBatchDownloadSurahs = async (surahsToDownload: Surah[]) => {
    showToast(`Starting batch download for ${surahsToDownload.length} Surahs...`);
    for (const s of surahsToDownload) {
      if (!downloadedIds.includes(s.id)) {
        await handleDownloadSurah(s);
      }
    }
    showToast('Essential Driver Pack downloaded completely!');
  };

  // Voice Command Processor via Express Gemini backend
  const handleProcessVoiceCommand = async (transcript: string): Promise<VoiceCommandResponse | null> => {
    try {
      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error('Failed to reach AI voice backend');

      const data: VoiceCommandResponse = await res.json();

      // Execute returned action
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
      }

      return data;
    } catch (err: any) {
      console.error('Voice command error:', err);
      return null;
    }
  };

  const isCurrentSurahDownloaded = downloadedIds.includes(currentSurah.id);

  return (
    <div
      className={`h-screen w-screen flex flex-col font-sans transition-colors overflow-hidden ${
        isDayMode ? 'bg-stone-50 text-stone-900' : 'bg-[#05070A] text-stone-100'
      }`}
    >
      {/* Driver Header Status Bar */}
      <AndroidAutoHeader
        isDayMode={isDayMode}
        onToggleDayMode={() => setIsDayMode(!isDayMode)}
        isHudMode={isHudMode}
        onToggleHudMode={() => setIsHudMode(true)}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        downloadedCount={downloadedIds.length}
        simulatedOfflineMode={simulatedOfflineMode}
        onToggleOfflineSim={() => {
          setSimulatedOfflineMode(!simulatedOfflineMode);
          showToast(!simulatedOfflineMode ? 'Offline Test Enabled (No Internet)' : 'Online Streaming Mode');
        }}
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
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />

        {/* Tab Content Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
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
              onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
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
