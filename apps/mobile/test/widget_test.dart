import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pose_booth/core/theme/comic_theme.dart';

void main() {
  test('comic theme is light-only', () {
    final theme = comicLightTheme(nunitoFamily: 'Nunito');
    expect(theme.brightness, Brightness.light);
    expect(theme.scaffoldBackgroundColor, ComicTokens.background);
    expect(theme.colorScheme.primary, ComicTokens.primary);
  });
}
