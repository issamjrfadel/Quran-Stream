import React from 'react';
import { Users, Check, Volume2, Globe, Sparkles } from 'lucide-react';
import { RECITERS } from '../data/quranData';
import { Reciter } from '../types';

interface ReciterSelectorViewProps {
  currentReciterId: string;
  isDayMode: boolean;
  onSelectReciter: (reciter: Reciter) => void;
}

export const ReciterSelectorView: React.FC<ReciterSelectorViewProps> = ({
  currentReciterId,
  isDayMode,
  onSelectReciter,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full overflow-hidden select-none">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">World-Renowned Qaris (Reciters)</h2>
          <p className="text-xs opacity-70">Switch recitation voices effortlessly while driving.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pr-1">
        {RECITERS.map((reciter) => {
          const isSelected = reciter.id === currentReciterId;
          return (
            <div
              key={reciter.id}
              id={`reciter-card-${reciter.id}`}
              onClick={() => onSelectReciter(reciter)}
              className={`p-4 rounded-3xl border transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between touch-manipulation relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-950/80 to-stone-900 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40'
                  : isDayMode
                  ? 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-900'
                  : 'bg-stone-900/80 border-stone-800 hover:bg-stone-800 text-stone-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-lg bg-emerald-950 flex items-center justify-center shrink-0">
                  <span className="absolute z-0 font-bold text-lg text-emerald-300/80 pointer-events-none select-none">
                    {reciter.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                  <img
                    src={reciter.photoUrl}
                    alt={reciter.name}
                    referrerPolicy="no-referrer"
                    className="relative z-10 w-full h-full object-cover bg-emerald-950"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base tracking-tight">{reciter.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      {reciter.style}
                    </span>
                  </div>

                  <p className="text-sm font-serif text-emerald-400 mt-0.5">{reciter.arabicName}</p>

                  <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                    <Globe className="w-3.5 h-3.5 text-stone-500" />
                    <span>{reciter.country}</span>
                  </p>
                </div>
              </div>

              {isSelected ? (
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold shadow-lg">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
              ) : (
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isDayMode ? 'bg-stone-200 hover:bg-stone-300 text-stone-800' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                  }`}
                >
                  Select
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
