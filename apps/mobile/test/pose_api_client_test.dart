import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:pose_booth/core/api/pose_api_client.dart';

void main() {
  test('health parses status ok', () async {
    final client = PoseApiClient(
      baseUrl: 'http://example',
      httpClient: MockClient((_) async => http.Response('{"status":"ok","profile":"edge"}', 200)),
    );
    final h = await client.health();
    expect(h.status, 'ok');
    expect(h.profile, 'edge');
  });
}
