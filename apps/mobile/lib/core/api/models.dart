class KeypointDto {
  const KeypointDto({required this.x, required this.y, this.confidence = 1});

  final double x;
  final double y;
  final double confidence;

  Map<String, dynamic> toJson() => {
        'x': x,
        'y': y,
        'confidence': confidence,
      };
}

class HealthResponse {
  const HealthResponse({required this.status, this.profile});

  final String status;
  final String? profile;

  factory HealthResponse.fromJson(Map<String, dynamic> json) {
    return HealthResponse(
      status: json['status'] as String? ?? 'unknown',
      profile: json['profile'] as String?,
    );
  }
}

class ScoreResponse {
  const ScoreResponse({required this.score, required this.feedback});

  final int score;
  final List<String> feedback;

  factory ScoreResponse.fromJson(Map<String, dynamic> json) {
    return ScoreResponse(
      score: (json['score'] as num?)?.toInt() ?? 0,
      feedback: (json['feedback'] as List<dynamic>? ?? const [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class PoseTemplate {
  const PoseTemplate({
    required this.id,
    required this.nameVi,
    required this.keypoints,
  });

  final String id;
  final String nameVi;
  final List<List<double>> keypoints;

  factory PoseTemplate.fromJson(Map<String, dynamic> json) {
    return PoseTemplate(
      id: json['id'] as String,
      nameVi: json['name_vi'] as String? ?? json['name'] as String? ?? '',
      keypoints: (json['keypoints'] as List<dynamic>)
          .map((row) => (row as List<dynamic>).map((n) => (n as num).toDouble()).toList())
          .toList(),
    );
  }

  List<KeypointDto> asTargets() => [
        for (final p in keypoints)
          KeypointDto(x: p[0], y: p[1], confidence: 1),
      ];
}

class SuggestResponse {
  const SuggestResponse({required this.poses});

  final List<PoseTemplate> poses;

  factory SuggestResponse.fromJson(Map<String, dynamic> json) {
    final list = json['poses'] as List<dynamic>? ?? const [];
    return SuggestResponse(
      poses: list.map((e) => PoseTemplate.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

class AnalyzePerson {
  const AnalyzePerson({required this.keypoints});

  final List<KeypointDto> keypoints;
}

class AnalyzeResponse {
  const AnalyzeResponse({required this.persons});

  final List<AnalyzePerson> persons;

  factory AnalyzeResponse.fromJson(Map<String, dynamic> json) {
    final persons = <AnalyzePerson>[];
    for (final raw in json['persons'] as List<dynamic>? ?? const []) {
      final map = raw as Map<String, dynamic>;
      final kps = (map['keypoints'] as List<dynamic>? ?? const []).map((k) {
        final m = k as Map<String, dynamic>;
        return KeypointDto(
          x: (m['x'] as num).toDouble(),
          y: (m['y'] as num).toDouble(),
          confidence: (m['confidence'] as num?)?.toDouble() ?? 1,
        );
      }).toList();
      persons.add(AnalyzePerson(keypoints: kps));
    }
    return AnalyzeResponse(persons: persons);
  }
}

class PoseApiException implements Exception {
  PoseApiException(this.message);
  final String message;
  @override
  String toString() => message;
}
