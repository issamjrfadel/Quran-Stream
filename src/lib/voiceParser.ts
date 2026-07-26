import { VoiceCommandResponse } from '../types';
import { SURAHS, RECITERS } from '../data/quranData';

/**
 * Intelligent client-side Voice Command Parser
 * Works 100% offline and on native mobile devices (iOS/Android Capacitor apps)
 * when Express API endpoints or internet connections are unavailable.
 */
export function parseVoiceCommandLocally(transcript: string): VoiceCommandResponse {
  const cleanInput = transcript.toLowerCase().trim();

  // 1. Check for HUD / Car Mode commands
  if (cleanInput.includes('hud') || cleanInput.includes('car mode') || cleanInput.includes('drive mode') || cleanInput.includes('car view')) {
    return {
      action: 'TOGGLE_HUD',
      surahNumber: null,
      reciterId: null,
      minutes: null,
      speechResponse: 'Switching to high contrast Car HUD Mode.',
      explanationText: '',
    };
  }

  // 2. Check for Sleep Timer commands
  if (cleanInput.includes('sleep') || cleanInput.includes('timer')) {
    const minutesMatch = cleanInput.match(/\d+/);
    const mins = minutesMatch ? parseInt(minutesMatch[0], 10) : 30;
    return {
      action: 'SET_SLEEP_TIMER',
      surahNumber: null,
      reciterId: null,
      minutes: mins,
      speechResponse: `Sleep timer set for ${mins} minutes.`,
      explanationText: '',
    };
  }

  // 3. Check for Pause / Stop commands
  if (cleanInput.includes('pause') || cleanInput.includes('stop playback') || cleanInput.includes('quiet') || cleanInput === 'stop') {
    return {
      action: 'PAUSE',
      surahNumber: null,
      reciterId: null,
      minutes: null,
      speechResponse: 'Audio playback paused.',
      explanationText: '',
    };
  }

  // 4. Check for Resume / Play commands (without specific surah)
  if (cleanInput === 'play' || cleanInput === 'resume' || cleanInput.includes('continue')) {
    return {
      action: 'RESUME',
      surahNumber: null,
      reciterId: null,
      minutes: null,
      speechResponse: 'Resuming playback.',
      explanationText: '',
    };
  }

  // 5. Check for Reciter Change
  if (cleanInput.includes('reciter') || cleanInput.includes('reader') || cleanInput.includes('sheikh') || cleanInput.includes('qari') || cleanInput.includes('switch to')) {
    for (const r of RECITERS) {
      const reciterNameLower = r.name.toLowerCase();
      // Match by parts of name e.g. "mishary", "alafasy", "abdul basit", "ghamdi", "shatri", "muaiqly", "husary", "shuraim", "dosari"
      const keywords = reciterNameLower.split(' ').concat(r.id.split('_'));
      if (keywords.some((kw) => kw.length > 3 && cleanInput.includes(kw))) {
        return {
          action: 'CHANGE_RECITER',
          surahNumber: null,
          reciterId: r.id,
          minutes: null,
          speechResponse: `Switched reciter to ${r.name}.`,
          explanationText: '',
        };
      }
    }
  }

  // 6. Check for Surah Explanation request
  const isExplain = cleanInput.includes('explain') || cleanInput.includes('tafsir') || cleanInput.includes('overview') || cleanInput.includes('about');

  // 7. Match Surah by Number or Name
  // First check if there's an explicit number e.g. "surah 36", "surah #18", "surah 1"
  const surahNumMatch = cleanInput.match(/(?:surah|chapter|number|#)?\s*(\d{1,3})/i);
  let matchedSurah = null;

  if (surahNumMatch) {
    const num = parseInt(surahNumMatch[1], 10);
    if (num >= 1 && num <= 114) {
      matchedSurah = SURAHS.find((s) => s.id === num);
    }
  }

  // If no number match, search by Surah name fuzzy matching
  if (!matchedSurah) {
    const normalizedInput = cleanInput
      .replace(/surah|chapter|play|recite|download|explain|about/g, '')
      .replace(/[^a-z0-9]/g, '');

    for (const s of SURAHS) {
      const engNameNorm = s.englishName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const transNorm = s.englishNameTranslation.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Common transliterated variations
      const commonName = s.englishName.toLowerCase().replace(/^al-|^an-|^at-|^as-|^ar-|^az-|^ad-/, '');

      if (
        normalizedInput.includes(engNameNorm) ||
        (engNameNorm.length > 3 && engNameNorm.includes(normalizedInput)) ||
        normalizedInput.includes(transNorm) ||
        (commonName.length > 3 && normalizedInput.includes(commonName))
      ) {
        matchedSurah = s;
        break;
      }
    }
  }

  if (matchedSurah) {
    if (isExplain) {
      return {
        action: 'EXPLAIN_SURAH',
        surahNumber: matchedSurah.id,
        reciterId: null,
        minutes: null,
        speechResponse: `Surah ${matchedSurah.englishName} (${matchedSurah.englishNameTranslation}) has ${matchedSurah.numberOfAyahs} verses. ${matchedSurah.summary || ''}`,
        explanationText: matchedSurah.summary || `Surah ${matchedSurah.englishName} is a ${matchedSurah.revelationType} surah with ${matchedSurah.numberOfAyahs} ayahs.`,
      };
    }

    if (cleanInput.includes('download') || cleanInput.includes('save')) {
      return {
        action: 'DOWNLOAD_SURAH',
        surahNumber: matchedSurah.id,
        reciterId: null,
        minutes: null,
        speechResponse: `Downloading Surah ${matchedSurah.englishName} for offline listening.`,
        explanationText: '',
      };
    }

    return {
      action: 'PLAY_SURAH',
      surahNumber: matchedSurah.id,
      reciterId: null,
      minutes: null,
      speechResponse: `Now playing Surah ${matchedSurah.englishName}.`,
      explanationText: '',
    };
  }

  // Default fallback if text was entered or spoken but not matched specifically
  return {
    action: 'UNKNOWN',
    surahNumber: null,
    reciterId: null,
    minutes: null,
    speechResponse: `Understood: "${transcript}". Please state a command like "Play Surah Ya-Sin" or "Switch reciter".`,
    explanationText: '',
  };
}
