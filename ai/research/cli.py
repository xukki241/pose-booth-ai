"""Run from repository root: python -m ai.research.cli --help."""
import argparse
import importlib.metadata
import json
import platform
from pathlib import Path
from .data import inventory, release, safe_extract, write_json, convert_coco


def environment():
    result = {"python": platform.python_version(), "platform": platform.platform(), "versions": {}}
    for name in ("torch", "torchvision", "ultralytics", "numpy", "pillow"):
        try:
            result["versions"][name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            result["versions"][name] = None
    try:
        import torch
        result["cuda_available"] = torch.cuda.is_available()
        result["gpu"] = torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    except ImportError:
        result["cuda_available"] = False
    return result


def main():
    parser = argparse.ArgumentParser(description="Pose-Booth data/research tools (no automatic downloads)")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("doctor")
    coco = sub.add_parser("convert-coco")
    coco.add_argument("annotation", type=Path)
    coco.add_argument("--output", type=Path, required=True)
    imp = sub.add_parser("inventory")
    imp.add_argument("source", type=Path)
    imp.add_argument("--metadata", type=Path)
    imp.add_argument("--output", type=Path, required=True)
    ext = sub.add_parser("extract")
    ext.add_argument("archive", type=Path)
    ext.add_argument("destination", type=Path)
    rel = sub.add_parser("release")
    rel.add_argument("manifest", type=Path)
    rel.add_argument("--labels", type=Path, required=True)
    rel.add_argument("--output", type=Path, required=True)
    rel.add_argument("--seed", type=int, default=42)
    rel.add_argument("--smoke", action="store_true")
    args = parser.parse_args()
    if args.command == "doctor":
        print(json.dumps(environment(), indent=2))
    elif args.command == "convert-coco":
        print(json.dumps(convert_coco(args.annotation, args.output), indent=2))
    elif args.command == "extract":
        safe_extract(args.archive, args.destination)
        print(f"Extracted to {args.destination}")
    elif args.command == "inventory":
        if args.output.exists():
            parser.error("Inventory output exists; use a new version")
        report = inventory(args.source, args.metadata)
        write_json(args.output, report)
        print(f"Images: {len(report['images'])}; issues: {len(report['issues'])}. No files modified in source.")
    else:
        result = release(json.loads(args.manifest.read_text(encoding="utf-8")), args.labels, args.output, args.seed, args.smoke)
        print(f"Release: {len(result['images'])} images; smoke_only={result['smoke_only']}")


if __name__ == "__main__":
    main()
