"""Generate bounded tutorials; run with --execute to save real outputs (no training by default)."""
import argparse
import sys
from pathlib import Path
import nbformat as nbf
from nbclient import NotebookClient

ROOT = Path(__file__).resolve().parents[1]
SETUP = '''from pathlib import Path
import os, sys, json, tempfile
ROOT = next((p for p in [Path.cwd(), *Path.cwd().parents] if (p / "ai/research").is_dir()), None)
assert ROOT is not None, "Clone repo và chạy từ repo/notebooks"
sys.path.insert(0, str(ROOT))
os.environ["YOLO_AUTOINSTALL"] = "false"
from ai.research.cli import environment
print(json.dumps(environment(), indent=2))'''

LESSONS = [
    ("01-environment-inference", "Environment & inference", "Tensor là mảng số; device là nơi tính toán; weights là tham số đã học. PIL dùng RGB, ndarray của Ultralytics dùng BGR. Ảnh fixture trống chỉ kiểm đường chạy, không đo độ chính xác.", '''from PIL import Image
import time, statistics
model_path = ROOT / "apps/api/models/yolov8x-pose.pt"
if not model_path.exists():
    print("SKIP inference: cung cấp weights local đã duyệt license. Không tự download.")
else:
    import torch
    from ultralytics import YOLO
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    model = YOLO(str(model_path))
    fixture = Image.new("RGB", (640, 640), "white")
    durations = []
    if torch.cuda.is_available(): torch.cuda.reset_peak_memory_stats()
    for index in range(5):
        start = time.perf_counter()
        result = model.predict(fixture, imgsz=640, device=device, quantize=16 if device != "cpu" else None, verbose=False)
        if torch.cuda.is_available(): torch.cuda.synchronize()
        durations.append((time.perf_counter() - start) * 1000)
    print({"input": "synthetic blank RGB 640x640", "persons": len(result[0].boxes),
           "mean_ms_after_2_warmups": statistics.mean(durations[2:]),
           "actual_dtype": str(next(model.predictor.model.model.parameters()).dtype),
           "peak_allocated_MiB": torch.cuda.max_memory_allocated() / 1024**2 if device != "cpu" else None,
           "accuracy_evaluated": False})
    del model
    if torch.cuda.is_available(): torch.cuda.empty_cache()''', "Đổi sang một ảnh được phép dùng và xem keypoints/mask. Không xem zero detections của ảnh trống là lỗi model."),
    ("02-dataset-audit", "Dataset audit", "Data engineer giữ raw bất biến, xác nhận quyền sử dụng, kiểm tra nhãn và tách người/session. Bộ mẫu này tự sinh, không chứa người thật và không dùng để kết luận chất lượng model.", '''from PIL import Image
from ai.research.data import inventory, release
with tempfile.TemporaryDirectory() as directory:
    root = Path(directory); raw = root / "raw"; labels = root / "labels"
    raw.mkdir(); labels.mkdir()
    Image.new("RGB", (64, 64), "red").save(raw / "fixture.png")
    labels.joinpath("fixture.txt").write_text("0 0.5 0.5 1 1 " + " ".join(["0.5 0.5 2"] * 17))
    blocked = inventory(raw)
    assert blocked["images"][0]["status"] == "quarantine"
    row = {"path": "fixture.png", "source": "generated tutorial fixture", "rights_ref": "generated-no-person",
           "training_allowed": True, "annotation_reviewed": True, "annotation_version": "fixture-v1",
           "subject_id": "fixture", "session_id": "fixture-session"}
    meta = root / "metadata.jsonl"; meta.write_text(json.dumps(row), encoding="utf-8")
    report = inventory(raw, meta)
    dataset = release(report, labels, root / "release", smoke=True)
    assert dataset["smoke_only"] is True
    print({"without_rights": "quarantine", "release_images": len(dataset["images"]), "smoke_only": True,
           "near_duplicate_groups": len(report["near_duplicate_review_groups"])})''', "Import ảnh của bạn bằng CLI inventory; review annotation và nhóm near-duplicate trước release. Keypoints không thay thế segmentation masks."),
    ("03-baseline-evaluation", "Baseline evaluation", "Baseline là kết quả đối chứng. mAP đo detection/keypoints trên dataset có nhãn; điểm pose trong UI đo mức giống mẫu. Hai số không thay thế nhau. Test set không dùng chọn tham số liên tục.", '''from ai.research.experiments import evaluate
DATASET = None  # Path tới dataset release/dataset.yaml đã QA
CHECKPOINT = ROOT / "apps/api/models/yolov8x-pose.pt"
EXECUTE = False  # bật sau khi kiểm dataset/license/GPU
if EXECUTE:
    assert DATASET is not None
    report = evaluate(CHECKPOINT, Path(DATASET), ROOT / "ai/artifacts/baseline-r0", split="val")
    print(report)
else:
    print("NOT EXECUTED: chưa có dataset thật. Không có mAP hoặc kết luận chất lượng.")''', "Ghi lỗi theo ánh sáng, che khuất, dáng người, góc camera. Giữ protocol cố định giữa baseline và candidate."),
    ("04-finetune-local-colab", "Fine-tune local / Colab", "Epoch là một lượt qua train set; batch là số ảnh mỗi bước; learning rate điều khiển mức cập nhật. AMP giảm bộ nhớ. Smoke 1 epoch kiểm pipeline, không chứng minh cải thiện. Không train khi đang phục vụ kiosk.", '''from ai.research.experiments import train, resume_checkpoint
DATASET = None
CHECKPOINT = None  # đường dẫn local tới yolov8s-pose.pt đã duyệt
EXECUTE = False
if DATASET is None or CHECKPOINT is None:
    print("NOT EXECUTED: cần dataset release và checkpoint tin cậy.")
else:
    plan = train(Path(CHECKPOINT), Path(DATASET), ROOT / "ai/artifacts/smoke-r1",
                 epochs=1, batch=2, imgsz=640, workers=0, execute=EXECUTE)
    print(plan)
# Resume chỉ dùng cho run bị ngắt, giữ dataset/config gốc:
# resume_checkpoint(Path(".../training/weights/last.pt"))''', "Colab: review code trước mount Drive; copy archive vào runtime, kiểm checksum, extract bằng CLI. GPU/quota thay đổi. Backup checkpoint + metadata sang nơi bền vững do bạn chọn; không tự upload ảnh khách. Dataset mới = run mới."),
    ("05-compare-release", "Compare & release", "Applied research: một giả thuyết, một thay đổi chính, cùng protocol. MLOps: truy vết weights/data/config, kiểm regression và rollback. Candidate chưa phải model đã duyệt production.", '''from ai.research.experiments import compare, package_candidate
BASELINE_REPORT = None
CANDIDATE_REPORT = None
if BASELINE_REPORT and CANDIDATE_REPORT:
    baseline = json.loads(Path(BASELINE_REPORT).read_text())
    candidate = json.loads(Path(CANDIDATE_REPORT).read_text())
    print(compare(baseline, candidate))
else:
    print("NOT EXECUTED: chưa có 2 evaluation reports. Không có model được promote.")
# Chỉ sau review: package_candidate(weights, evaluation_json, NEW_output, license_ref="...")''', "Review slice quality, latency/VRAM RTX3060, API integration, license/consent. Ghi quyết định giữ/bỏ/chưa đủ bằng chứng; model trước phải còn để rollback."),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    for name, title, explanation, code, next_step in LESSONS:
        notebook = nbf.v4.new_notebook(cells=[
            nbf.v4.new_markdown_cell(f"# {title}\n\n## Mục tiêu\n{explanation}"),
            nbf.v4.new_markdown_cell("## Setup\nChạy từ repo đã clone ở revision bạn ghi nhận. Local dùng venv API; Colab xem docs/RESEARCH.md. Không tự cài dependency hoặc tải dữ liệu khi Run all."),
            nbf.v4.new_code_cell(SETUP),
            nbf.v4.new_markdown_cell("## Các bước\nĐọc cấu hình trước khi thực thi; các thao tác tốn tài nguyên mặc định tắt."),
            nbf.v4.new_code_cell(code),
            nbf.v4.new_markdown_cell("## Kiểm tra\nOutput ghi rõ thao tác thực sự chạy và thao tác bị bỏ qua. Thiếu dữ liệu không được thay bằng số giả. Khi thay dữ liệu/cấu hình, restart kernel và Run all."),
            nbf.v4.new_markdown_cell(f"## Bước tiếp theo\n{next_step}"),
        ], metadata={"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}})
        nbf.validate(notebook)
        if args.execute:
            NotebookClient(notebook, timeout=180, resources={"metadata": {"path": str(ROOT)}}).execute()
        path = ROOT / "notebooks" / f"{name}.ipynb"
        nbf.write(notebook, path)
        print(f"{path.name}: {'executed (guarded)' if args.execute else 'not executed'}")


if __name__ == "__main__":
    main()
