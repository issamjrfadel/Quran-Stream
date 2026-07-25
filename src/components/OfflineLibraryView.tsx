import React, { useState, useEffect } from 'react';
import { DownloadCloud, HardDrive, Trash2, Play, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { DownloadedSurah, Surah, Reciter } from '../types';
import { SURAHS, RECITERS } from '../data/quranData';
import { getAllDownloadedSurahs, deleteDownloadedSurah, clearAllOfflineSurahs } from '../lib/offlineStorage';

interface OfflineLibraryViewProps {
  isDayMode: boolean;
  simulatedOfflineMode: boolean;
  onToggleOfflineSim: () => void;
  onSelectSurah: (surah: Surah) => void;
  onBatchDownloadSurahs: (surahs: Surah[]) => void;
}

export const OfflineLibraryView: React.FC<OfflineLibraryViewProps> = ({
  isDayMode,
  simulatedOfflineMode,
  onToggleOfflineSim,
  onSelectSurah,
  onBatchDownloadSurahs,
}) => {
  const [downloadedList, setDownloadedList] = useState<DownloadedSurah[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOfflineData = async () => {
    setIsLoading(true);
    const items = await getAllDownloadedSurahs();
    setDownloadedList(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOfflineData();
  }, []);

  const totalBytes = downloadedList.reduce((acc, item) => acc + item.sizeBytes, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  const handleDelete = async (surahId: number, reciterId: string) => {
    await deleteDownloadedSurah(surahId, reciterId);
    await loadOfflineData();
  };

  const handleClearAll = async () => {
    if (confirm('Delete all offline downloaded Quran audio files?')) {
      await clearAllOfflineSurahs();
      await loadOfflineData();
    }
  };

  const handleDownloadEssentialDrivePack = () => {
    // Al-Fatiha, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Waqi'a, Al-Mulk, Quls
    const drivePackIds = [1, 18, 36, 55, 56, 67, 112, 113, 114];
    const surahsToDownload = SURAHS.filter((s) => drivePackIds.includes(s.id));
    onBatchDownloadSurahs(surahsToDownload);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full overflow-hidden select-none">
      {/* Offline Storage Status Card */}
      <div
        className={`p-6 rounded-3xl border mb-6 transition-all ${
          isDayMode
            ? 'bg-stone-100 border-stone-200 text-stone-900 shadow-md'
            : 'bg-gradient-to-r from-stone-900 via-stone-950 to-emerald-950/50 border-stone-800 text-stone-100 shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <HardDrive className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Offline Quran Storage</h2>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                {downloadedList.length} Surahs saved offline • {totalMB} MB storage used
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Simulated Offline Mode Switch */}
            <button
              onClick={onToggleOfflineSim}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all min-h-[48px] touch-manipulation ${
                simulatedOfflineMode
                  ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/30'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{simulatedOfflineMode ? 'Offline Mode Active' : 'Simulate No-Internet'}</span>
            </button>

            {downloadedList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2.5 rounded-2xl bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800/40 min-h-[48px] min-w-[48px] flex items-center justify-center transition-all"
                title="Clear All Offline Files"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Essential Driver Batch Download Button */}
        <div className="mt-6 pt-4 border-t border-stone-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-400 font-medium">
            💡 Driving on remote highways? Download the essential driver pack (Kahf, Yasin, Mulk, Rahman & Quls).
          </p>
          <button
            onClick={handleDownloadEssentialDrivePack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wide shadow-lg active:scale-95 transition-all min-h-[44px] flex items-center justify-center gap-2"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Download Driver Pack (9 Surahs)</span>
          </button>
        </div>
      </div>

      {/* Downloaded Surahs List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider">
            Downloaded Surahs ({downloadedList.length})
          </h3>
          <button
            onClick={loadOfflineData}
            className="text-xs text-stone-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-stone-400">
            <p className="animate-pulse font-bold">Checking local storage...</p>
          </div>
        ) : downloadedList.length === 0 ? (
          <div className="text-center py-12 text-stone-400 space-y-3 bg-stone-900/40 rounded-3xl border border-stone-800 p-8">
            <DownloadCloud className="w-12 h-12 mx-auto text-stone-600" />
            <p className="text-base font-bold text-stone-300">No Surahs stored offline yet</p>
            <p className="text-xs max-w-sm mx-auto">
              Download Surahs from the 114 Surahs list or click "Download Driver Pack" above to enjoy uninterrupted playback in tunnels and rural areas without internet.
            </p>
          </div>
        ) : (
          downloadedList.map((item) => {
            const surah = SURAHS.find((s) => s.id === item.surahId);
            const reciter = RECITERS.find((r) => r.id === item.reciterId) || RECITERS[0];
            if (!surah) return null;

            const sizeMB = (item.sizeBytes / (1024 * 1024)).toFixed(1);

            return (
              <div
                key={`${item.reciterId}_${item.surahId}`}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isDayMode
                    ? 'bg-stone-100 border-stone-200 text-stone-900'
                    : 'bg-stone-900/80 border-stone-800 text-stone-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {surah.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base tracking-tight">{surah.englishName}</h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-stone-400 font-medium">
                      {reciter.name} • {sizeMB} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectSurah(surah)}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Play Offline Audio"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.surahId, item.reciterId)}
                    className="p-3 rounded-xl bg-stone-800 hover:bg-red-900/40 text-stone-400 hover:text-red-400 border border-stone-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all"
                    title="Delete Offline Copy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
