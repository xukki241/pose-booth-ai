import React from 'react';
import { usePhotoboothStore } from './store/usePhotoboothStore';
import { Navigation } from './components/Navigation';
import { CameraView } from './components/CameraView';
import { FrameStudio } from './components/FrameStudio';
import { VideoGuideStudio } from './components/VideoGuideStudio';
import { ShareModal } from './components/ShareModal';

export default function App() {
  const { activeTab } = usePhotoboothStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-inter">
      {/* Navigation Header */}
      <Navigation />

      {/* Main Content Viewport */}
      <main className="flex-1 py-4">
        {activeTab === 'camera' && <CameraView />}
        {activeTab === 'studio' && <FrameStudio />}
        {activeTab === 'videoguide' && <VideoGuideStudio />}
      </main>

      {/* Footer Branding */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-slate-400">
        <p>
          PoseBooth AI — Đồ án khởi nghiệp môn <strong className="text-purple-400">EXE101</strong> (Hà Nội, 2026)
        </p>
      </footer>

      {/* Modals */}
      <ShareModal />
    </div>
  );
}
