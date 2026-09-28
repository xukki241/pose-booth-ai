import 'dart:ui';

import '../api/models.dart';

/// MediaPipe / ML Kit 33-landmark indices → COCO 17, same as web MP_TO_COCO_MAP.
const Map<int, int> mlIndexToCoco = {
  0: 0,
  2: 1,
  5: 2,
  7: 3,
  8: 4,
  11: 5,
  12: 6,
  13: 7,
  14: 8,
  15: 9,
  16: 10,
  23: 11,
  24: 12,
  25: 13,
  26: 14,
  27: 15,
  28: 16,
};

class CocoMapper {
  static List<KeypointDto> fromMlKitIndexes(
    List<({double x, double y, double likelihood})> landmarks33,
    Size imageSize,
  ) {
    final coco = List<KeypointDto>.generate(
      17,
      (_) => const KeypointDto(x: 0, y: 0, confidence: 0),
    );
    mlIndexToCoco.forEach((ml, cocoIdx) {
      if (ml >= landmarks33.length) return;
      final lm = landmarks33[ml];
      coco[cocoIdx] = KeypointDto(
        x: (lm.x / imageSize.width).clamp(0, 1),
        y: (lm.y / imageSize.height).clamp(0, 1),
        confidence: lm.likelihood.clamp(0, 1),
      );
    });
    return coco;
  }
}
