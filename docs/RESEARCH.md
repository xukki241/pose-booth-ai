# Learn AI through Pose-Booth

## Bắt đầu từ việc nhỏ, có kết quả kiểm chứng được

| Bài | Vai trò | Đầu ra |
|---|---|---|
| `notebooks/01-environment-inference.ipynb` | AI engineer | Device, phiên bản, inference fixture, dtype thực |
| `notebooks/02-dataset-audit.ipynb` | Data engineer | Quarantine khi thiếu quyền; dataset smoke bất biến |
| `notebooks/03-baseline-evaluation.ipynb` | Applied researcher | Cấu hình đánh giá; chỉ có metric khi có dataset |
| `notebooks/04-finetune-local-colab.ipynb` | AI engineer/researcher | Dry-run, smoke, fine-tune, resume |
| `notebooks/05-compare-release.ipynb` | MLOps | So sánh cùng protocol, candidate không tự promote |

Notebook là giao diện học; logic nằm trong `ai/research`. Không copy thuật toán vào notebook khác. Các notebook đã được execute ở chế độ mặc định: bài 1 chạy inference fixture nếu có model, bài 2 chạy dữ liệu tự sinh; bài 3–5 in thông báo chưa thực hiện đánh giá/train/release khi thiếu dữ liệu. Chưa có kết quả fine-tune trên dữ liệu khách.

Inference dùng weights để dự đoán. Training cập nhật weights; fine-tune tiếp tục học từ pretrained. Baseline là đối chứng. Validation dùng chọn cấu hình. Test giữ lại cho đánh giá cuối. Data leakage là dữ liệu test lọt vào train/khâu lựa chọn làm kết quả đẹp giả.

## Cài và kiểm môi trường

Ở repo root, dùng Python trong venv API đã cài requirements GPU/application/notebook. Trên Windows:

```powershell
.\apps\api\.venv\Scripts\python.exe -m ai.research.cli doctor
.\apps\api\.venv\Scripts\python.exe -m pip install -r apps/api/requirements-notebook.txt
```

Torch/torchvision và CUDA đã ghim trong requirements-gpu-cu128; không cài CUDA Toolkit riêng chỉ để inference. Khi thay driver/wheel phải chạy lại smoke và lưu versions. Không ghi API keys, token gallery hoặc ảnh khách vào notebook outputs.

## Khi bạn đưa script và ảnh

Chưa chạy script chưa review. Kiểm nguồn dữ liệu, quyền sử dụng, dependency, tải mạng, đường dẫn ghi/xóa và subprocess. Lưu script gốc + revision/checksum, thử trên mẫu riêng. Nếu format khác, adapter nằm ở bước import, không sửa contract app theo script tạm thời.

Đầu vào hiện hỗ trợ ảnh JPEG/PNG trong folder, ZIP, metadata CSV hoặc JSONL, nhãn YOLO17 và convert từ COCO17 person. Không tự tải COCO hoặc chạy scraper.

Ví dụ metadata JSONL (mỗi ảnh một dòng; đây là ví dụ định dạng, không phải consent thật):

```json
{"path":"session-a/photo-001.jpg","source":"owned studio research shoot","rights_ref":"consent-record-001","training_allowed":true,"subject_id":"subject-pseudonym-001","session_id":"session-a","annotation_reviewed":true,"annotation_version":"review-v1"}
```

Chỉ đánh dấu reviewed sau khi con người kiểm tra. Không dùng tên thật làm subject ID; consent registry giữ riêng có kiểm soát. Thiếu source/rights_ref/training_allowed thì quarantine. Consent nghiên cứu phải tách khỏi đồng ý lưu ảnh gallery 24 giờ.

## Pipeline CLI

Ví dụ Linux/Colab dùng `python`; Windows thay bằng đường dẫn venv ở trên:

```bash
python -m ai.research.cli extract approved.zip ai/data/raw-v1
python -m ai.research.cli inventory ai/data/raw-v1 --metadata approved-metadata.jsonl --output ai/data/inventory-v1.json
python -m ai.research.cli convert-coco person_keypoints.json --output ai/data/labels-v1
python -m ai.research.cli release ai/data/inventory-v1.json --labels ai/data/labels-v1 --output ai/data/releases/v1
```

- ZIP được kiểm traversal, symlink, số member và tổng kích thước trước extract; không ghi đè thư mục đã có.
- Inventory kiểm checksum, kích thước, ảnh hỏng, EXIF và exact duplicates; average-hash chỉ là gợi ý near-duplicate để review.
- Ảnh có EXIF rotation khác 1 cần normalization cùng nhãn trước release, không xoay ảnh riêng làm sai nhãn.
- Release kiểm COCO17/YOLO pose visibility, tọa độ, bbox, human review/version và checksum. Nhãn segmentation là schema khác, chưa đủ điều kiện train segmentation bằng nhãn pose.
- Split theo connected groups của subject/session, không random từng frame. Seed cố định tái tạo split; hash manifest ghi vào run.
- Ít nhóm chỉ dùng `--smoke`; fixture không chứng minh tổng quát. Near-duplicate review và tính đa dạng vẫn cần người kiểm tra; hash không thay việc đó.
- Raw bất biến. Mỗi output/release dùng thư mục mới. `ai/data` và `ai/artifacts` không đưa vào Git.

