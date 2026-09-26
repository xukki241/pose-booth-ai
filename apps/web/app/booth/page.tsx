'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Camera, RotateCcw, Download, RefreshCw, ArrowLeft, Check, Grid3X3, X } from 'lucide-react';
import { usePoseDetection } from '@/lib/mediapipe/usePoseDetection';
import { usePoseScore } from '@/lib/mediapipe/usePoseScore';
import { HuaweiArContour, ViewfinderOrientation } from '@/components/pose/HuaweiArContour';
import { usePhotoBooth, CountdownDisplay } from '@/components/booth/PhotoBoothController';
import type { ShotMode, CapturedShot, PoseTemplate } from '@/types/pose';
import { mapCoverPoints } from '@/lib/camera-transform';
import { compositePhotos } from '@/lib/photo-composite';
import { FRAMES } from '@/lib/frames';
import { SaveGallery } from '@/components/booth/SaveGallery';
import { useCamera } from '@/lib/useCamera';
import { Button } from '@/components/ui/button';

const SHOT_MODES: { mode: ShotMode; label: string; badge: string }[] = [
  { mode: 'single', label: '1 Ảnh Đơn', badge: 'Quick' },
  { mode: 'triple', label: '3 Dải Strip', badge: 'Classic' },
  { mode: 'quad', label: '4 Ảnh Grid', badge: 'Collage' },
];

const FRAME_COLORS = [
  { id: 'dark', name: 'Obsidian Film', bg: 'bg-black', border: 'border-white/20' },
  { id: 'violet', name: 'Prism Violet', bg: 'bg-violet-950', border: 'border-violet-500/50' },
  { id: 'champagne', name: 'Champagne Gold', bg: 'bg-amber-950', border: 'border-amber-400/50' },
  { id: 'cyan', name: 'Cyber Cyan', bg: 'bg-cyan-950', border: 'border-cyan-500/50' },
];

const SAMPLE_POSES: PoseTemplate[] = [
  {
    id: 'power_pose',
    name: 'Power Stance',
    name_vi: 'Tư Thế Quyền Lực',
    category: 'portrait',
    difficulty: 'easy',
    description: 'Hai tay chống hông tự tin, mắt nhìn thẳng ống kính.',
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.22, 0.45], [0.78, 0.45],
      [0.32, 0.60], [0.68, 0.60], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
  {
    id: 'chic_vogue',
    name: 'Chic Vogue',
    name_vi: 'Góc Nghiêng Thời Trang',
    category: 'portrait',
    difficulty: 'medium',
    description: 'Nghiêng nhẹ người 15 độ, một tay chạm gò má hoặc tóc.',
    keypoints: [
      [0.52, 0.16], [0.50, 0.14], [0.54, 0.14],
      [0.46, 0.15], [0.58, 0.15], [0.38, 0.28],
      [0.64, 0.30], [0.30, 0.42], [0.68, 0.38],
      [0.48, 0.20], [0.62, 0.58], [0.40, 0.60],
      [0.60, 0.60], [0.42, 0.80], [0.58, 0.80],
      [0.44, 0.98], [0.56, 0.98]
    ],
  },
  {
    id: 'kpop_heart',
    name: 'Heart Hands',
    name_vi: 'Bắn Tim Đôi Tay',
    category: 'fun',
    difficulty: 'easy',
    description: 'Tạo hình trái tim nhỏ trước ngực, mỉm cười tươi tắn.',
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.36, 0.28],
      [0.64, 0.28], [0.40, 0.40], [0.60, 0.40],
      [0.48, 0.35], [0.52, 0.35], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
  {
    id: 'arms_wide',
    name: 'Arms Open',
    name_vi: 'Giang Rộng Tay',
    category: 'dynamic',
    difficulty: 'easy',
    description: 'Hai tay dang rộng sang hai bên, tràn đầy năng lượng tươi trẻ.',
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.12, 0.32], [0.88, 0.32],
      [0.05, 0.35], [0.95, 0.35], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
];


