import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';
import 'package:pose_booth/core/pose/coco_mapper.dart';

void main() {
  test('maps 33 slots to 17 coco in order', () {
    final fake33 = List.generate(33, (i) => (x: i * 10.0, y: 50.0, likelihood: 0.9));
    fake33[0] = (x: 50.0, y: 20.0, likelihood: 1.0);
    final coco = CocoMapper.fromMlKitIndexes(fake33, const Size(100, 200));
    expect(coco, hasLength(17));
    expect(coco[0].x, closeTo(0.5, 0.01));
    expect(coco[0].y, closeTo(0.1, 0.01));
  });
}
