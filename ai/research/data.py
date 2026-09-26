"""Immutable image inventory, annotation QA and subject/session-safe dataset releases."""
from __future__ import annotations

import csv
import hashlib
import json
import math
import shutil
import stat
import zipfile
from pathlib import Path
from PIL import Image, ImageOps

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
FLIP_IDX = [0, 2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15]


def digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")


def read_metadata(path: Path | None) -> dict:
    if path is None:
        return {}
    with path.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream)) if path.suffix.lower() == ".csv" else [json.loads(line) for line in stream if line.strip()]
    result = {}
    for row in rows:
        key = row["path"].replace("\\", "/")
        if key in result:
            raise ValueError(f"Duplicate metadata path: {key}")
        result[key] = row
    return result


def safe_extract(archive: Path, destination: Path, max_bytes: int = 2 * 1024**3) -> None:
    """ZIP only, validate every member before extracting anything. No overwrite."""
    if destination.exists():
        raise ValueError("Extraction destination must not exist")
    root = destination.resolve()
    with zipfile.ZipFile(archive) as source:
        members = source.infolist()
        if len(members) > 20000 or sum(m.file_size for m in members) > max_bytes:
            raise ValueError("Archive exceeds member/expanded-size limit")
        seen = set()
        for item in members:
            name = item.filename.replace("\\", "/")
            target = (root / name).resolve()
            mode = item.external_attr >> 16
            if (not target.is_relative_to(root) or name.startswith("/") or ":" in name
                    or stat.S_ISLNK(mode) or name.casefold() in seen):
                raise ValueError(f"Unsafe archive member: {name}")
            seen.add(name.casefold())
        source.extractall(root)


def inventory(source: Path, metadata: Path | None = None) -> dict:
    root = source.resolve(strict=True)
    records, issues, hashes = [], [], {}
    meta = read_metadata(metadata)
    for image_path in sorted(root.rglob("*")):
        if image_path.suffix.lower() not in IMAGE_EXTENSIONS or not image_path.is_file():
            continue
        rel = image_path.relative_to(root).as_posix()
        if image_path.is_symlink() or not image_path.resolve().is_relative_to(root):
            issues.append({"path": rel, "error": "symlink/outside source"})
            continue
        try:
            with Image.open(image_path) as image:
                if image.width * image.height > 40_000_000:
                    raise ValueError("More than 40 megapixels")
                image.verify()
            with Image.open(image_path) as image:
                orientation = image.getexif().get(274, 1)
                normalized = ImageOps.exif_transpose(image).convert("RGB")
                # Average hash is only a review hint, never an automatic duplicate verdict.
                pixels = list(normalized.resize((8, 8)).convert("L").getdata())
                mean = sum(pixels) / 64
                ahash = f"{sum((1 << i) for i, p in enumerate(pixels) if p >= mean):016x}"
                width, height = normalized.size
            sha = digest(image_path)
            entry = meta.get(rel, {})
            rights = bool(entry.get("source")) and entry.get("training_allowed") in (True, "true", "1") and bool(entry.get("rights_ref"))
            record = {"id": sha[:20], "path": rel, "sha256": sha, "width": width, "height": height,
                      "orientation": orientation, "average_hash": ahash,
                      "source": entry.get("source"), "rights_ref": entry.get("rights_ref"),
                      "training_allowed": rights, "subject_id": entry.get("subject_id"),
                      "session_id": entry.get("session_id"), "annotation_version": entry.get("annotation_version"),
                      "annotation_reviewed": entry.get("annotation_reviewed") in (True, "true", "1"),
                      "duplicate_of": hashes.get(sha), "status": "eligible" if rights else "quarantine"}
            hashes.setdefault(sha, rel)
            records.append(record)
        except (OSError, ValueError, Image.DecompressionBombError) as exc:
            issues.append({"path": rel, "error": str(exc)})
    near = {}
    for row in records:
        near.setdefault(row["average_hash"], []).append(row["path"])
    return {"schema_version": 1, "source_root": str(root), "images": records, "issues": issues,
            "near_duplicate_review_groups": [v for v in near.values() if len(v) > 1],
            "note": "Same average hash is a review hint; not proof of duplication or annotation quality."}


def validate_yolo_pose(label: Path) -> list[str]:
    errors = []
    lines = label.read_text(encoding="utf-8").splitlines()
    if not lines:
        return ["Empty annotation; negative-image support requires an explicit dataset policy"]
    for number, line in enumerate(lines, 1):
        try:
            values = [float(v) for v in line.split()]
            if len(values) != 56 or not all(math.isfinite(v) for v in values):
                raise ValueError("Expected class + bbox(4) + 17*(x,y,visibility), all finite")
            if values[0] != 0 or any(not 0 <= v <= 1 for v in values[1:5]) or min(values[3:5]) <= 0:
                raise ValueError("Invalid person class/bbox")
            x, y, w, h = values[1:5]
            if min(x-w/2, y-h/2) < -1e-6 or max(x+w/2, y+h/2) > 1.000001:
                raise ValueError("Bounding box outside image")
            for k in range(5, 56, 3):
                x, y, visible = values[k:k+3]
                if not (0 <= x <= 1 and 0 <= y <= 1 and visible in (0, 1, 2)):
                    raise ValueError("Invalid normalized keypoint/visibility")
        except ValueError as exc:
            errors.append(f"line {number}: {exc}")
    return errors


