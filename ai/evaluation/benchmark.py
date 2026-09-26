"""Evaluate a versioned pose release; metrics never imply automatic production approval."""
import argparse
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from ai.research.experiments import evaluate

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--split", choices=["val", "test"], default="val")
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="0")
    args = parser.parse_args()
    print(json.dumps(evaluate(args.model, args.data, args.output, split=args.split,
          imgsz=args.imgsz, device=args.device), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
