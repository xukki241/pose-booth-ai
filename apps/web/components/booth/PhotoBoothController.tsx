"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { captureVideo } from "@/lib/camera-transform";
import type { BoothState, CapturedShot, ShotMode } from "@/types/pose";

interface PhotoBoothControllerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  mode: ShotMode;
  onComplete: (shots: CapturedShot[]) => void;
  countdownSeconds?: number;
  mirror?: boolean;
}

export function usePhotoBooth(options: PhotoBoothControllerProps) {
  const latest = useRef(options);
  latest.current = options;
  const [state, setState] = useState<BoothState>("idle");
  const [countdown, setCountdown] = useState(options.countdownSeconds ?? 3);
  const [shots, setShots] = useState<CapturedShot[]>([]);
  const [currentShot, setCurrentShot] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const run = useRef<AbortController | null>(null);
  const totalShots = options.mode === "triple" ? 3 : options.mode === "quad" ? 4 : 1;

  const reset = useCallback(() => {
    run.current?.abort();
    run.current = null;
    setState("idle"); setShots([]); setCurrentShot(0); setError(null);
    setCountdown(latest.current.countdownSeconds ?? 3);
  }, []);
  useEffect(() => () => { run.current?.abort(); }, []);

  const start = useCallback(async () => {
    if (run.current) return;
    const controller = new AbortController();
    run.current = controller;
    const wait = (ms: number) => new Promise<void>((resolve, reject) => {
      const onAbort = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
      const timer = setTimeout(() => { controller.signal.removeEventListener("abort", onAbort); resolve(); }, ms);
      controller.signal.addEventListener("abort", onAbort, { once: true });
    });
    const opts = latest.current;
    const count = opts.mode === "triple" ? 3 : opts.mode === "quad" ? 4 : 1;
    setShots([]); setError(null);
    try {
      if (opts.mode === "video") throw new Error("Pilot chỉ hỗ trợ ảnh; chưa hỗ trợ video/GIF.");
      const completed: CapturedShot[] = [];
      for (let index = 0; index < count; index++) {
        setCurrentShot(index); setState("countdown");
        for (let remaining = opts.countdownSeconds ?? 3; remaining > 0; remaining--) {
          setCountdown(remaining); await wait(1000);
        }
        if (controller.signal.aborted) return;
        setCountdown(0); setState("capturing");
        if (!opts.videoRef.current) throw new Error("Camera đã ngắt");
        const shot = { id: crypto.randomUUID(), imageData: captureVideo(opts.videoRef.current, opts.mirror ?? true), timestamp: Date.now() };
        completed.push(shot); setShots([...completed]);
        if (index + 1 < count) await wait(700);
      }
      if (!controller.signal.aborted) {
        latest.current.onComplete(completed); setState("review");
      }
    } catch (exc) {
      if (!controller.signal.aborted) {
        setError(exc instanceof Error ? exc.message : "Không chụp được ảnh"); setState("idle");
      }
    } finally {
      if (run.current === controller) run.current = null;
    }
  }, []);
  return { state, countdown, shots, currentShot, totalShots, isRecording: false, error, start, reset, progress: shots.length / totalShots };
}

/**
 * CountdownDisplay — GSAP animated circular countdown
 */
export function CountdownDisplay({ countdown, total }: { countdown: number; total: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!numberRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Pulse animation on each countdown tick
      gsap.fromTo(
        numberRef.current,
        { scale: 1.4, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }
      );
    },
    { dependencies: [countdown], scope: containerRef }
  );

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - countdown / total);

  return (
    <div ref={containerRef} className="flex items-center justify-center">
      <div className="relative w-32 h-32">
        {/* SVG circular progress */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          {/* Progress ring with violet prism glow */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.9s linear",
            }}
          />
        </svg>

        {/* Countdown number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            ref={numberRef}
            className="text-5xl font-bold text-foreground font-mono"
            data-animate
          >
            {countdown}
          </span>
        </div>
      </div>
    </div>
  );
}
