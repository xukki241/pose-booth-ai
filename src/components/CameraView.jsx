import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { usePhotoboothStore } from '../store/usePhotoboothStore';
import { usePoseDetector } from '../hooks/usePoseDetector';
import { evaluatePose } from '../services/poseMatcher';
import { PoseOverlay } from './PoseOverlay';
import { ScoreBadge } from './ScoreBadge';

export function CameraView() {
  const videoRef = useRef(null);
  const [streamStarted, setStreamStarted] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [flash, setFlash] = useState(false);

  const {
    selectedPreset,
    setSelectedPreset,
    currentPoseIndex,
    setCurrentPoseIndex,
    currentScore,
    setCurrentScore,
    feedbackText,
    setFeedbackText,
    isCountingDown,
    countdownSec,
    setIsCountingDown,
    setCountdownSec,
    snapshots,
    setSnapshot,
    setActiveTab
  } = usePhotoboothStore();

  const activePose = selectedPreset.poses[currentPoseIndex] || selectedPreset.poses[0];

  // MediaPipe detection callback
  const handlePoseResults = useCallback(
    (results) => {
      if (results && results.landmarks && results.landmarks[0]) {
        const pts = results.landmarks[0];
        setLandmarks(pts);
        const evalRes = evaluatePose(pts, activePose.id);
        setCurrentScore(evalRes.score);
        setFeedbackText(evalRes.feedback);
      } else {
        setLandmarks(null);
        setCurrentScore(0);
        setFeedbackText('Hãy đứng trước máy ảnh để AI nhận diện...');
      }
    },
    [activePose, setCurrentScore, setFeedbackText]
  );

  usePoseDetector(videoRef, handlePoseResults);

  // Start WebCam
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamStarted(true);
      }
    } catch (err) {
      console.error('Camera permission error:', err);
      setCameraError('Không thể mở Camera. Vui lòng cấp quyền truy cập máy ảnh trong trình duyệt!');
    }
  };

  // Capture current frame from Video to Snapshot Canvas
  const capturePhoto = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    // Mirror horizontal flip for selfie view
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSnapshot(currentPoseIndex, dataUrl);

    // Auto switch to next pose or complete photobooth flow
    if (currentPoseIndex < 3) {
      setCurrentPoseIndex(currentPoseIndex + 1);
    } else {
      setActiveTab('studio'); // All 4 shots done! Go to frame studio
    }
  };

  // Start 5-sec countdown
  const triggerCountdown = () => {
    if (isCountingDown) return;
    setIsCountingDown(true);
    setCountdownSec(5);

    let sec = 5;
    const timer = setInterval(() => {
      sec -= 1;
      setCountdownSec(sec);
      if (sec === 0) {
        clearInterval(timer);
        setIsCountingDown(false);
        capturePhoto();
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            WebCam AI Pose Guidance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Căn chỉnh tư thế chuẩn khớp hình bóng mẫu để chụp ảnh đẹp ngay lần đầu.
          </p>
        </div>

        {/* Pose Preset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Bộ tư thế:</span>
          <select
            value={selectedPreset.id}
            onChange={(e) => {
              const p = usePhotoboothStore.getState().selectedPreset;
              const found = [selectedPreset].find(item => item.id === e.target.value) || usePhotoboothStore.getState().setSelectedPreset;
              const presetList = [
                usePhotoboothStore.getState().selectedPreset,
                ...usePhotoboothStore.getState().selectedPreset ? [] : []
              ];
            }}
            className="hidden"
          />
          <div className="flex gap-2">
            {usePhotoboothStore.getState().selectedPreset && (
              <span className="glass-card px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                {selectedPreset.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[540px] bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl glass-panel flex items-center justify-center">
        {/* Flash Effect */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Camera Feed or Permission Prompt */}
        {!streamStarted ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md z-10">
            <div className="p-4 bg-purple-500/10 rounded-full border border-purple-500/30 mb-4 glow-purple">
              <Camera className="w-12 h-12 text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-slate-100 mb-2">
              Sẵn sàng kết nối Camera?
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              PoseBooth AI chạy hoàn toàn trên trình duyệt thiết bị của bạn. Hình ảnh của bạn được bảo mật 100%.
            </p>
            {cameraError && (
              <div className="bg-rose-500/20 text-rose-300 text-xs p-3 rounded-xl mb-4 border border-rose-500/30">
                {cameraError}
              </div>
            )}
            <button
              onClick={startCamera}
              className="glass-button px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 text-sm"
            >
              <Camera className="w-4 h-4" /> Bật WebCam Ngay
            </button>
          </div>
        ) : (
          <>
            {/* Mirror flip video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {/* Pose Overlay */}
            <PoseOverlay landmarks={landmarks} targetScore={activePose.targetScore} />
          </>
        )}

        {/* Countdown Large Overlay */}
        <AnimatePresence>
          {isCountingDown && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-8xl sm:text-9xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 glow-cyan">
                  {countdownSec}
                </span>
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
                  Giữ nguyên dáng chuẩn!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4-Shot Progress Thumbnails overlay at top left */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          {selectedPreset.poses.map((pose, idx) => {
            const hasSnap = Boolean(snapshots[idx]);
            const isCurrent = idx === currentPoseIndex;
            return (
              <button
                key={pose.id}
                onClick={() => setCurrentPoseIndex(idx)}
                className={`relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden border transition-all ${
                  isCurrent
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                    : hasSnap
                    ? 'border-emerald-400/80 opacity-90'
                    : 'border-white/20 bg-slate-900/60'
                }`}
              >
                {hasSnap ? (
                  <img src={snapshots[idx]} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] font-bold text-slate-400">
                    <span>{idx + 1}/4</span>
                  </div>
                )}
                {hasSnap && (
                  <div className="absolute top-0.5 right-0.5 bg-emerald-500 rounded-full p-0.5">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Pose Guide Banner at bottom of camera */}
        <div className="absolute bottom-4 left-4 right-4 z-20 glass-panel p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 border border-white/10">
          <div className="text-left w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border border-purple-500/30">
                Kiểu {currentPoseIndex + 1}/4: {activePose.name}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 font-medium">{activePose.tip}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={triggerCountdown}
              disabled={!streamStarted || isCountingDown}
              className="glass-button px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" /> Bấm Chụp (Đếm ngược 5s)
            </button>
          </div>
        </div>
      </div>

      {/* Live Score Badge & Feedback */}
      <ScoreBadge score={currentScore} feedback={feedbackText} />
    </div>
  );
}
