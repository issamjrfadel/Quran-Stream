import React from 'react';
import { Layers, Play, ChevronRight } from 'lucide-react';
import { JUZ_LIST, SURAHS } from '../data/quranData';
import { Surah } from '../types';

interface JuzListViewProps {
  isDayMode: boolean;
  onSelectSurahById: (surahId: number) => void;
}

export const JuzListView: React.FC<JuzListViewProps> = ({ isDayMode, onSelectSurahById }) => {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full overflow-hidden select-none">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">The 30 Juz Chapters</h2>
          <p className="text-xs opacity-70">Jump directly to any section of the Quran for daily recitation.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
        {JUZ_LIST.map((juz) => {
          const startSurah = SURAHS.find((s) => s.id === juz.startSurahId);
          return (
            <div
              key={juz.juzNumber}
              id={`juz-card-${juz.juzNumber}`}
              onClick={() => onSelectSurahById(juz.startSurahId)}
              className={`p-4 rounded-2xl border transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between touch-manipulation ${
                isDayMode
                  ? 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-900'
                  : 'bg-stone-900/80 border-stone-800 hover:bg-stone-800 text-stone-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg font-mono shadow-md">
                  {juz.juzNumber}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base">Juz {juz.juzNumber}</h3>
                    <span className="text-sm font-serif text-emerald-400">{juz.nameArabic}</span>
                  </div>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    Starts at <span className="text-emerald-400 font-semibold">{juz.startSurahName}</span> (Ayah {juz.startAyah})
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Ends at {juz.endSurahName} (Ayah {juz.endAyah})
                  </p>
                </div>
              </div>

              <button
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={`Start Juz ${juz.juzNumber}`}
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