export default function BoothPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ready: cameraReady, loading: cameraLoading, error: cameraError, devices, start: startCamera, stop: stopCamera } = useCamera(videoRef);
  const [deviceId, setDeviceId] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(3);

  const [shotMode, setShotMode] = useState<ShotMode>('triple');
  const [completedShots, setCompletedShots] = useState<CapturedShot[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [orientation, setOrientation] = useState<ViewfinderOrientation>('portrait');
  const [showGrid, setShowGrid] = useState(false);

  const [showContour, setShowContour] = useState(true);
  const [contourOpacity, setContourOpacity] = useState(0.55);
  const [selectedPose, setSelectedPose] = useState<PoseTemplate>(SAMPLE_POSES[0]);
  const [activeFrame, setActiveFrame] = useState(FRAME_COLORS[0]);
  const [overlayPath, setOverlayPath] = useState<string | null>(null);
  const [composite, setComposite] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  useEffect(() => {
    const frame = FRAMES.find(frame => frame.id === new URLSearchParams(location.search).get('frame'));
    if (frame?.overlayPath) { setOverlayPath(frame.overlayPath); setShotMode('quad'); }
    const poseId = new URLSearchParams(location.search).get('pose');
    const controller = new AbortController();
    if (poseId) {
      const local = SAMPLE_POSES.find(pose => pose.id === poseId);
      if (local) setSelectedPose(local);
      else fetch('/api/pose/suggest?limit=100', { signal: controller.signal })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          const pose = data?.poses?.find((item: PoseTemplate) => item.id === poseId && item.keypoints?.length === 17);
          if (pose && !controller.signal.aborted) setSelectedPose(pose);
        }).catch(() => { /* Keep the explicitly displayed built-in default if catalog is unavailable. */ });
    }
    return () => controller.abort();
  }, []);
  useEffect(() => {
    let disposed = false;
    setComposite(null); setExportError(null);
    if (completedShots.length) {
      const colors: Record<string, string> = { dark: '#171717', violet: '#3b0764', champagne: '#451a03', cyan: '#083344' };
      compositePhotos(completedShots.map(shot => shot.imageData), colors[activeFrame.id], overlayPath)
        .then(image => { if (!disposed) setComposite(image); })
        .catch(error => { if (!disposed) setExportError(error.message); });
    }
    return () => { disposed = true; };
  }, [completedShots, activeFrame, overlayPath]);

  // MediaPipe live pose detection
  const { confidence, isLoading: isPoseModelLoading, fps, cocoKeypoints, error: poseError } = usePoseDetection(
    videoRef,
    cameraReady && showContour
  );

  const displayPoints = useMemo(() => mapCoverPoints(cocoKeypoints,
    videoRef.current?.videoWidth ?? 0, videoRef.current?.videoHeight ?? 0,
    orientation === 'portrait' ? 3 : 16, orientation === 'portrait' ? 4 : 9, facingMode === 'user'),
    [cocoKeypoints, orientation, facingMode]);
  const { score: measuredScore, feedback } = usePoseScore(cameraReady && showContour, displayPoints, selectedPose, `${orientation}:${facingMode}:${deviceId}`);
  const liveScore = measuredScore ?? 0;
  const guidanceHint = feedback[0];

  const handleShotsComplete = useCallback((shots: CapturedShot[]) => { setCompletedShots(shots); }, []);

  // Photobooth state machine
  const { state, countdown, currentShot, totalShots, start, reset, error: captureError } = usePhotoBooth({
    videoRef,
    mode: shotMode,
    onComplete: handleShotsComplete,
    mirror: facingMode === 'user',
    countdownSeconds: timerSeconds,
  });

  const toggleFacingMode = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next); setDeviceId('');
    if (cameraReady) void startCamera(next);
  };

  const downloadShot = useCallback((shot: CapturedShot, index: number) => {
    const a = document.createElement('a');
    a.href = shot.imageData;
    a.download = `posebooth_shot_${index + 1}.jpg`;
    a.click();
  }, []);

  const downloadAll = useCallback(() => {
    if (!composite) return;
    const link = document.createElement('a'); link.href = composite;
    link.download = 'posebooth-frame.jpg'; link.click();
  }, [composite]);

  const capturing = state === 'countdown' || state === 'capturing';
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <nav aria-label="Studio navigation" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold"><ArrowLeft className="size-4" /> Pose-Booth</Link>
          <div className="flex items-center gap-4 text-sm"><Link href="/frames" className="text-muted-foreground hover:text-foreground">Thư viện khung</Link><Link href="/pose-studio" className="text-muted-foreground hover:text-foreground">Luyện dáng</Link></div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 p-4 pb-24 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-3xl font-bold tracking-tight">Khoảnh khắc của bạn.</h1><p className="mt-1 text-sm text-muted-foreground">Chọn dáng, nhìn vào máy ảnh và để chúng tôi đếm ngược.</p></div>
          <p role="status" className="text-xs font-mono text-muted-foreground">{cameraReady ? `Camera đã kết nối · ${fps} FPS pose` : 'Ảnh chỉ lưu khi bạn chủ động chọn'}</p>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-label="Camera" className="min-w-0 space-y-3">
            <div className={`relative mx-auto overflow-hidden rounded-2xl border border-border bg-muted ${orientation === 'landscape' ? 'aspect-video w-full' : 'aspect-[3/4] w-full max-w-[520px]'}`}>
              <video ref={videoRef} muted playsInline className={`absolute inset-0 h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${cameraReady ? '' : 'invisible'}`} />
              <canvas ref={canvasRef} width={orientation === 'landscape' ? 1280 : 720} height={orientation === 'landscape' ? 720 : 960} className="pointer-events-none absolute inset-0 h-full w-full" />
              {cameraReady && <HuaweiArContour landmarks={showContour ? displayPoints : []} targetLandmarks={showContour ? selectedPose.keypoints : []} canvasRef={canvasRef} width={orientation === 'landscape' ? 1280 : 720} height={orientation === 'landscape' ? 720 : 960} opacity={contourOpacity} score={liveScore} showScoreHud={false} orientation={orientation} showGrid={showGrid} />}
              {!cameraReady && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="rounded-full border border-border bg-background p-5"><Camera className="size-8" /></div>
                <h2 className="text-xl font-semibold">Bắt đầu bằng một nụ cười</h2>
                <p className="max-w-xs text-sm text-muted-foreground">Camera xử lý trên thiết bị. Chưa có ảnh nào được lưu hay gửi để training.</p>
                {cameraError && <p role="alert" className="max-w-sm text-sm text-destructive">{cameraError}</p>}
                <Button onClick={() => startCamera(facingMode, deviceId || undefined)} disabled={cameraLoading}><Camera data-icon="inline-start" />{cameraLoading ? 'Đang chờ quyền camera…' : 'Mở camera'}</Button>
                {cameraLoading && <Button variant="ghost" onClick={stopCamera}>Hủy yêu cầu</Button>}
              </div>}
              {cameraReady && <div className="absolute left-3 top-3 rounded-lg bg-background/90 px-3 py-2 text-xs backdrop-blur"><span className="font-semibold">{selectedPose.name_vi}</span><span className="ml-2 text-muted-foreground">{showContour ? measuredScore === null ? 'Chưa có điểm' : `${measuredScore}% khớp dáng` : 'Hướng dẫn đã tắt'}</span></div>}
              {state === 'countdown' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm" role="status" aria-live="assertive"><CountdownDisplay countdown={countdown} total={timerSeconds} /><p className="font-medium">Ảnh {currentShot + 1} / {totalShots}</p></div>}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={capturing} onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}>{orientation === 'portrait' ? 'Dọc 3:4' : 'Ngang 16:9'}</Button>
              <Button variant={showGrid ? 'secondary' : 'outline'} size="sm" aria-pressed={showGrid} onClick={() => setShowGrid(!showGrid)}><Grid3X3 data-icon="inline-start" />Lưới</Button>
              <Button variant="outline" size="sm" disabled={capturing || cameraLoading} onClick={toggleFacingMode}><RefreshCw data-icon="inline-start" />Đổi camera</Button>
              {cameraReady && <Button variant="ghost" size="sm" disabled={capturing} onClick={stopCamera}>Tắt camera</Button>}
            </div>
            <p className="min-h-5 text-center text-sm text-muted-foreground" role="status">{poseError || (isPoseModelLoading && cameraReady ? 'Đang tải model hướng dẫn local…' : guidanceHint || 'Hướng dẫn dáng chỉ để tham khảo. Bạn luôn quyết định lúc chụp.')}</p>
          </section>
          <aside className="space-y-6 rounded-2xl border border-border bg-card p-5 text-card-foreground">
            <fieldset disabled={capturing} className="space-y-3"><legend className="mb-3 font-semibold">Bạn muốn chụp kiểu nào?</legend>
              <div className="grid grid-cols-3 gap-2">{SHOT_MODES.map(item => <Button key={item.mode} variant={shotMode === item.mode ? 'default' : 'outline'} size="sm" aria-pressed={shotMode === item.mode} onClick={() => { setShotMode(item.mode); if (item.mode !== 'quad') setOverlayPath(null); }}>{item.mode === 'single' ? '1 ảnh' : item.mode === 'triple' ? '3 ảnh' : '4 ảnh'}</Button>)}</div>
              <label className="flex items-center justify-between gap-3 text-sm">Đếm ngược<select value={timerSeconds} onChange={event => setTimerSeconds(Number(event.target.value))} className="rounded-md border border-input bg-background p-2">{[2, 3, 5, 10].map(seconds => <option key={seconds} value={seconds}>{seconds} giây</option>)}</select></label>
              {devices.length > 1 && <label className="block text-sm">Thiết bị<select className="mt-2 w-full rounded-md border border-input bg-background p-2" value={deviceId} onChange={event => { setDeviceId(event.target.value); void startCamera(facingMode, event.target.value || undefined); }}><option value="">Tự chọn camera</option>{devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}</select></label>}
            </fieldset>
            <fieldset disabled={capturing} className="space-y-3 border-t border-border pt-5"><legend className="font-semibold">Dáng tham khảo</legend>
              <p className="text-sm text-muted-foreground" role="status">Đang chọn: <span className="font-semibold text-foreground">{selectedPose.name_vi}</span></p>
              <div className="grid grid-cols-2 gap-2">{SAMPLE_POSES.map(pose => <button key={pose.id} aria-pressed={selectedPose.id === pose.id} onClick={() => setSelectedPose(pose)} className={`rounded-lg border p-3 text-left text-sm transition-colors ${selectedPose.id === pose.id ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border hover:bg-accent'}`}><span className="block font-semibold">{pose.name_vi}</span></button>)}</div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showContour} onChange={event => setShowContour(event.target.checked)} />Hiện hướng dẫn dáng</label>
              {showContour && <label className="flex items-center gap-3 text-sm">Độ mờ<input aria-label="Độ mờ hướng dẫn" className="min-w-0 flex-1 accent-primary" type="range" min="0.1" max="1" step="0.05" value={contourOpacity} onChange={event => setContourOpacity(Number(event.target.value))} /></label>}
            </fieldset>
            <fieldset disabled={capturing} className="space-y-3 border-t border-border pt-5"><legend className="font-semibold">Khung ảnh</legend>
              <div className="flex gap-3">{FRAME_COLORS.map(frame => <button key={frame.id} title={frame.name} aria-label={frame.name} aria-pressed={activeFrame.id === frame.id} onClick={() => setActiveFrame(frame)} className={`flex size-9 items-center justify-center rounded-full border-2 ${frame.bg} ${activeFrame.id === frame.id ? 'border-primary ring-2 ring-ring ring-offset-2 ring-offset-background' : 'border-border'}`}>{activeFrame.id === frame.id && <Check className="size-4 text-white" />}</button>)}</div>
              <Link href="/frames" className="inline-block text-sm underline underline-offset-4">Chọn khung có họa tiết</Link>
              {overlayPath && <p className="text-sm text-muted-foreground">Đã chọn khung 4 ảnh. <button className="underline" onClick={() => setOverlayPath(null)}>Bỏ khung</button></p>}
            </fieldset>
            <div className="space-y-2 border-t border-border pt-5">
              {capturing ? <Button className="w-full" variant="outline" onClick={reset}><X data-icon="inline-start" />Hủy lượt chụp</Button> :
                <Button size="lg" className="w-full" disabled={!cameraReady || state === 'review'} onClick={() => { setCompletedShots([]); void start(); }}><Camera data-icon="inline-start" />Chụp {totalShots} ảnh</Button>}
              <p className="text-center text-xs text-muted-foreground">Mỗi ảnh cách nhau {timerSeconds} giây đếm ngược.</p>
              {captureError && <p role="alert" className="text-sm text-destructive">{captureError}</p>}
            </div>
          </aside>
        </div>
        <section id="review" aria-label="Xem lại ảnh" className="rounded-2xl border border-border bg-card p-5 text-card-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Dải kỷ niệm của bạn</h2><p className="mt-1 text-sm text-muted-foreground">{completedShots.length ? 'Xem lại trước khi lưu. Ảnh gốc vẫn tải riêng được.' : 'Ảnh vừa chụp sẽ xuất hiện ở đây.'}</p></div>
            {completedShots.length > 0 && <Button variant="outline" onClick={() => { reset(); setCompletedShots([]); }}><RotateCcw data-icon="inline-start" />Chụp lại</Button>}</div>
          {completedShots.length > 0 && <div className="mt-5 grid gap-6 md:grid-cols-2"><div className="grid grid-cols-2 gap-3">{completedShots.map((shot, index) => <figure key={shot.id} className="space-y-2"><img src={shot.imageData} alt={`Ảnh chụp ${index + 1}`} className="w-full rounded-lg" /><figcaption><Button variant="ghost" size="sm" onClick={() => downloadShot(shot, index)}><Download data-icon="inline-start" />Ảnh gốc {index + 1}</Button></figcaption></figure>)}</div>
            <div className="space-y-4">{composite && <><img src={composite} alt="Ảnh ghép đúng với file xuất" className="mx-auto max-h-[480px] max-w-full rounded-lg" /><Button onClick={downloadAll} className="w-full"><Download data-icon="inline-start" />Tải ảnh có khung</Button><SaveGallery image={composite} /></>}{exportError && <p role="alert" className="text-destructive">{exportError}</p>}</div></div>}
        </section>
      </main>
      {cameraReady && <div className="fixed bottom-3 left-4 right-20 z-40 rounded-xl border border-border bg-background/95 p-2 shadow-sm backdrop-blur lg:hidden">
        {capturing ? <Button className="w-full" variant="outline" onClick={reset}>Hủy · Ảnh {currentShot + 1}/{totalShots}</Button> : state === 'review' ? <a href="#review" className="block py-2 text-center text-sm font-semibold">Xem ảnh vừa chụp</a> : <Button className="w-full" onClick={() => { setCompletedShots([]); void start(); }}><Camera data-icon="inline-start" />Chụp {totalShots} ảnh</Button>}
      </div>}
    </div>
  );
}
