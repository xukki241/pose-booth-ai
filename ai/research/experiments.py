"""Local/Colab experiment functions. No training or network access on import."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import time
from pathlib import Path
from .cli import environment
from .data import digest, write_json, FLIP_IDX


def provenance() -> dict:
    try:
        revision = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True, stderr=subprocess.DEVNULL).strip()
        dirty = bool(subprocess.check_output(["git", "status", "--porcelain"], text=True, stderr=subprocess.DEVNULL).strip())
    except (OSError, subprocess.CalledProcessError):
        revision, dirty = None, None
    return {"git_revision": revision, "working_tree_dirty": dirty, "environment": environment()}


def dataset_config(dataset: Path) -> tuple[dict, dict]:
    import yaml
    dataset = dataset.resolve(strict=True)
    manifest_path = dataset.parent / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    config = yaml.safe_load(dataset.read_text(encoding="utf-8"))
    allowed = {'train', 'val', 'test', 'kpt_shape', 'flip_idx', 'names'}
    if not isinstance(config, dict) or set(config) - allowed:
        raise ValueError('Only generated release YAML is accepted; download hooks/extra paths are forbidden')
    if config.get("kpt_shape") != [17, 3] or config.get('flip_idx') != FLIP_IDX or config.get('names') != {0: 'person'}:
        raise ValueError("Expected COCO17 pose release")
    for split in ('train', 'val', 'test'):
        if split not in config:
            continue
        expected = 'images/train' if split == 'val' and manifest['smoke_only'] and not (dataset.parent / 'images/val').exists() else f'images/{split}'
        if config[split] != expected:
            raise ValueError('Split path differs from immutable dataset layout')
    for row in manifest["images"]:
        if row['split'] not in {'train', 'val', 'test'}:
            raise ValueError('Invalid manifest split')
        image = (dataset.parent / row["release_path"]).resolve(strict=True)
        if not image.is_relative_to(dataset.parent) or digest(image) != row["sha256"]:
            raise ValueError("Release image missing, changed or outside dataset")
        label = (dataset.parent / "labels" / row["split"] / image.with_suffix(".txt").name).resolve(strict=True)
        if not label.is_relative_to(dataset.parent) or digest(label) != row["label_sha256"]:
            raise ValueError("Release annotation changed")
    config["path"] = str(dataset.parent)
    return config, {"manifest_sha256": digest(manifest_path), "smoke_only": manifest["smoke_only"]}


def train(model_path: Path, dataset: Path, output: Path, *, epochs=1, batch=2,
          imgsz=640, device="0", workers=0, seed=42, resume=False, execute=False) -> dict:
    import yaml
    model_path = model_path.resolve(strict=True)  # never auto-download a model by name
    config, data_info = dataset_config(dataset)
    if min(epochs, batch, imgsz) <= 0 or workers < 0:
        raise ValueError("Invalid training dimensions")
    if resume:
        raise ValueError("Use resume_checkpoint() for an interrupted run; a new dataset requires a new run")
    plan = {"operation": "train", "model_sha256": digest(model_path), "dataset": data_info,
            "epochs": epochs, "batch": batch, "imgsz": imgsz, "device": device,
            "workers": workers, "seed": seed, "cache": False, "flipud": 0.0,
            "output": str(output), "executed": False}
    if not execute:
        return plan
    output = output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    resolved_yaml = output / "dataset.resolved.yaml"
    resolved_yaml.write_text(yaml.safe_dump(config), encoding="utf-8")
    run = {**plan, **provenance(), "status": "running"}
    write_json(output / "run.json", run)
    os.environ["YOLO_AUTOINSTALL"] = "false"
    from ultralytics import YOLO
    started = time.perf_counter()
    try:
        result = YOLO(str(model_path)).train(
            data=str(resolved_yaml), epochs=epochs, batch=batch, imgsz=imgsz,
            device=device, workers=workers, seed=seed, amp=True, cache=False,
            flipud=0.0, fliplr=0.5, project=str(output), name="training",
            exist_ok=False, save=True, save_period=1, plots=True,
        )
        run.update(status="completed", executed=True, elapsed_seconds=time.perf_counter()-started,
                   results_dir=str(result.save_dir), metrics=result.results_dict)
    except Exception as exc:
        run.update(status="failed", elapsed_seconds=time.perf_counter()-started, error=type(exc).__name__)
        write_json(output / "run.json", run)
        raise
    write_json(output / "run.json", run)
    return run


def resume_checkpoint(checkpoint: Path):
    """Only for interrupted runs in a trusted environment with their original data/config."""
    checkpoint = checkpoint.resolve(strict=True)
    os.environ["YOLO_AUTOINSTALL"] = "false"
    from ultralytics import YOLO
    return YOLO(str(checkpoint)).train(resume=True)


def evaluate(model_path: Path, dataset: Path, output: Path, *, split="val", imgsz=640, device="0") -> dict:
    import yaml
    config, data_info = dataset_config(dataset)
    if split not in {"val", "test"} or split not in config:
        raise ValueError("Requested split is not present")
    model_path = model_path.resolve(strict=True)
    output = output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    resolved = output / "dataset.resolved.yaml"
    resolved.write_text(yaml.safe_dump(config), encoding="utf-8")
    os.environ["YOLO_AUTOINSTALL"] = "false"
    from ultralytics import YOLO
    result = YOLO(str(model_path)).val(data=str(resolved), split=split, imgsz=imgsz,
                                      device=device, workers=0, project=str(output), name="evaluation")
    report = {"schema_version": 1, "dataset": data_info, "split": split, "imgsz": imgsz,
              "model_sha256": digest(model_path), "pose_map50_95": float(result.pose.map),
              "pose_map50": float(result.pose.map50), "bbox_map50_95": float(result.box.map),
              "speed_ms": result.speed, **provenance(), "production_approved": False,
              "note": "Dataset metrics are not UI pose scores or end-to-end camera latency. Manual release gates remain required."}
    write_json(output / "evaluation.json", report)
    return report


def compare(baseline: dict, candidate: dict) -> dict:
    for key in ("dataset", "split", "imgsz"):
        if baseline[key] != candidate[key]:
            raise ValueError(f"Not comparable: {key} differs")
    return {"pose_map50_95_delta": candidate["pose_map50_95"] - baseline["pose_map50_95"],
            "production_approved": False,
            "note": "Review slices, latency, rights and integration before promotion. Do not tune repeatedly on test."}


def package_candidate(model: Path, evaluation: Path, output: Path, *, license_ref: str) -> dict:
    report = json.loads(evaluation.read_text(encoding="utf-8"))
    if not license_ref.strip() or digest(model) != report["model_sha256"]:
        raise ValueError("License reference missing or model differs from evaluated checkpoint")
    if report["dataset"]["smoke_only"]:
        raise ValueError("Smoke-only dataset is not sufficient for a model candidate")
    output.mkdir(parents=True, exist_ok=False)
    shutil.copyfile(model, output / "model.pt")
    shutil.copyfile(evaluation, output / "evaluation.json")
    metadata = {"schema_version": 1, "status": "candidate_not_promoted", "sha256": digest(model),
                "license_ref": license_ref, "keypoints": "COCO17", "input": "PIL RGB / ndarray BGR",
                "evaluation_sha256": digest(evaluation), "dataset": report["dataset"]}
    write_json(output / "model.json", metadata)
    (output / "MODEL_CARD.md").write_text(
        "# Pose-Booth model candidate\n\nNot approved for production.\n\n"
        "Review domain slices, consent/license, RTX 3060 latency/VRAM, integration and rollback.\n"
        "See evaluation.json and model.json for provenance.\n", encoding="utf-8")
    return metadata
