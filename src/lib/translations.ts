export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  connected: string;
  voiceCommand: string;
  offlineSim: string;
  offlineActive: string;
  dayNight: string;
  autoSensor: string;
  autoSensorActive: string;
  hud: string;
  player: string;
  surahs: string;
  juz: string;
  reciters: string;
  offline: string;
  nowPlaying: string;
  surahNumber: string;
  ayahs: string;
  revelation: string;
  meccan: string;
  medinan: string;
  selectReciter: string;
  sleepTimer: string;
  repeat: string;
  download: string;
  downloaded: string;
  carHudMode: string;
  speed: string;
  assistantTitle: string;
  assistantSubtitle: string;
  listening: string;
  pausedForMic: string;
  inputPlaceholder: string;
  micBlocked: string;
  presetTitle: string;
  hudTitle: string;
  dayMode: string;
  nightMode: string;
  closeHud: string;
  presetCommands: string[];
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'Quran Stream Auto',
    connected: 'Android Auto Connected',
    voiceCommand: 'Voice Control',
    offlineSim: 'Test Offline',
    offlineActive: 'Offline Active',
    dayNight: 'Day/Night',
    autoSensor: 'Auto Sensor',
    autoSensorActive: 'Auto Light Sensor Active',
    hud: 'HUD Mode',
    player: 'Player',
    surahs: 'Surahs',
    juz: 'Juz',
    reciters: 'Reciters',
    offline: 'Offline',
    nowPlaying: 'NOW PLAYING',
    surahNumber: 'Surah',
    ayahs: 'Ayahs',
    revelation: 'Revelation',
    meccan: 'Meccan',
    medinan: 'Medinan',
    selectReciter: 'Select Reciter',
    sleepTimer: 'Sleep Timer',
    repeat: 'Repeat',
    download: 'Download',
    downloaded: 'Downloaded',
    carHudMode: 'Car HUD Mode',
    speed: 'Speed',
    assistantTitle: 'Driver Voice Control',
    assistantSubtitle: 'Android Auto AI Assistant',
    listening: 'Listening... Speak now (English or Arabic)',
    pausedForMic: 'Audio paused for voice command',
    inputPlaceholder: 'Type or speak command (e.g., Play Surah Ya-Sin)...',
    micBlocked: 'Mic notice: permission blocked. Tap mic or type below.',
    presetTitle: 'Tap preset driver shortcuts:',
    hudTitle: 'HUD Driver Display',
    dayMode: 'Day Drive',
    nightMode: 'Night Drive',
    closeHud: 'Exit HUD',
    presetCommands: [
      'Play Surah Ya-Sin',
      'Play Surah Al-Kahf by Abdul Basit',
      'Switch reciter to Maher Al-Muaiqly',
      'Explain Surah Ar-Rahman',
      'Set sleep timer for 30 minutes',
      'Enable Car HUD Mode',
    ],
  },
  ar: {
    appName: 'القرآن الكريم للسيارة',
    connected: 'متصل بشاشة السيارة',
    voiceCommand: 'التحكم الصوتي',
    offlineSim: 'اختبار الأوفلاين',
    offlineActive: 'بدون إنترنت',
    dayNight: 'النهار/الليل',
    autoSensor: 'استشعار تلقائي',
    autoSensorActive: 'مستشعار إضاءة السيارة مفعل',
    hud: 'وضع HUD',
    player: 'المشغل',
    surahs: 'السور',
    juz: 'الأجزاء',
    reciters: 'القراء',
    offline: 'المحفوظات',
    nowPlaying: 'يتلى الآن',
    surahNumber: 'سورة',
    ayahs: 'آياتها',
    revelation: 'مكان النزول',
    meccan: 'مكية',
    medinan: 'مدنية',
    selectReciter: 'اختر القارئ',
    sleepTimer: 'مؤقت النوم',
    repeat: 'تكرار',
    download: 'تحميل',
    downloaded: 'محفوظ',
    carHudMode: 'وضع القيادة HUD',
    speed: 'السرعة',
    assistantTitle: 'التحكم الصوتي للسائق',
    assistantSubtitle: 'مساعد الذكاء الاصطناعي للسيارة',
    listening: 'جاري الاستماع... تحدث الآن باللغة العربية أو الإنجليزية',
    pausedForMic: 'تم إيقاف الصوت مؤقتاً لتلقي الأمر الصوتي',
    inputPlaceholder: 'اكتب أو تحدث بأمر صوتي (مثال: شغل سورة يس)...',
    micBlocked: 'تنبيه الميكروفون: إذن الوصول محجوب. اضغط على الميكروفون أو اكتب أدناه.',
    presetTitle: 'اختصارات سريعة للسائق:',
    hudTitle: 'شاشة القيادة HUD',
    dayMode: 'وضع النهار',
    nightMode: 'وضع الليل',
    closeHud: 'إلغاء وضع HUD',
    presetCommands: [
      'تشغيل سورة يس',
      'تشغيل سورة الكهف بصوت عبد الباسط',
      'تغيير القارئ إلى ماهر المعيقلي',
      'تفسير سورة الرحمن',
      'ضبط مؤقت النوم ٣٠ دقيقة',
      'تفعيل وضع شاشة السيارة HUD',
    ],
  },
};
