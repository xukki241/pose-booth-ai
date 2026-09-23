"""
COCO 2017 Keypoints Dataset Downloader
Downloads and extracts COCO 2017 for YOLOv8-Pose training.

Usage:
    python download_coco.py

Downloads to: C:/FLM/Ki7/EXE101/ai/datasets/coco/
"""
import os
import zipfile
import urllib.request
from pathlib import Path
from typing import Callable

COCO_DIR = Path(r"C:\FLM\Ki7\EXE101\ai\datasets\coco")

COCO_URLS = {
    "train2017.zip": "http://images.cocodataset.org/zips/train2017.zip",          # ~18GB
    "val2017.zip":   "http://images.cocodataset.org/zips/val2017.zip",             # ~1GB
    "annotations.zip": "http://images.cocodataset.org/annotations/annotations_trainval2017.zip",  # ~241MB
}


def download_with_progress(url: str, dest: Path) -> None:
    """Download file with progress bar."""
    print(f"\nDownloading: {dest.name}")
    print(f"URL: {url}")

    def progress(block_count: int, block_size: int, total_size: int) -> None:
        downloaded = block_count * block_size
        if total_size > 0:
            pct = min(downloaded / total_size * 100, 100)
            bar = "█" * int(pct / 2) + "░" * (50 - int(pct / 2))
            mb = downloaded / 1e6
            total_mb = total_size / 1e6
            print(f"\r  [{bar}] {pct:.1f}% ({mb:.0f}/{total_mb:.0f} MB)", end="")

    urllib.request.urlretrieve(url, dest, reporthook=progress)
    print()  # newline after progress bar


def extract_zip(zip_path: Path, extract_to: Path) -> None:
    """Extract zip file."""
    print(f"Extracting: {zip_path.name}...")
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_to)
    print(f"  Extracted to: {extract_to}")


def main() -> None:
    COCO_DIR.mkdir(parents=True, exist_ok=True)
    zip_dir = COCO_DIR / "zips"
    zip_dir.mkdir(exist_ok=True)

    print("=" * 60)
    print("COCO 2017 Keypoints Dataset Downloader")
    print("=" * 60)
    print(f"Download location: {COCO_DIR}")
    print(f"Estimated total size: ~20GB")
    print()

    for filename, url in COCO_URLS.items():
        zip_path = zip_dir / filename
        if zip_path.exists():
            print(f"✅ Already downloaded: {filename}")
        else:
            download_with_progress(url, zip_path)

        # Extract
        extract_dir = COCO_DIR / filename.replace(".zip", "")
        if not extract_dir.exists():
            extract_zip(zip_path, COCO_DIR)
        else:
            print(f"✅ Already extracted: {filename.replace('.zip', '')}")

    print("\n✅ COCO 2017 dataset ready!")
    print(f"Location: {COCO_DIR}")
    print("\nNext step: python prepare_dataset.py")


if __name__ == "__main__":
    main()
