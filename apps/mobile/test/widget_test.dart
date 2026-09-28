import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pose_booth/core/theme/comic_theme.dart';

void main() {
  test('comic themes follow OS light and dark', () {
    final light = comicLightTheme(nunitoFamily: 'Nunito');
    expect(light.brightness, Brightness.light);
    expect(light.scaffoldBackgroundColor, ComicTokens.background);
    expect(light.colorScheme.primary, ComicTokens.primary);

    final dark = comicDarkTheme(nunitoFamily: 'Nunito');
    expect(dark.brightness, Brightness.dark);
    expect(dark.scaffoldBackgroundColor, const Color(0xFF171717));
    expect(dark.colorScheme.primary, const Color(0xFFFF6B9D));
    expect(dark.colorScheme.onSurface, const Color(0xFFF5F0EB));
  });
}