def convert_coco(annotation: Path, output: Path) -> dict:
    """COCO person keypoints -> YOLO17 labels only. Rights still require metadata/QA."""
    data = json.loads(annotation.read_text(encoding="utf-8"))
    images = {row["id"]: row for row in data["images"]}
    categories = {row["id"]: row for row in data["categories"]}
    coco_names = ["nose", "left_eye", "right_eye", "left_ear", "right_ear", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle"]
    pending = {}
    for ann in data["annotations"]:
        if categories[ann["category_id"]].get("keypoints") != coco_names:
            raise ValueError("Category must use named COCO17 keypoints in canonical order")
        if ann.get("iscrowd", 0):
            raise ValueError("Crowd annotations require manual policy/review")
        image = images[ann["image_id"]]
        name = Path(image["file_name"])
        if name.is_absolute() or ".." in name.parts or ":" in str(name) or "\\" in str(name):
            raise ValueError("Unsafe COCO filename")
        w, h = image["width"], image["height"]
        if min(w, h) <= 0 or len(ann["keypoints"]) != 51:
            raise ValueError("Invalid dimensions/keypoints")
        x, y, bw, bh = ann["bbox"]
        row = [0, (x+bw/2)/w, (y+bh/2)/h, bw/w, bh/h]
        for i in range(0, 51, 3):
            px, py, visible = ann["keypoints"][i:i+3]
            row.extend([px/w, py/h, visible])
        pending.setdefault(name.with_suffix(".txt"), []).append(" ".join(map(str, row)))
    output.mkdir(parents=True, exist_ok=False)
    for name, lines in pending.items():
        target = output / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("\n".join(lines) + "\n", encoding="utf-8")
        errors = validate_yolo_pose(target)
        if errors:
            raise ValueError(f"Converted labels invalid: {name}: {errors}")
    report = {"source_sha256": digest(annotation), "label_files": len(pending), "annotation_reviewed": False}
    write_json(output / "conversion.json", report)
    return report


def connected_groups(rows: list[dict]) -> list[list[dict]]:
    """Union by either subject OR session prevents transitive group leakage."""
    parents = list(range(len(rows)))
    def find(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i
    seen = {}
    for i, row in enumerate(rows):
        for field in ("subject_id", "session_id"):
            value = row.get(field)
            if not value:
                raise ValueError(f"Missing {field}: {row['path']}")
            key = (field, value)
            if key in seen:
                parents[find(i)] = find(seen[key])
            seen[key] = i
    groups = {}
    for i, row in enumerate(rows):
        groups.setdefault(find(i), []).append(row)
    return list(groups.values())


def release(manifest: dict, labels: Path, destination: Path, seed: int = 42, smoke: bool = False) -> dict:
    if destination.exists():
        raise ValueError("Release is immutable: choose a new destination/version")
    rows = [r for r in manifest["images"] if r["training_allowed"] and not r["duplicate_of"]]
    if manifest["issues"] or not rows:
        raise ValueError("Fix inventory issues and provide eligible images first")
    source = Path(manifest["source_root"]).resolve(strict=True)
    label_root = labels.resolve(strict=True)
    for row in rows:
        image = (source / row["path"]).resolve(strict=True)
        label = (label_root / Path(row["path"]).with_suffix(".txt")).resolve(strict=True)
        if not image.is_relative_to(source) or not label.is_relative_to(label_root):
            raise ValueError("Path outside dataset root")
        if digest(image) != row["sha256"]:
            raise ValueError(f"Image changed since inventory: {row['path']}")
        if row["orientation"] != 1:
            raise ValueError("Normalize oriented image and regenerate matching labels before release")
        if not row["annotation_reviewed"] or not row["annotation_version"]:
            raise ValueError(f"Annotation review/version missing: {row['path']}")
        errors = validate_yolo_pose(label)
        if errors:
            raise ValueError(f"{row['path']}: {errors}")
    groups = connected_groups(rows)
    if len(groups) < 3 and not smoke:
        raise ValueError("Need at least three independent subject/session groups; use --smoke only for pipeline checks")
    groups.sort(key=lambda group: hashlib.sha256((str(seed) + min(r["sha256"] for r in group)).encode()).hexdigest())
    count = len(groups)
    val_count = max(1, round(count * .15)) if count >= 3 else 0
    test_count = max(1, round(count * .15)) if count >= 3 else 0
    output = []
    for i, group in enumerate(groups):
        split = "val" if i < val_count else "test" if i < val_count + test_count else "train"
        for row in group:
            name = row["id"] + Path(row["path"]).suffix.lower()
            image_target = destination / "images" / split / name
            label_target = destination / "labels" / split / Path(name).with_suffix(".txt")
            image_target.parent.mkdir(parents=True, exist_ok=True)
            label_target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source / row["path"], image_target)
            shutil.copyfile(label_root / Path(row["path"]).with_suffix(".txt"), label_target)
            output.append({**row, "split": split, "release_path": image_target.relative_to(destination).as_posix(), "label_sha256": digest(label_target)})
    result = {"schema_version": 1, "seed": seed, "smoke_only": smoke, "images": output,
              "source_manifest_sha256": hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest(),
              "independent_groups": count, "note": "Small sets are not evidence of generalization; inspect slices and group balance."}
    write_json(destination / "manifest.json", result)
    # Relative paths are resolved by our training entrypoint against this YAML's directory.
    val_path = "images/val" if val_count else "images/train"
    (destination / "dataset.yaml").write_text(
        f"train: images/train\nval: {val_path}\n" + ("test: images/test\n" if test_count else "") +
        "kpt_shape: [17, 3]\nflip_idx: " + json.dumps(FLIP_IDX) + "\nnames: {0: person}\n", encoding="utf-8")
    return result
