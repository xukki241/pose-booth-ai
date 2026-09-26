"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Camera, ArrowLeft, ArrowRight, RefreshCw, Grid3X3 } from "lucide-react";
import { usePoseDetection } from "@/lib/mediapipe/usePoseDetection";
import { usePoseScore } from "@/lib/mediapipe/usePoseScore";
import { HuaweiArContour, type ViewfinderOrientation } from "@/components/pose/HuaweiArContour";
import type { PoseTemplate } from "@/types/pose";
import { mapCoverPoints } from "@/lib/camera-transform";
import { useCamera } from "@/lib/useCamera";
import { Button, buttonVariants } from "@/components/ui/button";

const ANATOMICAL_RICH_POSES: PoseTemplate[] = [
  {
    id: "power_pose",
    name: "Power Stance",
    name_vi: "Tư Thế Quyền Lực",
    category: "portrait",
    difficulty: "easy",
    description: "Đứng thẳng, hai tay chống hông tự tin, mắt nhìn thẳng ống kính.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.34, 0.28],
      [0.66, 0.28], [0.22, 0.44], [0.78, 0.44],
      [0.30, 0.58], [0.70, 0.58], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "crossed_arms",
    name: "Arms Crossed",
    name_vi: "Khoanh Tay Quyến Rũ",
    category: "portrait",
    difficulty: "easy",
    description: "Hai tay khoanh nhẹ trước ngực, người hơi nghiêng, mắt tự tin.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.30, 0.42], [0.70, 0.42],
      [0.56, 0.43], [0.44, 0.43], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "chic_vogue",
    name: "Chic Vogue",
    name_vi: "Góc Nghiêng Thời Trang",
    category: "portrait",
    difficulty: "medium",
    description: "Nghiêng nhẹ người 15 độ, một tay chạm gò má hoặc tóc.",
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
    id: "kpop_heart",
    name: "Heart Hands",
    name_vi: "Bắn Tim Đôi Tay",
    category: "fun",
    difficulty: "easy",
    description: "Tạo hình trái tim nhỏ trước ngực, mỉm cười tươi tắn.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.36, 0.28],
      [0.64, 0.28], [0.38, 0.40], [0.62, 0.40],
      [0.46, 0.36], [0.54, 0.36], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
  {
    id: "peace_sign",
    name: "Peace Sign",
    name_vi: "Dấu Chữ V Đáng Yêu",
    category: "fun",
    difficulty: "easy",
    description: "Giơ tay làm dấu chữ V cạnh khuôn mặt, nghiêng nhẹ đầu.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.30, 0.45], [0.74, 0.30],
      [0.32, 0.58], [0.68, 0.15], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "arms_wide",
    name: "Arms Wide Open",
    name_vi: "Giang Rộng Tay",
    category: "dynamic",
    difficulty: "easy",
    description: "Đứng thẳng, giang rộng hai tay tạo cảm giác thoải mái và cởi mở.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.15, 0.32], [0.85, 0.32],
      [0.08, 0.35], [0.92, 0.35], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "hands_up",
    name: "Hands Up Celebration",
    name_vi: "Ăn Mừng Chiến Thắng",
    category: "dynamic",
    difficulty: "easy",
    description: "Giơ hai tay lên cao ăn mừng, biểu cảm vui vẻ, phấn chấn.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.36, 0.30],
      [0.64, 0.30], [0.26, 0.18], [0.74, 0.18],
      [0.22, 0.08], [0.78, 0.08], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "Tất Cả" },
  { id: "portrait", label: "Chân Dung" },
  { id: "dynamic", label: "Năng Động" },
  { id: "fun", label: "Vui Nhộn" },
];


export default function PoseStudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camera = useCamera(videoRef);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [orientation, setOrientation] = useState<ViewfinderOrientation>("landscape");
  const [showGrid, setShowGrid] = useState(false);
  const [showContour, setShowContour] = useState(true);
  const [opacity, setOpacity] = useState(.55);
  const [selectedPose, setSelectedPose] = useState<PoseTemplate>(ANATOMICAL_RICH_POSES[0]);
  const [poses, setPoses] = useState<PoseTemplate[]>(ANATOMICAL_RICH_POSES);
  const [catalogStatus, setCatalogStatus] = useState("Đang tải thư viện");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const detection = usePoseDetection(videoRef, camera.ready && showContour);
  const points = useMemo(() => mapCoverPoints(detection.cocoKeypoints,
    videoRef.current?.videoWidth ?? 0, videoRef.current?.videoHeight ?? 0,
    orientation === "portrait" ? 3 : 16, orientation === "portrait" ? 4 : 9, facingMode === "user"),
    [detection.cocoKeypoints, orientation, facingMode]);
  const { score, feedback } = usePoseScore(camera.ready && showContour, points, selectedPose, `${orientation}:${facingMode}`);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/pose/suggest?limit=100", { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Catalog unavailable"); return response.json(); })
      .then(data => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data.poses) || !data.poses.length) throw new Error("Empty catalog");
        const valid = data.poses.filter((pose: PoseTemplate) => typeof pose.name_vi === "string" && pose.keypoints?.length === 17);
        if (!valid.length) throw new Error("Invalid catalog");
        setPoses(valid); setCatalogStatus("Thư viện từ studio");
      })
      .catch(() => { if (!controller.signal.aborted) setCatalogStatus("API chưa sẵn sàng; đang dùng dáng minh họa có sẵn"); });
    return () => controller.abort();
  }, []);
  const visiblePoses = poses.filter(pose =>
    (category === "all" || pose.category === category) &&
    (pose.name_vi + " " + pose.name).toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const flip = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next); if (camera.ready) void camera.start(next);
  };

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-bold"><ArrowLeft className="size-4" />Pose-Booth</Link>
      <Link href={`/booth?pose=${encodeURIComponent(selectedPose.id)}`} className={buttonVariants({ size: "sm" })}>Chụp dáng này<ArrowRight className="ml-2 size-4" /></Link>
    </nav></header>
    <main className="mx-auto max-w-7xl space-y-6 p-4 pb-24 sm:p-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Tìm dáng thật tự nhiên.</h1><p className="mt-1 text-sm text-muted-foreground">Thử một dáng, điều chỉnh theo hướng dẫn rồi chuyển sang phòng chụp.</p></div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-4" aria-label="Luyện dáng với camera">
          <div className={`relative mx-auto overflow-hidden rounded-2xl border border-border bg-muted ${orientation === "portrait" ? "aspect-[3/4] w-full max-w-[480px]" : `aspect-video w-full ${camera.ready ? '' : 'min-h-80'}`}`}>
            <video ref={videoRef} muted playsInline className={`absolute inset-0 size-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""} ${camera.ready ? "" : "invisible"}`} />
            <canvas ref={canvasRef} width={orientation === "portrait" ? 720 : 1280} height={orientation === "portrait" ? 960 : 720} className="pointer-events-none absolute inset-0 size-full" />
            {camera.ready && <HuaweiArContour landmarks={showContour ? points : []} targetLandmarks={showContour ? selectedPose.keypoints : []} canvasRef={canvasRef} width={orientation === "portrait" ? 720 : 1280} height={orientation === "portrait" ? 960 : 720} opacity={opacity} score={score ?? 0} showScoreHud={false} orientation={orientation} showGrid={showGrid} />}
            {!camera.ready && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
              <Camera className="size-8" /><h2 className="text-lg font-semibold">Không cần tạo dáng hoàn hảo ngay</h2>
              <p className="max-w-xs text-sm text-muted-foreground">Bật camera để thử. Trang này không lưu ảnh của bạn.</p>
              {camera.error && <p className="max-w-sm text-sm text-destructive" role="alert">{camera.error}</p>}
              <Button disabled={camera.loading} onClick={() => camera.start(facingMode)}>{camera.loading ? "Đang chờ quyền…" : "Mở camera"}</Button>
              {camera.loading && <Button variant="ghost" onClick={camera.stop}>Hủy yêu cầu</Button>}
            </div>}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}>{orientation === "portrait" ? "Dọc 3:4" : "Ngang 16:9"}</Button>
            <Button variant={showGrid ? "secondary" : "outline"} aria-pressed={showGrid} size="sm" onClick={() => setShowGrid(!showGrid)}><Grid3X3 data-icon="inline-start" />Lưới</Button>
            <Button variant="outline" size="sm" disabled={camera.loading} onClick={flip}><RefreshCw data-icon="inline-start" />Đổi camera</Button>
            {camera.ready && <Button variant="ghost" size="sm" onClick={camera.stop}>Tắt camera</Button>}
          </div>
          <div className="space-y-3 rounded-xl border border-border bg-card p-5 text-card-foreground">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{selectedPose.name_vi}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedPose.description}</p></div><span className="shrink-0 font-mono text-2xl font-semibold">{score === null ? "—" : `${score}%`}</span></div>
            <p role="status" className="text-sm">{detection.error || (detection.isLoading && camera.ready ? "Đang tải model local…" : feedback[0])}</p>
            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={showContour} onChange={event => setShowContour(event.target.checked)} />Hiện dáng mẫu</label><label className="flex min-w-0 items-center gap-2">Độ mờ<input type="range" className="w-24 accent-primary" min=".1" max="1" step=".05" value={opacity} onChange={event => setOpacity(Number(event.target.value))} /></label></div>
            <p className="text-xs text-muted-foreground">Điểm biểu thị độ giống dáng tham khảo, không phải đánh giá cơ thể hay sức khỏe. Silhouette hiện được dựng từ keypoints, chưa phải mask người thật.</p>
          </div>
        </section>
        <aside className="space-y-4 rounded-2xl border border-border bg-card p-5 text-card-foreground">
          <div><h2 className="font-semibold">Thư viện dáng</h2><p className="mt-1 text-xs text-muted-foreground">{catalogStatus} · {poses.length} mẫu</p></div>
          <label className="block text-sm">Tìm dáng<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tên hoặc kiểu dáng" className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
          <div className="flex flex-wrap gap-2">{CATEGORIES.map(item => <Button key={item.id} size="sm" variant={category === item.id ? "default" : "outline"} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</Button>)}</div>
          <div className="max-h-[560px] space-y-2 overflow-y-auto">{visiblePoses.map(pose => <button key={pose.id} aria-pressed={selectedPose.id === pose.id} onClick={() => setSelectedPose(pose)} className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedPose.id === pose.id ? "border-primary bg-secondary" : "border-border hover:bg-accent"}`}><span className="block font-semibold">{pose.name_vi}</span><span className="mt-1 block text-sm text-muted-foreground">{pose.description}</span></button>)}
            {!visiblePoses.length && <p className="py-6 text-sm text-muted-foreground">Không có dáng phù hợp. Thử từ khóa khác.</p>}</div>
        </aside>
      </div>
    </main>
  </div>;
}
