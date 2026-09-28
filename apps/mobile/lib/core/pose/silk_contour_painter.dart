import 'package:flutter/material.dart';

import '../api/models.dart';
import '../theme/comic_theme.dart';

const cocoBones = <(int, int)>[
  (5, 6),
  (5, 7),
  (7, 9),
  (6, 8),
  (8, 10),
  (5, 11),
  (6, 12),
  (11, 12),
  (11, 13),
  (13, 15),
  (12, 14),
  (14, 16),
];

class SilkContourPainter extends CustomPainter {
  SilkContourPainter({
    required this.live,
    required this.target,
    required this.score,
    required this.mirrorX,
  });

  final List<KeypointDto> live;
  final List<KeypointDto> target;
  final int score;
  final bool mirrorX;

  Offset _pt(KeypointDto kp, Size size) {
    final x = mirrorX ? 1 - kp.x : kp.x;
    return Offset(x * size.width, kp.y * size.height);
  }

  @override
  void paint(Canvas canvas, Size size) {
    final matched = score >= 85;
    final livePaint = Paint()
      ..color = matched ? ComicTokens.goldMatch : Colors.white.withValues(alpha: 0.85)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final targetPaint = Paint()
      ..color = ComicTokens.ink.withValues(alpha: 0.35)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    final nodePaint = Paint()..color = ComicTokens.cyanRadar;

    void drawPose(List<KeypointDto> pose, Paint paint) {
      if (pose.length < 17) return;
      for (final bone in cocoBones) {
        canvas.drawLine(_pt(pose[bone.$1], size), _pt(pose[bone.$2], size), paint);
      }
    }

    drawPose(target, targetPaint);
    drawPose(live, livePaint);
    for (final kp in live) {
      if (kp.confidence < 0.2) continue;
      canvas.drawCircle(_pt(kp, size), 5, nodePaint);
    }
  }

  @override
  bool shouldRepaint(SilkContourPainter oldDelegate) {
    return oldDelegate.score != score ||
        oldDelegate.live != live ||
        oldDelegate.target != target ||
        oldDelegate.mirrorX != mirrorX;
  }
}
