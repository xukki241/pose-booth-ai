import 'dart:convert';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../core/api/models.dart';
import '../../core/api/pose_api_client.dart';
import '../../core/pose/coco_mapper.dart';
import '../../core/pose/silk_contour_painter.dart';
import '../../core/theme/comic_theme.dart';

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
      setState(() => _health = 'Cần quyền Camera trong Cài đặt');
      return;
    }
    _cameras = await availableCameras();
    await _openCamera(front: true);
    if (mounted) setState(() {});
  }

  Future<void> _openCamera({required bool front}) async {
    await _camera?.dispose();
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
    await controller.startImageStream(_onImage);
    _camera = controller;
    _front = desc.lensDirection == CameraLensDirection.front;
    if (mounted) setState(() {});
  }

  Future<void> _onImage(CameraImage image) async {
    if (_busy || _detector == null) return;
    _busy = true;
    try {
      final input = _toInputImage(image, _camera!.description);
      if (input == null) return;
      final poses = await _detector!.processImage(input);
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Phòng chụp', style: TextStyle(fontWeight: FontWeight.w900)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(28),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(_health, style: const TextStyle(color: ComicTokens.mutedFg)),
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: ComicTokens.ink, width: 3),
                boxShadow: const [BoxShadow(color: ComicTokens.ink, offset: ComicTokens.shadow)],
              ),
              child: cam == null || !cam.value.isInitialized
                  ? const Center(child: CircularProgressIndicator())
                  : ClipRect(
                      child: AspectRatio(
                        aspectRatio: 3 / 4,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            CameraPreview(cam),
                            CustomPaint(
                              painter: SilkContourPainter(
                                live: _live,
                                target: _target,
                                score: _score,
                                mirrorX: _front,
                              ),
                            ),
                            Positioned(
                              left: 12,
                              top: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                color: ComicTokens.primary,
                                child: Text(
                                  '$_score',
                                  style: const TextStyle(
                                    color: Colors.white,
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
            child: Text(_feedback, style: const TextStyle(fontWeight: FontWeight.w700)),
          ),
          SizedBox(
            height: 72,
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              scrollDirection: Axis.horizontal,
              itemCount: _library.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final selected = i == _selected;
                return InkWell(
                  onTap: () {
                    setState(() {
                      _selected = i;
                      _target = _library[i].asTargets();
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected ? ComicTokens.primary : Colors.white,
                      border: Border.all(color: ComicTokens.ink, width: 2),
                    ),
                    child: Text(
                      _library[i].nameVi,
                      style: TextStyle(
                        color: selected ? Colors.white : ComicTokens.ink,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
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

  Future<void> _pickSample() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    final b64 = base64Encode(bytes);
    try {
      final result = await widget.api.analyze(imageBase64: b64);
      if (result.persons.isNotEmpty && result.persons.first.keypoints.length >= 17) {
        setState(() {
          _target = result.persons.first.keypoints.take(17).toList();
          _feedback = 'Đã lấy dáng từ ảnh mẫu';
        });
      } else {
        setState(() => _feedback = 'Không thấy người trong ảnh mẫu');
      }
    } catch (e) {
      setState(() => _feedback = 'Analyze lỗi: $e');
    }
  }

  Future<void> _capture() async {
    final cam = _camera;
    if (cam == null) return;
    try {
      await cam.stopImageStream();
    } catch (_) {}
    final file = await cam.takePicture();
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ảnh đã chụp'),
        content: Image.file(File(file.path)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Đóng')),
        ],
      ),
    );
    await cam.startImageStream(_onImage);
  }
}
