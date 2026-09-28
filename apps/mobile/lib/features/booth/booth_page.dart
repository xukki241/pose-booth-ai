import 'dart:convert';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../core/api/models.dart';
import '../../core/api/pose_api_client.dart';
import '../../core/booth/photo_filters.dart';
import '../../core/pose/coco_mapper.dart';
import '../../core/pose/silk_contour_painter.dart';
import '../../core/theme/comic_theme.dart';

class _FrameColor {
  const _FrameColor({
    required this.id,
    required this.name,
    required this.background,
    required this.border,
  });

  final String id;
  final String name;
  final Color background;
  final Color border;
}

/// Matches web `FRAME_COLORS` swatches (Tailwind black / violet-950 / amber-950 / cyan-950).
const _frameColors = <_FrameColor>[
  _FrameColor(
    id: 'dark',
    name: 'Obsidian',
    background: Color(0xFF000000),
    border: Color(0x33FFFFFF),
  ),
  _FrameColor(
    id: 'violet',
    name: 'Prism Violet',
    background: Color(0xFF2E1065),
    border: Color(0x808B5CF6),
  ),
  _FrameColor(
    id: 'champagne',
    name: 'Champagne Gold',
    background: Color(0xFF451A03),
    border: Color(0x80FBBF24),
  ),
  _FrameColor(
    id: 'cyan',
    name: 'Cyber Cyan',
    background: Color(0xFF083344),
    border: Color(0x8006B6D4),
  ),
];

class _BoothSticker {
  const _BoothSticker({required this.id, required this.name, required this.emoji});

  final String id;
  final String name;
  final String emoji;
}

const _stickers = <_BoothSticker>[
  _BoothSticker(id: 'heart', name: 'Tim', emoji: '❤️'),
  _BoothSticker(id: 'star', name: 'Sao', emoji: '⭐'),
  _BoothSticker(id: 'sparkle', name: 'Lấp lánh', emoji: '✨'),
  _BoothSticker(id: 'bow', name: 'Nơ', emoji: '🎀'),
  _BoothSticker(id: 'camera', name: 'Máy ảnh', emoji: '📷'),
  _BoothSticker(id: 'flower', name: 'Hoa', emoji: '🌸'),
];

/// Six overlay slots matching web booth sticker spots.
const _stickerSlots = <Alignment>[
  Alignment(-0.85, -0.78),
  Alignment(0.82, -0.62),
  Alignment(-0.78, 0.72),
  Alignment(0.85, 0.78),
  Alignment(0.0, -0.88),
  Alignment(0.72, -0.33),
];

class BoothPage extends StatefulWidget {
  const BoothPage({super.key, required this.api});

  final PoseApiClient api;

  @override
  State<BoothPage> createState() => _BoothPageState();
}

class _BoothPageState extends State<BoothPage> {
  CameraController? _camera;
  PoseDetector? _detector;
  List<CameraDescription> _cameras = [];
  var _front = true;
  var _busy = false;
  List<KeypointDto> _live = const [];
  List<KeypointDto> _target = const [];
  List<PoseTemplate> _library = const [];
  int _selected = 0;
  int _score = 0;
  String _feedback = 'Đứng vào khung để chấm điểm';
  String _health = 'đang kiểm tra API…';
  DateTime _lastScore = DateTime.fromMillisecondsSinceEpoch(0);
  String _filterId = 'original';
  final List<String> _stickerIds = [];
  _FrameColor _frame = _frameColors.first;

