import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Color-only presets matching `apps/web/lib/photo-filters.ts` ids/names.
class PhotoFilter {
  const PhotoFilter({
    required this.id,
    required this.name,
    required this.colorFilter,
  });

  final String id;
  final String name;
  final ColorFilter colorFilter;
}

const _kIdentity = <double>[
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

final List<PhotoFilter> photoFilters = [
  PhotoFilter(id: 'original', name: 'Nguyên bản', colorFilter: const ColorFilter.matrix(_kIdentity)),
  PhotoFilter(id: 'milk', name: 'Sữa', colorFilter: _css([_brightness(1.08), _contrast(0.92), _saturate(0.9)])),
  PhotoFilter(id: 'peach', name: 'Đào', colorFilter: _css([_sepia(0.16), _saturate(1.12), _brightness(1.06)])),
  PhotoFilter(id: 'rose', name: 'Hồng', colorFilter: _css([_sepia(0.18), _hueRotate(320), _saturate(1.15)])),
  PhotoFilter(id: 'candy', name: 'Kẹo ngọt', colorFilter: _css([_saturate(1.4), _brightness(1.06), _contrast(0.94)])),
  PhotoFilter(id: 'cream', name: 'Kem', colorFilter: _css([_sepia(0.24), _contrast(0.9), _brightness(1.08)])),
  PhotoFilter(id: 'sunshine', name: 'Nắng', colorFilter: _css([_sepia(0.22), _saturate(1.3), _brightness(1.08)])),
  PhotoFilter(id: 'honey', name: 'Mật ong', colorFilter: _css([_sepia(0.4), _saturate(1.2), _contrast(1.06)])),
  PhotoFilter(id: 'latte', name: 'Latte', colorFilter: _css([_sepia(0.35), _saturate(0.75), _contrast(0.92)])),
  PhotoFilter(id: 'cocoa', name: 'Cacao', colorFilter: _css([_sepia(0.45), _brightness(0.92), _contrast(1.12)])),
  PhotoFilter(id: 'vintage', name: 'Hoài niệm', colorFilter: _css([_sepia(0.5), _saturate(0.65), _contrast(0.88)])),
  PhotoFilter(id: 'film', name: 'Film', colorFilter: _css([_contrast(1.15), _saturate(0.8), _sepia(0.12)])),
  PhotoFilter(id: 'faded', name: 'Phai màu', colorFilter: _css([_contrast(0.8), _brightness(1.12), _saturate(0.65)])),
  PhotoFilter(id: 'cool', name: 'Trong veo', colorFilter: _css([_sepia(0.12), _hueRotate(170), _brightness(1.06)])),
  PhotoFilter(id: 'mint', name: 'Bạc hà', colorFilter: _css([_sepia(0.22), _hueRotate(70), _saturate(0.9)])),
  PhotoFilter(id: 'ocean', name: 'Biển', colorFilter: _css([_sepia(0.25), _hueRotate(160), _saturate(1.1)])),
  PhotoFilter(id: 'pop', name: 'Rực rỡ', colorFilter: _css([_saturate(1.65), _contrast(1.12)])),
  PhotoFilter(id: 'mono', name: 'Đen trắng', colorFilter: _css([_saturate(0)])),
  PhotoFilter(id: 'noir', name: 'Noir', colorFilter: _css([_saturate(0), _contrast(1.4), _brightness(0.92)])),
  PhotoFilter(id: 'silver', name: 'Bạc', colorFilter: _css([_saturate(0), _contrast(0.85), _brightness(1.15)])),
  PhotoFilter(id: 'sepia', name: 'Ảnh xưa', colorFilter: _css([_sepia(1), _contrast(0.95)])),
  PhotoFilter(id: 'golden', name: 'Hoàng kim', colorFilter: _css([_sepia(0.35), _saturate(1.25), _brightness(1.08)])),
  PhotoFilter(id: 'polaroid', name: 'Polaroid', colorFilter: _css([_contrast(1.08), _saturate(0.9), _brightness(1.1)])),
  PhotoFilter(id: 'arctic', name: 'Bắc cực', colorFilter: _css([_hueRotate(190), _saturate(0.85), _brightness(1.12)])),
];

ColorFilter _css(List<List<double>> steps) {
  var matrix = List<double>.from(_kIdentity);
  for (final step in steps) {
    matrix = _multiply(step, matrix);
  }
  return ColorFilter.matrix(matrix);
}

/// Applies [b] first, then [a] (CSS filter order).
List<double> _multiply(List<double> a, List<double> b) {
  final out = List<double>.filled(20, 0);
  for (var row = 0; row < 4; row++) {
    for (var col = 0; col < 5; col++) {
      var value = a[row * 5 + 0] * b[0 * 5 + col] +
          a[row * 5 + 1] * b[1 * 5 + col] +
          a[row * 5 + 2] * b[2 * 5 + col] +
          a[row * 5 + 3] * b[3 * 5 + col];
      if (col == 4) value += a[row * 5 + 4];
      out[row * 5 + col] = value;
    }
  }
  return out;
}

List<double> _brightness(double amount) => [
      amount, 0, 0, 0, 0,
      0, amount, 0, 0, 0,
      0, 0, amount, 0, 0,
      0, 0, 0, 1, 0,
    ];

List<double> _contrast(double amount) {
  final intercept = 128 * (1 - amount);
  return [
    amount, 0, 0, 0, intercept,
    0, amount, 0, 0, intercept,
    0, 0, amount, 0, intercept,
    0, 0, 0, 1, 0,
  ];
}

List<double> _saturate(double amount) {
  const lumR = 0.2126;
  const lumG = 0.7152;
  const lumB = 0.0722;
  final sr = (1 - amount) * lumR;
  final sg = (1 - amount) * lumG;
  final sb = (1 - amount) * lumB;
  return [
    sr + amount, sg, sb, 0, 0,
    sr, sg + amount, sb, 0, 0,
    sr, sg, sb + amount, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

List<double> _sepia(double amount) {
  final t = amount.clamp(0.0, 1.0);
  return [
    0.393 * t + 1 - t, 0.769 * t, 0.189 * t, 0, 0,
    0.349 * t, 0.686 * t + 1 - t, 0.168 * t, 0, 0,
    0.272 * t, 0.534 * t, 0.131 * t + 1 - t, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

List<double> _hueRotate(double degrees) {
  final rad = degrees * math.pi / 180;
  final cos = math.cos(rad);
  final sin = math.sin(rad);
  const lumR = 0.213;
  const lumG = 0.715;
  const lumB = 0.072;
  return [
    lumR + cos * (1 - lumR) + sin * (-lumR),
    lumG + cos * (-lumG) + sin * (-lumG),
    lumB + cos * (-lumB) + sin * (1 - lumB),
    0,
    0,
    lumR + cos * (-lumR) + sin * 0.143,
    lumG + cos * (1 - lumG) + sin * 0.140,
    lumB + cos * (-lumB) + sin * (-0.283),
    0,
    0,
    lumR + cos * (-lumR) + sin * (-(1 - lumR)),
    lumG + cos * (-lumG) + sin * lumG,
    lumB + cos * (1 - lumB) + sin * lumB,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}
