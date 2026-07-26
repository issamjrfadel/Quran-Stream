import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, X, Volume2, Send, Languages } from 'lucide-react';
import { VoiceCommandResponse } from '../types';
import { TRANSLATIONS, Language } from '../lib/translations';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessCommand: (transcript: string) => Promise<VoiceCommandResponse | null>;
  onPauseAudio?: () => void;
  language: Language;
  onToggleLanguage?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onProcessCommand,
  onPauseAudio,
  language,
  onToggleLanguage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [aiSpeechResponse, setAiSpeechResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micLanguage, setMicLanguage] = useState<'ar-SA' | 'en-US'>(
    language === 'ar' ? 'ar-SA' : 'en-US'
  );

  const t = TRANSLATIONS[language];

  // Sync micLanguage if language prop changes
  useEffect(() => {
    setMicLanguage(language === 'ar' ? 'ar-SA' : 'en-US');
  }, [language]);

  // Web Speech API initialization & auto pause audio
  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setAiSpeechResponse(null);
      return;
    }

    // 1. Immediately pause audio playback while providing voice input
    if (onPauseAudio) {
      onPauseAudio();
    }

    setStatusMessage(t.pausedForMic);

    let recognition: any = null;
    let isActive = true;

    const initSpeech = async () => {
      // Prompt user media permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (err: any) {
          console.warn('getUserMedia mic permission error:', err);
          if (isActive) {
            setStatusMessage(t.micBlocked);
          }
        }
      }

      if (!isActive) return;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = micLanguage;

        recognition.onstart = () => {
          if (!isActive) return;
          setIsListening(true);
          setStatusMessage(t.listening);
        };

        recognition.onresult = (event: any) => {
          if (!isActive) return;
          const text = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setTranscriptInput(text);
        };

        recognition.onerror = (event: any) => {
          if (!isActive) return;
          setIsListening(false);
          setStatusMessage(`${t.micBlocked} (${event.error})`);
        };

        recognition.onend = () => {
          if (!isActive) return;
          setIsListening(false);
        };

        try {
          recognition.start();
        } catch (err) {
          // mic already active
        }
      } else {
        setStatusMessage(language === 'ar' ? 'البحث الصوتي غير مدعوم في هذا المتصفح. يمكنك الكتابة أدناه.' : 'Speech recognition not supported in browser. Use typed commands below.');
      }
    };

    initSpeech();

    return () => {
      isActive = false;
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }
    };
  }, [isOpen, micLanguage]);

  const handleMicClick = async () => {
    // 1. Pause audio whenever driver triggers mic again
    if (onPauseAudio) {
      onPauseAudio();
    }

    if (transcriptInput.trim()) {
      handleExecute(transcriptInput);
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setStatusMessage(language === 'ar' ? 'جاري طلب إذن الوصول للميكروفون...' : 'Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        setStatusMessage(t.micBlocked);
        return;
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = micLanguage;

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage(t.listening);
        };

        recognition.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setTranscriptInput(text);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          setStatusMessage(`${t.micBlocked} (${event.error})`);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (e) {
        console.error('Error starting speech recognition:', e);
      }
    }
  };

  if (!isOpen) return null;

  const handleExecute = async (commandText: string) => {
    if (!commandText.trim()) return;

    // Ensure audio stays paused during processing
    if (onPauseAudio) {
      onPauseAudio();
    }

    setIsProcessing(true);
    setStatusMessage(language === 'ar' ? 'جاري تحليل الأمر بالذكاء الاصطناعي...' : 'Analyzing command with Gemini AI...');

    const response = await onProcessCommand(commandText);
    setIsProcessing(false);

    if (response) {
      setAiSpeechResponse(response.speechResponse);
      setStatusMessage(language === 'ar' ? `تم التنفيذ: ${response.action}` : `Action executed: ${response.action}`);

      // Text-to-Speech playback for hands-free feedback
      if ('speechSynthesis' in window && response.speechResponse) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(response.speechResponse);
        utterance.lang = micLanguage;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      // Auto close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      setStatusMessage(language === 'ar' ? 'عذراً، تعذر تنفيذ الأمر. حاول مرة أخرى.' : 'Sorry, could not process command. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 safe-py safe-px animate-fadeIn select-none" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 relative space-y-6">
        {/* Top Controls: Language Switcher & Close */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (onToggleLanguage) onToggleLanguage();
              setMicLanguage((prev) => (prev === 'ar-SA' ? 'en-US' : 'ar-SA'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-stone-700 text-xs font-bold transition-all"
            title="Switch Voice Input Language (العربية / English)"
          >
            <Languages className="w-4 h-4" />
            <span>{micLanguage === 'ar-SA' ? 'العربية (Arabic Mic)' : 'English (Mic)'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.assistantSubtitle}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">{t.assistantTitle}</h2>
        </div>

        {/* Glowing Microphone Visualizer */}
        <div className="flex flex-col items-center justify-center my-4">
          <button
            onClick={handleMicClick}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl relative ${
              isListening
                ? 'bg-emerald-500 text-stone-950 scale-105 shadow-emerald-500/50 animate-pulse'
                : 'bg-stone-800 text-emerald-400 hover:bg-stone-700'
            }`}
          >
            <Mic className="w-12 h-12" />
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-emerald-400/60 animate-ping" />
            )}
          </button>
          <p className="text-xs font-semibold text-stone-300 mt-4 text-center max-w-xs">{statusMessage}</p>
        </div>

        {/* AI Voice Response Output */}
        {aiSpeechResponse && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1 animate-fadeIn">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>{language === 'ar' ? 'المساعد يتحدث' : 'Assistant Speaking'}</span>
            </p>
            <p className="text-sm font-semibold text-stone-100">{aiSpeechResponse}</p>
          </div>
        )}

        {/* Input Field for Typing or Editing Speech */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t.inputPlaceholder}
            value={transcriptInput}
            onChange={(e) => setTranscriptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute(transcriptInput)}
            className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3.5 text-sm font-medium text-stone-100 outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleExecute(transcriptInput)}
            disabled={isProcessing || !transcriptInput.trim()}
            className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg min-h-[48px] flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut Quick Action Chips */}
        <div className="space-y-2 pt-2 border-t border-stone-800/60">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{t.presetTitle}</p>
          <div className="flex flex-wrap gap-2">
            {t.presetCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setTranscriptInput(cmd);
                  handleExecute(cmd);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700/80 text-xs font-medium text-stone-200 transition-all active:scale-95 touch-manipulation"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
