import { VoiceCommandResponse } from '../types';
import { SURAHS, RECITERS } from '../data/quranData';

/**
 * Normalizes Eastern/Arabic numerals to Western ASCII digits.
 */
function convertArabicNumerals(str: string): string {
  return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => {
    return '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString();
  });
}

/**
 * Intelligent client-side Voice Command Parser for English and Arabic
 * Works 100% offline and on native mobile devices (iOS/Android Capacitor apps)
 * when Express API endpoints or internet connections are unavailable.
 */
export function parseVoiceCommandLocally(transcript: string): VoiceCommandResponse {
  const convertedInput = convertArabicNumerals(transcript);
  const cleanInput = convertedInput.toLowerCase().trim();

  // 1. Check for HUD / Car Mode commands
  if (
    cleanInput.includes('hud') ||
    cleanInput.includes('car mode') ||
    cleanInput.includes('drive mode') ||
    cleanInput.includes('car view') ||
    cleanInput.includes('وضع السيارة') ||
    cleanInput.includes('شاشة السيارة') ||
    cleanInput.includes('شاشة القيادة')
  ) {
    return {
      action: 'TOGGLE_HUD',
      surahNumber: null,
      reciterId: null,
      minutes: null,
      speechResponse: cleanInput.match(/[\u0600-\u06FF]/)
        ? 'تم التبديل إلى وضع شاشة السيارة HUD.'
        : 'Switching to high contrast Car HUD Mode.',
      explanationText: '',
    };
  }

  // 2. Check for Sleep Timer commands
  if (
    cleanInput.includes('sleep') ||
    cleanInput.includes('timer') ||
    cleanInput.includes('مؤقت') ||
    cleanInput.includes('إيقاف تلقائي') ||
    cleanInput.includes('دقيقة')
  ) {
    const minutesMatch = cleanInput.match(/\d+/);
    const mins = minutesMatch ? parseInt(minutesMatch[0], 10) : 30;
    return {
      action: 'SET_SLEEP_TIMER',
      surahNumber: null,
      reciterId: null,
      minutes: mins,
      speechResponse: cleanInput.match(/[\u0600-\u06FF]/)
        ? `تم ضبط مؤقت النوم لمدة ${mins} دقيقة.`
        : `Sleep timer set for ${mins} minutes.`,
      explanationText: '',
    };
  }

  // 3. Check for Pause / Stop commands
  if (
    cleanInput.includes('pause') ||
    cleanInput.includes('stop playback') ||
    cleanInput.includes('quiet') ||
    cleanInput === 'stop' ||
    cleanInput.includes('إيقاف') ||
    cleanInput.includes('ايقاف') ||
    cleanInput.includes('وقف') ||
    cleanInput.includes('اسكت') ||
    cleanInput.includes('صمت')
  ) {
    return {
      action: 'PAUSE',
      surahNumber: null,
      reciterId: null,
      minutes: null,
      speechResponse: cleanInput.match(/[\u0600-\u06FF]/) ? 'تم إيقاف التلاوة مؤقتاً.' : 'Audio playback paused.',
      explanationText: '',
    };
  }

  // 4. Check for Resume / Play commands (without specific surah)
  if (
    cleanInput === 'play' ||
    cleanInput === 'resume' ||
    cleanInput.includes('continue') ||
    cleanInput === 'شغل' ||
    cleanInput === 'تشغيل' ||
    cleanInput.includes('متابعة') ||
    cleanInput.includes('استئناف')
  ) {
    return {
      action: 'RESUME',
      surahNumber: null,
      reciterId: null,
      minutes: null,
      speechResponse: cleanInput.match(/[\u0600-\u06FF]/) ? 'جاري استئناف التلاوة.' : 'Resuming playback.',
      explanationText: '',
    };
  }

  // 5. Check for Reciter Change
  if (
    cleanInput.includes('reciter') ||
    cleanInput.includes('reader') ||
    cleanInput.includes('sheikh') ||
    cleanInput.includes('qari') ||
    cleanInput.includes('switch to') ||
    cleanInput.includes('الشيخ') ||
    cleanInput.includes('القارئ') ||
    cleanInput.includes('بصوت') ||
    cleanInput.includes('غير القارئ') ||
    cleanInput.includes('تغيير القارئ')
  ) {
    for (const r of RECITERS) {
      const reciterNameLower = r.name.toLowerCase();
      const arabicNameLower = r.arabicName.toLowerCase();
      const keywords = reciterNameLower
        .split(' ')
        .concat(arabicNameLower.split(' '))
        .concat(r.id.split('_'));

      if (
        keywords.some(
          (kw) =>
            kw.length >= 3 &&
            (cleanInput.includes(kw) || cleanInput.includes(kw.replace(/^ال/, '')))
        )
      ) {
        return {
          action: 'CHANGE_RECITER',
          surahNumber: null,
          reciterId: r.id,
          minutes: null,
          speechResponse: cleanInput.match(/[\u0600-\u06FF]/)
            ? `تم تغيير القارئ إلى ${r.arabicName}.`
            : `Switched reciter to ${r.name}.`,
          explanationText: '',
        };
      }
    }
  }

  // 6. Check for Surah Explanation request
  const isExplain =
    cleanInput.includes('explain') ||
    cleanInput.includes('tafsir') ||
    cleanInput.includes('overview') ||
    cleanInput.includes('about') ||
    cleanInput.includes('تفسير') ||
    cleanInput.includes('شرح') ||
    cleanInput.includes('معاني');

  // 7. Match Surah by Number or Name (Arabic & English)
  // First check if there's an explicit number e.g. "surah 36", "سورة 18", "رقم 36"
  const surahNumMatch = cleanInput.match(/(?:surah|chapter|number|سورة|رقم|#)?\s*(\d{1,3})/i);
  let matchedSurah = null;

  if (surahNumMatch) {
    const num = parseInt(surahNumMatch[1], 10);
    if (num >= 1 && num <= 114) {
      matchedSurah = SURAHS.find((s) => s.id === num);
    }
  }

  // If no number match, search by Surah Arabic or English name fuzzy matching
  if (!matchedSurah) {
    const strippedInput = cleanInput
      .replace(/surah|chapter|play|recite|download|explain|about|سورة|شغل|تشغيل|اقرأ|سمعني|تحميل|تفسير|شرح/g, '')
      .trim();

    for (const s of SURAHS) {
      const arabicNameClean = s.name.replace(/^ال/, '').trim();
      const engNameNorm = s.englishName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const transNorm = s.englishNameTranslation.toLowerCase().replace(/[^a-z0-9]/g, '');
      const commonName = s.englishName.toLowerCase().replace(/^al-|^an-|^at-|^as-|^ar-|^az-|^ad-/, '');

      if (
        cleanInput.includes(s.name) ||
        (arabicNameClean.length >= 2 && cleanInput.includes(arabicNameClean)) ||
        strippedInput.includes(s.name) ||
        (engNameNorm.length > 3 && engNameNorm.includes(strippedInput)) ||
        strippedInput.includes(engNameNorm) ||
        strippedInput.includes(transNorm) ||
        (commonName.length > 3 && strippedInput.includes(commonName))
      ) {
        matchedSurah = s;
        break;
      }
    }
  }

  if (matchedSurah) {
    const isArabic = cleanInput.match(/[\u0600-\u06FF]/);
    if (isExplain) {
      return {
        action: 'EXPLAIN_SURAH',
        surahNumber: matchedSurah.id,
        reciterId: null,
        minutes: null,
        speechResponse: isArabic
          ? `سورة ${matchedSurah.name} آياتها ${matchedSurah.numberOfAyahs}، نزلت في ${matchedSurah.revelationType === 'Meccan' ? 'مكة المكرمة' : 'المدينة المنورة'}. ${matchedSurah.summary || ''}`
          : `Surah ${matchedSurah.englishName} (${matchedSurah.englishNameTranslation}) has ${matchedSurah.numberOfAyahs} verses. ${matchedSurah.summary || ''}`,
        explanationText: matchedSurah.summary || `Surah ${matchedSurah.englishName} is a ${matchedSurah.revelationType} surah.`,
      };
    }

    if (
      cleanInput.includes('download') ||
      cleanInput.includes('save') ||
      cleanInput.includes('تحميل') ||
      cleanInput.includes('تنزيل') ||
      cleanInput.includes('حفظ')
    ) {
      return {
        action: 'DOWNLOAD_SURAH',
        surahNumber: matchedSurah.id,
        reciterId: null,
        minutes: null,
        speechResponse: isArabic
          ? `جاري تحميل سورة ${matchedSurah.name} للاستماع بدون إنترنت.`
          : `Downloading Surah ${matchedSurah.englishName} for offline listening.`,
        explanationText: '',
      };
    }

    return {
      action: 'PLAY_SURAH',
      surahNumber: matchedSurah.id,
      reciterId: null,
      minutes: null,
      speechResponse: isArabic ? `جاري تشغيل سورة ${matchedSurah.name}.` : `Now playing Surah ${matchedSurah.englishName}.`,
      explanationText: '',
    };
  }

  // Default fallback if text was entered or spoken but not matched specifically
  const isArabic = cleanInput.match(/[\u0600-\u06FF]/);
  return {
    action: 'UNKNOWN',
    surahNumber: null,
    reciterId: null,
    minutes: null,
    speechResponse: isArabic
      ? `فهمت: "${transcript}". يرجى قول أمر مثل "شغل سورة يس" أو "تغيير القارئ".`
      : `Understood: "${transcript}". Please state a command like "Play Surah Ya-Sin" or "Switch reciter".`,
    explanationText: '',
  };
}
