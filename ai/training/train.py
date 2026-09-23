"""
YOLOv8-Pose Fine-tuning Script
Fine-tunes YOLOv8s-pose on COCO 2017 Keypoints dataset.

Hardware: RTX 3060 12GB VRAM + R7 5700X + 32GB RAM
Expected training time: ~4-8 hours (50 epochs, batch=16)

Usage:
    python train.py [--model yolov8s-pose.pt] [--epochs 50] [--batch 16]
"""
import argparse
from pathlib import Path
from ultralytics import YOLO


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tune YOLOv8-Pose on COCO")
    parser.add_argument(
        "--model", default="yolov8s-pose.pt",
        choices=["yolov8n-pose.pt", "yolov8s-pose.pt", "yolov8m-pose.pt"],
        help="Base model (n=nano, s=small, m=medium). Recommendation: yolov8s-pose.pt"
    )
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (reduce if OOM)")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size for training")
    parser.add_argument("--device", default="0", help="Device: '0' for GPU, 'cpu' for CPU")
    parser.add_argument("--resume", action="store_true", help="Resume from last checkpoint")
    parser.add_argument(
        "--data", default="coco-pose.yaml",
        help="Path to dataset YAML config"
    )
    return parser.parse_args()


def check_gpu() -> None:
    """Check GPU availability and memory."""
    import torch
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        vram = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"✅ GPU: {gpu_name} ({vram:.1f}GB VRAM)")
        if vram < 8:
            print("⚠️  Warning: Less than 8GB VRAM. Reduce batch size to 8.")
    else:
        print("⚠️  No GPU detected. Training on CPU will be very slow.")
        print("   Consider using Google Colab or reducing to yolov8n-pose.pt")


def main() -> None:
    args = parse_args()

    print("=" * 60)
    print("PikPose — YOLOv8-Pose Fine-tuning")
    print("=" * 60)
    check_gpu()
    print()

    print(f"Model:   {args.model}")
    print(f"Epochs:  {args.epochs}")
    print(f"Batch:   {args.batch}")
    print(f"ImgSz:   {args.imgsz}")
    print(f"Data:    {args.data}")
    print()

    # Load pretrained model
    model = YOLO(args.model)

    # Train
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        project=str(Path(__file__).parent.parent / "models" / "runs"),
        name="pikpose_yolov8s_pose",
        resume=args.resume,
        # Optimization settings for 3060 12GB
        amp=True,           # Automatic Mixed Precision (saves VRAM)
        cache=True,         # Cache images in RAM (uses ~4GB RAM, faster training)
        workers=8,          # DataLoader workers (R7 5700X has 8 cores)
        # Augmentation
        flipud=0.1,
        fliplr=0.5,
        mosaic=0.8,
        # Logging
        verbose=True,
        save=True,
        save_period=10,     # Save checkpoint every 10 epochs
    )

    print("\n✅ Training complete!")
    print(f"Best model saved to: {results.save_dir}/weights/best.pt")
    print("\nNext step: python ../evaluation/benchmark.py")


if __name__ == "__main__":
    main()
