import React, { useState, useMemo } from 'react';
import { Search, Play, Download, CheckCircle2, Star, Sparkles, Filter, Check } from 'lucide-react';
import { Surah, Reciter } from '../types';

interface SurahListViewProps {
  surahs: Surah[];
  currentSurahId: number;
  isPlaying: boolean;
  downloadedIds: number[];
  downloadingSurahId: number | null;
  downloadProgress: number | null;
  isDayMode: boolean;
  onSelectSurah: (surah: Surah) => void;
  onDownloadSurah: (surah: Surah) => void;
}

export const SurahListView: React.FC<SurahListViewProps> = ({
  surahs,
  currentSurahId,
  isPlaying,
  downloadedIds,
  downloadingSurahId,
  downloadProgress,
  isDayMode,
  onSelectSurah,
  onDownloadSurah,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan' | 'downloaded' | 'popular'>('all');

  const popularSurahIds = [1, 2, 18, 36, 55, 56, 67, 112, 113, 114]; // Al-Fatiha, Al-Baqarah, Kahf, Yasin, Rahman, Waqia, Mulk, Quls

  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      const matchesSearch =
        surah.id.toString() === searchQuery ||
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name.includes(searchQuery);

      if (!matchesSearch) return false;

      if (filterType === 'meccan') return surah.revelationType === 'Meccan';
      if (filterType === 'medinan') return surah.revelationType === 'Medinan';
      if (filterType === 'downloaded') return downloadedIds.includes(surah.id);
      if (filterType === 'popular') return popularSurahIds.includes(surah.id);

      return true;
    });
  }, [surahs, searchQuery, filterType, downloadedIds]);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full overflow-hidden select-none">
      {/* Search Header */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search Surah by name, number (#18), or meaning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all outline-none ${
              isDayMode
                ? 'bg-stone-200 border-stone-300 text-stone-900 placeholder-stone-500 focus:border-emerald-500'
                : 'bg-[#0D1117] border-white/10 text-stone-100 placeholder-stone-500 focus:border-emerald-500'
            }`}
          />
        </div>

        {/* Driver Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All 114 Surahs' },
            { id: 'popular', label: '⭐ Frequently Read' },
            { id: 'downloaded', label: `💾 Downloaded (${downloadedIds.length})` },
            { id: 'meccan', label: 'Meccan' },
            { id: 'medinan', label: 'Medinan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] touch-manipulation ${
                filterType === item.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDayMode
                  ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Surah List Items */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredSurahs.length === 0 ? (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <p className="text-lg font-bold">No Surahs found</p>
            <p className="text-xs">Try adjusting your search query or filter settings.</p>
          </div>
        ) : (
          filteredSurahs.map((surah) => {
            const isCurrent = surah.id === currentSurahId;
            const isDownloaded = downloadedIds.includes(surah.id);
            const isDownloading = downloadingSurahId === surah.id;

            return (
              <div
                key={surah.id}
                id={`surah-item-${surah.id}`}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all active:scale-[0.99] touch-manipulation cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                    : isDayMode
                    ? 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-900'
                    : 'bg-[#0D1117] border-white/5 hover:border-white/15 hover:bg-white/5 text-stone-100'
                }`}
                onClick={() => onSelectSurah(surah)}
              >
                {/* Left: Surah Number & Names */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm font-mono border ${
                      isCurrent
                        ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                        : isDayMode
                        ? 'bg-stone-200 text-stone-800 border-stone-300'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    {surah.id}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base tracking-tight">{surah.englishName}</h3>
                      {isDownloaded && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" title="Offline Ready" />
                      )}
                    </div>
                    <p className="text-xs text-stone-400 font-medium">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
                    </p>
                  </div>
                </div>

                {/* Right: Arabic Name & Play / Download Buttons */}
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-serif text-emerald-400 tracking-wide hidden sm:inline">
                    {surah.name}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Download Button */}
                    {isDownloaded ? (
                      <span className="p-2 text-emerald-500" title="Downloaded for Offline">
                        <Check className="w-5 h-5" />
                      </span>
                    ) : isDownloading ? (
                      <span className="text-xs text-amber-400 font-bold animate-pulse px-2">
                        {downloadProgress !== null ? `${downloadProgress}%` : '...'}
                      </span>
                    ) : (
                      <button
                        onClick={() => onDownloadSurah(surah)}
                        className={`p-2.5 rounded-xl border transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                          isDayMode
                            ? 'bg-stone-200 text-stone-700 hover:bg-stone-300 border-stone-300'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border-stone-700'
                        }`}
                        title="Download for Offline Listening"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}

                    {/* Play Button */}
                    <button
                      onClick={() => onSelectSurah(surah)}
                      className={`p-3 rounded-xl font-bold transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isCurrent && isPlaying
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
