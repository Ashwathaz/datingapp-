import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:soulsync_mobile/main.dart';

void main() {
  testWidgets('renders SoulSync auth screen', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SoulSyncApp()));
    expect(find.text('SoulSync'), findsOneWidget);
  });
}

