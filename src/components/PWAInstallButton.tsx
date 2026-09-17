import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share, ArrowUpRight, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already opened from phone home screen (standalone mode), no install button is needed
  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTrigger}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs"
        title="Install to phone home screen to remove browser search bar"
      >
        <Download className="w-3.5 h-3.5 text-emerald-300" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* HOW TO REMOVE BROWSER SEARCH BAR MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 text-left text-slate-800 dark:text-slate-100">
            
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-[#007c82] dark:text-teal-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Hide Browser Search Bar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                When you open a website directly inside Chrome or Safari, the browser displays its address and search bar by default. To hide it completely, add this app to your phone's home screen:
              </p>
            </div>

            {/* Android vs iOS Instructions */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-[#003b5c] dark:text-teal-300 flex items-center gap-1.5">
                  <span>Android (Chrome / Edge / Samsung)</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Tap the <strong>three dots menu (⋮)</strong> at the top right of your browser.</li>
                  <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                  <li>Tap the new <strong>UENR Timetable</strong> icon on your phone screen.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-[#003b5c] dark:text-teal-300 flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5" />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Tap the <strong>Share button</strong> (square with arrow pointing up) at the bottom.</li>
                  <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                  <li>Tap <strong>Add</strong> at top-right, then open the app from your home screen.</li>
                </ol>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Once launched from your home screen, the browser search bar will disappear completely!</span>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#003b5c] hover:bg-[#002d47] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Got It
            </button>

          </div>
        </div>
      )}
    </>
  );
};
