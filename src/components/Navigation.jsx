import React from 'react';
import { Camera, Image, Film, Sparkles, ShieldCheck } from 'lucide-react';
import { usePhotoboothStore } from '../store/usePhotoboothStore';

export function Navigation() {
  const { activeTab, setActiveTab, snapshots } = usePhotoboothStore();

  const completedCount = snapshots.filter(Boolean).length;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('camera')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center shadow-lg glow-purple">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-outfit bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                PoseBooth AI
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                EXE101
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Buồng Chụp Ảnh AI Real-time</span>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> WebCam AI
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 relative ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" /> Khung 4 Kiểu
            {completedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {completedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('videoguide')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'videoguide'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" /> Storyboard Video
          </button>
        </nav>

        {/* Client-side Privacy badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Client-side AI (Bảo mật 100%)</span>
        </div>
      </div>
    </header>
  );
}
