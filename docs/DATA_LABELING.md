# Hướng Dẫn Tự Label Data cho PikPose (Mở Rộng)

> Tài liệu này dành cho trường hợp bạn muốn cải thiện accuracy của model bằng cách tự thu thập và label dữ liệu ảnh pose riêng (VD: ảnh chụp trong photobooth, điều kiện ánh sáng đặc biệt, trang phục Việt Nam...).

## Khi Nào Cần Tự Label?

Pretrained YOLOv8s-pose trên COCO đã đạt ~92% accuracy. Bạn cần tự label khi:
- Model bị nhầm với trang phục đặc biệt (áo dài, áo truyền thống...)
- Góc chụp đặc thù của photobooth (quá gần, từ dưới lên...)
- Cần nhận diện tư thế ngồi/nằm tốt hơn
- Bổ sung thêm người/nhóm người trong frame

**Target**: 200-500 ảnh tự label là đủ để fine-tune cải thiện ~3-5% accuracy.

---

## Bước 1: Cài Đặt Label Studio

```bash
pip install label-studio
label-studio start
```

Mở browser tại: http://localhost:8080

## Bước 2: Tạo Project Mới

1. Đăng nhập (tạo account local)
2. **Create Project** → đặt tên "PikPose Keypoints"
3. Chọn template: **Keypoint Detection**
4. Config XML cho 17 COCO keypoints:

```xml
<View>
  <Image name="image" value="$image"/>
  <KeyPointLabels name="kp" toName="image">
    <Label value="nose" background="red"/>
    <Label value="left_eye" background="blue"/>
    <Label value="right_eye" background="blue"/>
    <Label value="left_ear" background="green"/>
    <Label value="right_ear" background="green"/>
    <Label value="left_shoulder" background="orange"/>
    <Label value="right_shoulder" background="orange"/>
    <Label value="left_elbow" background="yellow"/>
    <Label value="right_elbow" background="yellow"/>
    <Label value="left_wrist" background="purple"/>
    <Label value="right_wrist" background="purple"/>
    <Label value="left_hip" background="pink"/>
    <Label value="right_hip" background="pink"/>
    <Label value="left_knee" background="cyan"/>
    <Label value="right_knee" background="cyan"/>
    <Label value="left_ankle" background="white"/>
    <Label value="right_ankle" background="white"/>
  </KeyPointLabels>
</View>
```

## Bước 3: Thu Thập Ảnh

**Nguồn ảnh đề xuất:**
- Chụp bằng chính photobooth app khi đang phát triển
- Ảnh điện thoại: đa dạng góc nhìn (thẳng, 45°, từ xa, gần)
- Ánh sáng: trong nhà, ngoài trời, ngược sáng (edge cases)

**Script tự động chụp ảnh từ webcam:**
```python
import cv2
import time
from pathlib import Path

save_dir = Path("raw_images")
save_dir.mkdir(exist_ok=True)

cap = cv2.VideoCapture(0)
count = 0

print("Press SPACE to capture, Q to quit")
while True:
    ret, frame = cap.read()
    cv2.imshow("Capture (SPACE=save, Q=quit)", frame)
    
    key = cv2.waitKey(1) & 0xFF
    if key == ord(' '):
        filename = save_dir / f"pose_{count:04d}.jpg"
        cv2.imwrite(str(filename), frame)
        count += 1
        print(f"Saved: {filename}")
    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print(f"Total captured: {count} images")
```

## Bước 4: Label Keypoints

### Thứ tự label đề xuất (từ đầu xuống chân):
1. `nose` (mũi)
2. `left_eye`, `right_eye` (mắt)
3. `left_ear`, `right_ear` (tai)
4. `left_shoulder`, `right_shoulder` (vai)
5. `left_elbow`, `right_elbow` (khuỷu tay)
6. `left_wrist`, `right_wrist` (cổ tay)
7. `left_hip`, `right_hip` (hông)
8. `left_knee`, `right_knee` (đầu gối)
9. `left_ankle`, `right_ankle` (cổ chân)

### Lưu ý quan trọng:
- **Occluded joints**: nếu joint bị che khuất, vẫn phải estimate vị trí và đặt điểm (label studio có flag "occluded")
- **Consistency**: luôn label từ góc nhìn của camera (left/right theo camera, không theo người)
- **Speed tip**: dùng keyboard shortcuts trong Label Studio, target 30-50 ảnh/giờ

## Bước 5: Tăng Tốc Với AI Pre-labeling

Label Studio hỗ trợ ML backend để auto-predict trước:

```bash
# Cài ML backend với MediaPipe
pip install label-studio-ml
label-studio-ml init mediapipe_backend
```

Tạo file `mediapipe_backend/model.py`:
```python
import mediapipe as mp
from label_studio_ml.model import LabelStudioMLBase

class MediaPipePoseModel(LabelStudioMLBase):
    def predict(self, tasks, **kwargs):
        # Auto-predict keypoints với MediaPipe
        # User chỉ cần kiểm tra và chỉnh sửa
        ...
```

Với pre-labeling, tốc độ có thể tăng lên **100-200 ảnh/giờ**.

## Bước 6: Export và Convert

**Export từ Label Studio:**
1. Project → Export → COCO format

**Convert sang YOLOv8:**
```python
# Script convert COCO JSON → YOLOv8 YAML
python ai/training/prepare_dataset.py \
    --coco_json path/to/exported_coco.json \
    --output ai/datasets/custom_poses/
```

## Bước 7: Fine-tune Với Data Tự Label

```bash
# Fine-tune thêm 10 epochs với mixed data (COCO + custom)
python ai/training/train.py \
    --model ai/models/runs/pikpose_yolov8s_pose/weights/best.pt \
    --data ai/datasets/mixed_coco_custom.yaml \
    --epochs 10 \
    --batch 8 \
    --resume
```

## Kết Quả Kỳ Vọng

| Baseline | Sau Fine-tune |
|---|---|
| YOLOv8s-pose pretrained: ~92% | ~94-96% accuracy |
| Inference: ~15ms/frame | ~15ms/frame (không đổi) |

---

## Tài Nguyên Học Thêm

- [Label Studio Docs](https://labelstud.io/guide/)
- [COCO Keypoint Format](https://cocodataset.org/#format-data)
- [Ultralytics Pose Docs](https://docs.ultralytics.com/tasks/pose/)
- [MediaPipe Pose Landmarks](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
