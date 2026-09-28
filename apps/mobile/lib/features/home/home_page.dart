import 'package:flutter/material.dart';

import '../../core/api/pose_api_client.dart';
import '../../core/motion/stamp_route.dart';
import '../../core/theme/comic_theme.dart';
import '../booth/booth_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key, required this.api});

  final PoseApiClient api;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Hero(
                tag: 'booth-nav',
                child: Material(
                  type: MaterialType.transparency,
                  child: Text(
                    'PoseBooth AI',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 28,
                      color: scheme.onSurface,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Chụp, lọc màu và ghép khung trên máy. Camera xử lý trên thiết bị.',
                style: TextStyle(fontWeight: FontWeight.w700, color: scheme.onSurface),
              ),
              const Spacer(),
              Hero(
                tag: 'booth-cta',
                child: Material(
                  type: MaterialType.transparency,
                  child: SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () {
                        Navigator.of(context).push(stampRoute(BoothPage(api: api)));
                      },
                      child: const Text('Phòng chụp'),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Chip lọc và sticker ở phòng chụp. Không animate camera.',
                style: TextStyle(color: ComicTokens.mutedFg, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
