"""
PikPose Model Benchmark
Evaluates YOLOv8-Pose accuracy on COCO test set.

Usage:
    python benchmark.py --model yolov8s-pose.pt
    python benchmark.py --model ../../ai/models/runs/pikpose_yolov8s_pose/weights/best.pt
"""
import argparse
import time
import torch
from ultralytics import YOLO


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Benchmark YOLOv8-Pose model")
    parser.add_argument("--model", default="yolov8s-pose.pt", help="Model path or name")
    parser.add_argument("--data", default="coco-pose.yaml", help="Dataset YAML")
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="0")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    print("=" * 60)
    print("PikPose — Model Benchmark")
    print("=" * 60)

    model = YOLO(args.model)

    print(f"\nEvaluating: {args.model}")
    print(f"Dataset:    {args.data}")
    print()

    # Measure inference speed
    print("🔄 Measuring inference speed...")
    dummy = torch.randn(1, 3, args.imgsz, args.imgsz)
    times = []
    for _ in range(50):
        start = time.perf_counter()
        model.predict(dummy, device=args.device, verbose=False)
        times.append((time.perf_counter() - start) * 1000)

    avg_ms = sum(times[10:]) / len(times[10:])  # Skip warmup
    fps = 1000 / avg_ms
    print(f"  Avg inference: {avg_ms:.1f}ms ({fps:.0f} FPS)")

    # Validate on COCO val set
    print("\n🔄 Running COCO validation...")
    metrics = model.val(data=args.data, imgsz=args.imgsz, device=args.device)

    print("\n📊 Results:")
    print(f"  mAP50-95 (bbox):     {metrics.box.map:.4f}")
    print(f"  mAP50-95 (keypoint): {metrics.pose.map:.4f}")
    print(f"  mAP50 (keypoint):    {metrics.pose.map50:.4f}")
    print()

    if metrics.pose.map > 0.65:
        print("✅ Model meets accuracy target (mAP50-95 > 0.65) — Ready for production!")
    else:
        print("⚠️  Model below target. Consider more training epochs or larger model.")


if __name__ == "__main__":
    main()
