"""
Pose-Booth AI Benchmark & Validation Tool.
Tests inference latency and OKS scoring performance on active hardware.
"""
from __future__ import annotations

import time
import numpy as np
from PIL import Image

from config import settings
from core.engine import YOLOv8PoseEngine
from services.scoring import score_pose_pair
from services.library import pose_library_service


def run_benchmark():
    print("=" * 60)
    print(f"POSE-BOOTH AI BENCHMARK [{settings.AI_PROFILE.upper()} PROFILE]")
    print(f"Device: {settings.DEVICE} | FP16: {settings.USE_FP16}")
    print("=" * 60)

    # 1. Initialize Engine
    t0 = time.perf_counter()
    engine = YOLOv8PoseEngine()
    init_time = (time.perf_counter() - t0) * 1000
    print(f"[1/4] Engine loaded in {init_time:.2f} ms")
    if not engine.is_ready():
        raise RuntimeError(f"AI engine failed to initialize: {engine.load_error}")

    # 2. Test Dummy Inference (10 iterations)
    dummy_img = np.zeros((engine.img_size, engine.img_size, 3), dtype=np.uint8)
    # Draw simple stick figure so keypoint detector has some signal
    dummy_img[100:300, 200:400] = 200

    print("[2/4] Running 10 warmup & test inference passes...")
    latencies = []
    for i in range(10):
        t_start = time.perf_counter()
        _ = engine.predict(dummy_img)
        latencies.append((time.perf_counter() - t_start) * 1000)

    avg_latency = np.mean(latencies[2:])  # Ignore first two warmups
    fps = 1000.0 / avg_latency if avg_latency > 0 else 0
    print(f"      Average Inference Latency: {avg_latency:.2f} ms ({fps:.1f} FPS)")

    # 3. Test In-Memory Vector Library Cache
    print("[3/4] Testing In-Memory Vector Library...")
    pose_count = len(pose_library_service.poses)
    print(f"      Total poses loaded in RAM: {pose_count}")
    sample_pose = pose_library_service.get_pose("power_pose")
    if sample_pose:
        print(f"      Sample pose found: '{sample_pose['name']}' ({sample_pose['name_vi']})")

    # 4. Test OKS + Anatomy Scoring Performance (1000 iterations)
    print("[4/4] Testing Vectorized OKS Scoring (1000 iterations)...")
    sample_kps_a = [{"x": 0.5 + np.random.normal(0, 0.02), "y": 0.2 + (i * 0.04), "confidence": 0.9} for i in range(17)]
    sample_kps_b = [{"x": 0.5, "y": 0.2 + (i * 0.04), "confidence": 0.9} for i in range(17)]

    t_score_start = time.perf_counter()
    for _ in range(1000):
        _ = score_pose_pair(sample_kps_a, sample_kps_b)
    score_time_total = (time.perf_counter() - t_score_start) * 1000
    avg_score_time = score_time_total / 1000.0

    print(f"      Average Scoring Latency: {avg_score_time * 1000:.2f} µs ({avg_score_time:.4f} ms)")
    print(f"      Scoring Throughput: {1000.0 / avg_score_time:.0f} matches/sec")

    sample_result = score_pose_pair(sample_kps_a, sample_kps_b)
    print(f"      Sample Result: Score={sample_result['score']}% (OKS={sample_result['oks_score']}%, Anatomy={sample_result['anatomy_score']}%)")
    print(f"      Feedback: {sample_result['feedback']}")

    print("=" * 60)
    print("BENCHMARK COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_benchmark()
