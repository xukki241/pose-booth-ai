"""Safe local/Colab entrypoint. Defaults to dry-run; no implicit COCO download."""
import argparse
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from ai.research.experiments import train, resume_checkpoint

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path, required=True, help="Existing trusted checkpoint")
    parser.add_argument("--data", type=Path, help="Versioned dataset.yaml")
    parser.add_argument("--output", type=Path, help="New run directory")
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--batch", type=int, default=2)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="0")
    parser.add_argument("--workers", type=int, default=0)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()
    if args.resume:
        if not args.execute or args.data or args.output:
            parser.error("Resume requires --execute and --model last.pt, without --data/--output")
        resume_checkpoint(args.model)
        return
    if not args.data or not args.output:
        parser.error("--data and --output are required for a new run")
    print(json.dumps(train(args.model, args.data, args.output, epochs=args.epochs,
          batch=args.batch, imgsz=args.imgsz, device=args.device, workers=args.workers,
          seed=args.seed, execute=args.execute), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
