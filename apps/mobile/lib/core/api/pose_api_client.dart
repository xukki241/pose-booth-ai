import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

class PoseApiClient {
  PoseApiClient({required this.baseUrl, http.Client? httpClient})
      : httpClient = httpClient ?? http.Client();

  final String baseUrl;
  final http.Client httpClient;

  static String fromEnvironment() => const String.fromEnvironment(
        'API_BASE',
        defaultValue: 'http://127.0.0.1:8000',
      );

  Future<HealthResponse> health() async {
    final res = await httpClient.get(Uri.parse('$baseUrl/health'));
    if (res.statusCode != 200) {
      throw PoseApiException('health ${res.statusCode}');
    }
    return HealthResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<ScoreResponse> score({
    required List<KeypointDto> user,
    required List<KeypointDto> target,
  }) async {
    final res = await httpClient.post(
      Uri.parse('$baseUrl/api/pose/score'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'user_keypoints': user.map((e) => e.toJson()).toList(),
        'target_keypoints': target.map((e) => e.toJson()).toList(),
      }),
    );
    if (res.statusCode != 200) {
      throw PoseApiException('score ${res.statusCode}');
    }
    return ScoreResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<SuggestResponse> suggest({int limit = 80}) async {
    final res = await httpClient.get(Uri.parse('$baseUrl/api/pose/suggest?limit=$limit'));
    if (res.statusCode != 200) {
      throw PoseApiException('suggest ${res.statusCode}');
    }
    return SuggestResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<AnalyzeResponse> analyze({required String imageBase64, int maxPersons = 1}) async {
    final res = await httpClient.post(
      Uri.parse('$baseUrl/api/pose/analyze'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'image': imageBase64, 'max_persons': maxPersons}),
    );
    if (res.statusCode != 200) {
      throw PoseApiException('analyze ${res.statusCode}');
    }
    return AnalyzeResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }
}