## Training và đánh giá

```bash
# Mặc định dry-run, không train
python ai/training/train.py --model /approved/yolov8s-pose.pt --data ai/data/releases/v1/dataset.yaml --output ai/artifacts/smoke-001 --epochs 1 --batch 2 --workers 0
# Sau kiểm tra, thêm --execute để chạy thật
python ai/evaluation/benchmark.py --help
```

Model path phải là file tin cậy có sẵn, không tự download. YOLOv8s là điểm bắt đầu để giảm VRAM; YOLOv8x là baseline đã có. Batch phải probe trên GPU thực tế. Một epoch chỉ kiểm pipeline. `resume` dùng `last.pt` của run bị gián đoạn với data/config gốc; dataset mới bắt đầu run mới. Không lật dọc ảnh studio; horizontal flip dùng mapping trái/phải COCO17.

Run directory ghi git revision + dirty flag, environment, seed, dataset manifest hash, checkpoint hash và metrics. Dirty flag không thể tái tạo chính xác code chưa commit: trước thí nghiệm nghiêm túc phải snapshot/commit revision đã review (không commit dữ liệu/secrets).

Quy trình research: R0 pretrained → R1 preprocess/scoring → R2 fine-tune → R3 thu thập nhóm lỗi → R4 tối ưu tốc độ. Mỗi run có một giả thuyết và một thay đổi chính. So sánh baseline/candidate cùng split/imgsz/dataset. mAP không phải điểm UI và không phải latency camera end-to-end.

## Google Colab

1. Review notebook và script ở revision đã chọn trước khi cấp quyền Drive. Clone đúng revision; đừng luôn dùng `main` đang thay đổi.
2. Kiểm Python/GPU/VRAM bằng doctor. Wheel CUDA phải tương thích runtime; không mặc định Colab luôn cùng GPU hoặc cùng Python.
3. Chỉ upload dataset có quyền đưa lên cloud, kiểm archive checksum. Copy ZIP sang ổ local runtime rồi extract; không đọc hàng nghìn file nhỏ từ Drive trong từng batch.
4. Chạy validation, baseline, dry-run và 1 epoch smoke; sau đó mới tăng epoch/batch.
5. Lưu checkpoint + run metadata + dataset manifest sang nơi bền vững đã được bạn duyệt. Kiểm checksum bản copy trước khi tắt runtime.
6. Mang candidate về RTX3060 để đo lại. Colab không là camera backend và không dùng mẹo vượt quota/giữ phiên sống.

Colab không cam kết loại GPU hay runtime cố định: [FAQ chính thức](https://research.google.com/colaboratory/faq.html). Tham số/resume: [Ultralytics train](https://docs.ultralytics.com/modes/train/).

## Candidate và release

`compare()` từ chối khác protocol. `package_candidate()` yêu cầu checkpoint đúng hash report, license_ref và dataset không smoke; output chứa model card, evaluation, preprocessing/schema metadata và checksum. Trạng thái luôn `candidate_not_promoted`.

Chưa có UI promotion tự động. Trước đổi `MODEL_PATH`: review license code/weights/data, lỗi theo nhóm, latency/VRAM, API contract, chụp thực, model cũ và cách rollback. Khởi động lại AI service, kiểm health và smoke. Không tự chọn `best.pt` mới nhất.

Không gọi dự án/model “production-ready” chỉ vì mAP vượt ngưỡng. Ultralytics có điều kiện AGPL/Enterprise cần rà soát cho cách phân phối/dịch vụ thực tế: [License chính thức](https://www.ultralytics.com/license). License MIT của code app không tự bao phủ mọi weights, dataset và frame.

## Bài tập cho dev

1. Đổi thứ tự RGB/BGR trên ảnh màu tự sinh và giải thích vì sao output khác.
2. Bỏ rights_ref của một ảnh; xác nhận nó không vào train.
3. Cho hai session chung một subject; kiểm chúng cùng split.
4. Sửa label sau release; xác nhận checksum chặn train.
5. Viết giả thuyết “thêm ảnh tay chéo giảm lỗi cổ tay”; định nghĩa nhóm đánh giá trước khi train.
6. Đọc loss/validation: loss giảm nhưng validation xấu đi là tín hiệu overfit hoặc sai dữ liệu, không phải lý do tự tăng epoch.
