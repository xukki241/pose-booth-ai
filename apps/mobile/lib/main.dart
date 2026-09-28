import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/api/pose_api_client.dart';
import 'core/theme/comic_theme.dart';
import 'features/booth/booth_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PoseBoothApp());
}

class PoseBoothApp extends StatelessWidget {
  const PoseBoothApp({super.key});

  @override
  Widget build(BuildContext context) {
    final nunito = GoogleFonts.nunito().fontFamily ?? 'Nunito';
    return MaterialApp(
      title: 'PoseBooth AI',
      debugShowCheckedModeBanner: false,
      theme: comicLightTheme(nunitoFamily: nunito),
      darkTheme: comicDarkTheme(nunitoFamily: nunito),
      themeMode: ThemeMode.system,
      home: BoothPage(api: PoseApiClient(baseUrl: PoseApiClient.fromEnvironment())),
    );
  }
}
