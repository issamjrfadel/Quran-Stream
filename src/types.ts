export interface Surah {
  id: number;
  name: string; // Arabic name e.g. الفاتحة
  englishName: string; // Transliterated e.g. Al-Fatiha
  englishNameTranslation: string; // Meaning e.g. The Opening
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  juzNumber: number;
  estimatedDurationSeconds: number; // Avg duration in seconds
  summary: string; // Short 1-2 sentence overview for driver audio summary
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  country: string;
  photoUrl: string;
  baseUrl: string; // Base URL for MP3 files (e.g. https://server8.mp3quran.net/afs/)
  audioFormat: 'mp3';
  style: 'Murattal' | 'Mujawwad';
}

export interface JuzInfo {
  juzNumber: number;
  nameArabic: string;
  startSurahId: number;
  startSurahName: string;
  startAyah: number;
  endSurahId: number;
  endSurahName: string;
  endAyah: number;
}

export interface DownloadedSurah {
  surahId: number;
  reciterId: string;
  downloadedAt: number; // timestamp
  sizeBytes: number;
  audioBlobUrl?: string;
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface PlayerState {
  currentSurah: Surah;
  currentReciter: Reciter;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  sleepTimerMinutes: number | null;
  sleepTimerEndTime: number | null;
  isCarHudMode: boolean;
  isDayDriveMode: boolean;
  simulatedOfflineMode: boolean; // Driver test switch for offline audio testing
}

export interface VoiceCommandResponse {
  action: 'PLAY_SURAH' | 'DOWNLOAD_SURAH' | 'CHANGE_RECITER' | 'TOGGLE_HUD' | 'SET_SLEEP_TIMER' | 'EXPLAIN_SURAH' | 'PAUSE' | 'RESUME' | 'SEARCH' | 'UNKNOWN';
  surahNumber?: number | null;
  reciterId?: string | null;
  minutes?: number | null;
  speechResponse: string;
  explanationText?: string;
}
