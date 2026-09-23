"use client";

/**
 * PhotoBoothController — Main photobooth state machine
 * Handles: idle → countdown → capture → review → export
 *
 * Modes:
 *   single  - 1 shot
 *   triple  - 3 shots in strip layout
 *   quad    - 4 shots in 2x2 grid
 *   video   - 3 second video loop → GIF
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { BoothState, CapturedShot, ShotMode } from "@/types/pose";

interface PhotoBoothControllerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  mode: ShotMode;
  onComplete: (shots: CapturedShot[]) => void;
  countdownSeconds?: number;
}

export function usePhotoBooth({
  videoRef,
  mode,
  onComplete,
  countdownSeconds = 3,
}: PhotoBoothControllerProps) {
  const [state, setState] = useState<BoothState>("idle");
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [shots, setShots] = useState<CapturedShot[]>([]);
  const [currentShot, setCurrentShot] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const totalShots = mode === "single" ? 1 : mode === "triple" ? 3 : mode === "quad" ? 4 : 1;
  const isVideoMode = mode === "video";

  const captureFrame = useCallback((): string => {
    const video = videoRef.current;
    if (!video) return "";

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Mirror the frame (like a selfie)
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, [videoRef]);

  const startCountdown = useCallback(() => {
    setState("countdown");
    setCountdown(countdownSeconds);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setState("capturing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [countdownSeconds]);

  // Handle capture phase
  useEffect(() => {
    if (state !== "capturing") return;

    if (isVideoMode) {
      // Start video recording
      const stream = videoRef.current?.srcObject as MediaStream | null;
      if (!stream) return;

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const shot: CapturedShot = {
          id: crypto.randomUUID(),
          imageData: url,
          timestamp: Date.now(),
        };
        onComplete([shot]);
        setState("review");
      };

      setIsRecording(true);
      recorder.start();
      setTimeout(() => {
        recorder.stop();
        setIsRecording(false);
      }, 3000);
    } else {
      // Photo capture
      const imageData = captureFrame();
      const shot: CapturedShot = {
        id: crypto.randomUUID(),
        imageData,
        timestamp: Date.now(),
      };

      setShots((prev) => {
        const updated = [...prev, shot];
        const nextShot = updated.length;

        if (nextShot >= totalShots) {
          // All shots done
          onComplete(updated);
          setState("review");
        } else {
          // More shots to take
          setCurrentShot(nextShot);
          setState("idle");
          // Auto-start next countdown after brief pause
          setTimeout(() => startCountdown(), 1500);
        }

        return updated;
      });
    }
  }, [state, isVideoMode, captureFrame, totalShots, onComplete, startCountdown, videoRef]);

  const start = useCallback(() => {
    if (state !== "idle") return;
    setShots([]);
    setCurrentShot(0);
    startCountdown();
  }, [state, startCountdown]);

  const reset = useCallback(() => {
    clearInterval(countdownRef.current!);
    setState("idle");
    setShots([]);
    setCurrentShot(0);
    setCountdown(countdownSeconds);
  }, [countdownSeconds]);

  return {
    state,
    countdown,
    shots,
    currentShot,
    totalShots,
    isRecording,
    start,
    reset,
    progress: shots.length / totalShots,
  };
}

/**
 * CountdownDisplay — GSAP animated circular countdown
 */
export function CountdownDisplay({ countdown, total }: { countdown: number; total: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!numberRef.current) return;
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
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          {/* Progress ring with violet prism glow */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#A855F7"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.9s linear",
              filter: "drop-shadow(0 0 8px #A855F7)",
            }}
          />
        </svg>

        {/* Countdown number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            ref={numberRef}
            className="text-5xl font-bold text-white font-mono"
            data-animate
          >
            {countdown}
          </span>
        </div>
      </div>
    </div>
  );
}
