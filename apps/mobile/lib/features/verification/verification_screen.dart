import 'package:flutter/material.dart';

class VerificationScreen extends StatelessWidget {
  const VerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Email', 'Verification link or code', Icons.email_outlined),
      ('Phone', 'OTP verification', Icons.sms_outlined),
      ('Selfie', 'Blink, smile, turn left, turn right', Icons.face_outlined),
      ('Government ID', 'Passport, national ID, or driver license', Icons.badge_outlined),
      ('Social', 'Optional social review', Icons.public),
      ('Reference', 'Optional consent-based friend check', Icons.people_outline),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Verification')),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return Card(
            child: ListTile(
              leading: Icon(item.$3),
              title: Text(item.$1),
              subtitle: Text(item.$2),
              trailing: FilledButton.tonal(onPressed: () {}, child: const Text('Start')),
            ),
          );
        },
        separatorBuilder: (_, __) => const SizedBox(height: 8),
      ),
    );
  }
}

