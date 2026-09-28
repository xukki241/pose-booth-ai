import 'package:flutter_test/flutter_test.dart';
import 'package:pose_booth/core/booth/photo_filters.dart';

void main() {
  test('photo filters match web ids and names', () {
    expect(photoFilters.map((item) => item.id).toList(), [
      'original',
      'milk',
      'peach',
      'rose',
      'candy',
      'cream',
      'sunshine',
      'honey',
      'latte',
      'cocoa',
      'vintage',
      'film',
      'faded',
      'cool',
      'mint',
      'ocean',
      'pop',
      'mono',
      'noir',
      'silver',
      'sepia',
      'golden',
      'polaroid',
      'arctic',
    ]);
    expect(photoFilters.first.name, 'Nguyên bản');
    expect(photoFilters.length, 24);
  });
}
