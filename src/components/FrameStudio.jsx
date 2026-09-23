import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, QrCode, Sparkles, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { usePhotoboothStore, FRAME_THEMES } from '../store/usePhotoboothStore';
import { generatePhotoboothStrip } from '../utils/canvasCombiner';

export function FrameStudio() {
  const {
    snapshots,
    selectedFrameTheme,
    setSelectedFrameTheme,
    combinedStripUrl,
    setCombinedStripUrl,
    autoRetouchEnabled,
    setAutoRetouchEnabled,
    retouchLevel,
    setRetouchLevel,
    setIsShareModalOpen,
    resetSnapshots,
    setActiveTab
  } = usePhotoboothStore();

  const [generating, setGenerating] = useState(false);

  // Generate strip whenever snapshots or theme changes
  useEffect(() => {
    let active = true;
    async function updateStrip() {
      setGenerating(true);
      try {
        const url = await generatePhotoboothStrip(snapshots, selectedFrameTheme);
        if (active) {
          setCombinedStripUrl(url);
        }
      } catch (err) {
        console.error('Strip generation error:', err);
      } finally {
        if (active) setGenerating(false);
      }
    }
    updateStrip();
    return () => {
      active = false;
    };
  }, [snapshots, selectedFrameTheme, setCombinedStripUrl]);

  const handleDownload = () => {
    if (!combinedStripUrl) return;
    const a = document.createElement('a');
    a.href = combinedStripUrl;
    a.download = `posebooth_4cut_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Buồng Ghép Khung Ảnh Hàn Quốc
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Xem lại bộ 4 ảnh, tùy chỉnh chủ đề khung trang trí & xuất sản phẩm hoàn chỉnh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetSnapshots();
              setActiveTab('camera');
            }}
            className="glass-card px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 border border-white/10"
          >
            <RefreshCw className="w-4 h-4" /> Chụp Lại Bộ Ảnh
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Photobooth Strip Preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="glass-panel p-4 rounded-3xl border border-white/10 shadow-2xl relative max-w-sm w-full">
            {generating && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 rounded-3xl flex flex-col items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                <span className="text-xs text-slate-300 font-semibold">Đang ghép khung ảnh AI...</span>
              </div>
            )}
            {combinedStripUrl ? (
              <img
                src={combinedStripUrl}
                alt="PoseBooth 4-Cut Strip"
                className="w-full h-auto rounded-2xl border border-white/10 shadow-lg object-contain max-h-[600px] mx-auto"
              />
            ) : (
              <div className="w-full h-[500px] bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                Đang nạp dữ liệu ảnh...
              </div>
            )}
          </div>
        </div>

        {/* Right column: Customization Options */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Frame Theme Selection */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-outfit text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Chọn Khung Ảnh Nghệ Thuật
              </h3>
              <span className="text-xs text-purple-300 font-semibold">{selectedFrameTheme.name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FRAME_THEMES.map((theme) => {
                const isSelected = theme.id === selectedFrameTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedFrameTheme(theme)}
                    className={`glass-card p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-purple-400 ring-2 ring-purple-400/50 scale-105'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${theme.bgGradient} mb-2`} />
                    <div className="text-xs font-bold text-slate-200 truncate">{theme.name}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{theme.badge}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Auto Retouching Controls */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-outfit text-slate-200">AI Tự Động Làm Đẹp & Cân Bằng Sáng</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRetouchEnabled}
                  onChange={(e) => setAutoRetouchEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {autoRetouchEnabled && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Mức độ can thiệp AI:</span>
                  <span className="font-bold text-purple-300">{retouchLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={retouchLevel}
                  onChange={(e) => setRetouchLevel(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Output Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="glass-button flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Tải Khung Ảnh Về Máy
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="glass-card py-3.5 px-5 rounded-2xl font-bold text-sm text-slate-200 hover:text-white flex items-center justify-center gap-2 border border-cyan-500/40 hover:border-cyan-400 transition-all glow-cyan"
            >
              <QrCode className="w-5 h-5 text-cyan-400" /> Quét Mã QR Chia Sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