  PhotoFilter get _activeFilter => photoFilters.firstWhere(
        (item) => item.id == _filterId,
        orElse: () => photoFilters.first,
      );

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    _detector = PoseDetector(
      options: PoseDetectorOptions(mode: PoseDetectionMode.stream),
    );
    try {
      final h = await widget.api.health();
      _health = 'API: ${h.status}';
    } catch (e) {
      _health = 'API lỗi: $e';
    }
    try {
      final s = await widget.api.suggest(limit: 80);
      _library = s.poses;
      if (_library.isNotEmpty) {
        _target = _library.first.asTargets();
      }
    } catch (_) {}
    final granted = await Permission.camera.request();
    if (!granted.isGranted) {
      if (mounted) setState(() => _health = 'Cần quyền Camera trong Cài đặt');
      return;
    }
    _cameras = await availableCameras();
    if (!mounted) return;
    await _openCamera(front: true);
    if (mounted) setState(() {});
  }

  Future<void> _openCamera({required bool front}) async {
    final previous = _camera;
    _camera = null;
    await previous?.dispose();
    if (!mounted) return;
    final lens = front ? CameraLensDirection.front : CameraLensDirection.back;
    final desc = _cameras.firstWhere(
      (c) => c.lensDirection == lens,
      orElse: () => _cameras.first,
    );
    final controller = CameraController(
      desc,
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.nv21,
    );
    await controller.initialize();
    if (!mounted) {
      await controller.dispose();
      return;
    }
    await controller.startImageStream(_onImage);
    if (!mounted) {
      await controller.dispose();
      return;
    }
    _camera = controller;
    _front = desc.lensDirection == CameraLensDirection.front;
    if (mounted) setState(() {});
  }

  Future<void> _onImage(CameraImage image) async {
    final cam = _camera;
    if (_busy || _detector == null || cam == null) return;
    _busy = true;
    try {
      final input = _toInputImage(image, cam.description);
      if (input == null) return;
      final poses = await _detector!.processImage(input);
      if (!mounted || _camera != cam) return;
      if (poses.isEmpty) return;
      final pose = poses.first;
      final ordered = List<({double x, double y, double likelihood})>.filled(
        33,
        (x: 0, y: 0, likelihood: 0),
      );
      for (final entry in pose.landmarks.entries) {
        final idx = entry.key.index;
        if (idx < 0 || idx > 32) continue;
        final lm = entry.value;
        ordered[idx] = (x: lm.x, y: lm.y, likelihood: lm.likelihood);
      }
      final coco = CocoMapper.fromMlKitIndexes(
        ordered,
        Size(image.width.toDouble(), image.height.toDouble()),
      );
      _live = coco;
      final now = DateTime.now();
      if (_target.length == 17 && now.difference(_lastScore).inMilliseconds >= 600) {
        _lastScore = now;
        try {
          final scored = await widget.api.score(user: coco, target: _target);
          if (!mounted || _camera != cam) return;
          _score = scored.score;
          if (scored.feedback.isNotEmpty) _feedback = scored.feedback.first;
        } catch (_) {}
      }
      if (mounted) setState(() {});
    } finally {
      _busy = false;
    }
  }

  InputImage? _toInputImage(CameraImage image, CameraDescription desc) {
    final plane = image.planes.first;
    final bytes = plane.bytes;
    final rotation = InputImageRotationValue.fromRawValue(desc.sensorOrientation) ??
        InputImageRotation.rotation0deg;
    final format = InputImageFormatValue.fromRawValue(image.format.raw) ?? InputImageFormat.nv21;
    return InputImage.fromBytes(
      bytes: bytes,
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: rotation,
        format: format,
        bytesPerRow: plane.bytesPerRow,
      ),
    );
  }

  @override
  void dispose() {
    _camera?.dispose();
    _detector?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cam = _camera;
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Phòng chụp', style: TextStyle(fontWeight: FontWeight.w900)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(28),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(_health, style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.7))),
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _frame.background,
                border: Border.all(color: ComicTokens.ink, width: 3),
                boxShadow: const [BoxShadow(color: ComicTokens.ink, offset: ComicTokens.shadow)],
              ),
              foregroundDecoration: BoxDecoration(
                border: Border.all(color: _frame.border, width: 6),
              ),
              child: cam == null || !cam.value.isInitialized
                  ? Center(child: CircularProgressIndicator(color: scheme.primary))
                  : ClipRect(
                      child: AspectRatio(
                        aspectRatio: 3 / 4,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            ColorFiltered(
                              colorFilter: _activeFilter.colorFilter,
                              child: CameraPreview(cam),
                            ),
                            CustomPaint(
                              painter: SilkContourPainter(
                                live: _live,
                                target: _target,
                                score: _score,
                                mirrorX: _front,
                              ),
                            ),
                            ..._stickerOverlays(),
                            Positioned(
                              left: 12,
                              top: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                color: scheme.primary,
                                child: Text(
                                  '$_score',
                                  style: TextStyle(
                                    color: scheme.onPrimary,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 28,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(_feedback, style: TextStyle(fontWeight: FontWeight.w700, color: scheme.onSurface)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
            child: Row(
              children: [
                for (final frame in _frameColors) ...[
                  _frameButton(frame, scheme),
                  const SizedBox(width: 10),
                ],
              ],
            ),
          ),
          SizedBox(
            height: 52,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              scrollDirection: Axis.horizontal,
              itemCount: photoFilters.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final item = photoFilters[i];
                return _comicChip(
                  selected: item.id == _filterId,
                  label: item.name,
                  onTap: () => setState(() => _filterId = item.id),
                );
              },
            ),
          ),
          SizedBox(
            height: 52,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(12, 4, 12, 4),
              scrollDirection: Axis.horizontal,
              itemCount: _stickers.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final item = _stickers[i];
                final on = _stickerIds.contains(item.id);
                return _comicChip(
                  selected: on,
                  label: '${item.emoji} ${item.name}',
                  onTap: () => _toggleSticker(item.id),
                );
              },
            ),
          ),
          SizedBox(
            height: 64,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemCount: _library.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final selected = i == _selected;
                return _comicChip(
                  selected: selected,
                  label: _library[i].nameVi,
                  onTap: () {
                    setState(() {
                      _selected = i;
                      _target = _library[i].asTargets();
                    });
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            child: Row(
              children: [
                Expanded(
                  child: FilledButton(
                    onPressed: () => _openCamera(front: !_front),
                    child: const Text('Lật camera'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: cam == null ? null : _capture,
                    child: const Text('Chụp'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: _pickSample,
                    child: const Text('Ảnh mẫu'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _stickerOverlays() {
    if (_stickerIds.isEmpty) return const [];
    return [
      for (var i = 0; i < _stickerIds.length; i++)
        Align(
          alignment: _stickerSlots[i % _stickerSlots.length],
          child: IgnorePointer(
            child: Text(
              _stickers.firstWhere((item) => item.id == _stickerIds[i], orElse: () => _stickers.first).emoji,
              style: const TextStyle(fontSize: 40, height: 1),
            ),
          ),
        ),
    ];
  }

  void _toggleSticker(String id) {
    setState(() {
      if (_stickerIds.contains(id)) {
        _stickerIds.remove(id);
      } else if (_stickerIds.length < _stickerSlots.length) {
        _stickerIds.add(id);
      }
    });
  }

  Widget _frameButton(_FrameColor frame, ColorScheme scheme) {
    final selected = _frame.id == frame.id;
    return Tooltip(
      message: frame.name,
      child: Semantics(
        button: true,
        selected: selected,
        label: frame.name,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: () => setState(() => _frame = frame),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: frame.background,
              shape: BoxShape.circle,
              border: Border.all(
                color: selected ? scheme.primary : ComicTokens.ink,
                width: selected ? 3 : 2,
              ),
              boxShadow: selected
                  ? null
                  : const [BoxShadow(color: ComicTokens.ink, offset: Offset(2, 2))],
            ),
            child: selected ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
          ),
        ),
      ),
    );
  }

  Widget _comicChip({
    required bool selected,
    required String label,
    required VoidCallback onTap,
  }) {
    final scheme = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? scheme.primary : scheme.surface,
          border: Border.all(color: ComicTokens.ink, width: 2),
          boxShadow: const [BoxShadow(color: ComicTokens.ink, offset: Offset(2, 2))],
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? scheme.onPrimary : scheme.onSurface,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }

  Future<void> _pickSample() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    final b64 = base64Encode(bytes);
    if (!mounted) return;
    try {
      final result = await widget.api.analyze(imageBase64: b64);
      if (!mounted) return;
      if (result.persons.isNotEmpty && result.persons.first.keypoints.length >= 17) {
        setState(() {
          _target = result.persons.first.keypoints.take(17).toList();
          _feedback = 'Đã lấy dáng từ ảnh mẫu';
        });
      } else {
        setState(() => _feedback = 'Không thấy người trong ảnh mẫu');
      }
    } catch (e) {
      if (mounted) setState(() => _feedback = 'Analyze lỗi: $e');
    }
  }

  Future<void> _capture() async {
    final cam = _camera;
    if (cam == null) return;
    try {
      await cam.stopImageStream();
    } catch (_) {}
    if (!mounted || _camera != cam) return;
    final file = await cam.takePicture();
    if (!mounted || _camera != cam) return;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ảnh đã chụp'),
        content: ColorFiltered(
          colorFilter: _activeFilter.colorFilter,
          child: Image.file(File(file.path)),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Đóng')),
        ],
      ),
    );
    if (!mounted || _camera != cam) return;
    try {
      await cam.startImageStream(_onImage);
    } catch (_) {}
  }
}
