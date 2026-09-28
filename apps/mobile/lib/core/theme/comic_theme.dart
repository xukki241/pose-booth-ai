import 'package:flutter/material.dart';

/// C-Comic light tokens — same as apps/web DESIGN.md / globals.css.
abstract final class ComicTokens {
  static const Color ink = Color(0xFF171717);
  static const Color background = Color(0xFFFFFFFF);
  static const Color primary = Color(0xFFB42355);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color secondary = Color(0xFFFFF1F5);
  static const Color accent = Color(0xFFFFE4EC);
  static const Color mutedFg = Color(0xFF62565C);
  static const Color goldMatch = Color(0xFFFCD34D);
  static const Color cyanRadar = Color(0xFF06B6D4);
  static const double border = 2;
  static const double radius = 8;
  static const Offset shadow = Offset(3, 3);
}

ThemeData comicLightTheme({required String nunitoFamily}) {
  final scheme = const ColorScheme.light(
    primary: ComicTokens.primary,
    onPrimary: ComicTokens.onPrimary,
    secondary: ComicTokens.secondary,
    onSecondary: ComicTokens.ink,
    surface: ComicTokens.background,
    onSurface: ComicTokens.ink,
    error: Color(0xFFB42318),
    onError: Colors.white,
  );
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: scheme,
    scaffoldBackgroundColor: ComicTokens.background,
    fontFamily: nunitoFamily,
    appBarTheme: const AppBarTheme(
      backgroundColor: ComicTokens.background,
      foregroundColor: ComicTokens.ink,
      elevation: 0,
    ),
  );
}
