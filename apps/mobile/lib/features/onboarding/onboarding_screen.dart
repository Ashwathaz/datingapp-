import 'package:flutter/material.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final steps = [
      'Account creation',
      'Personal information',
      'Relationship preferences',
      'Work and education',
      'Lifestyle',
      'Minimum 5 interests',
      'Entertainment profile',
      'Bio',
      'Media upload',
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Create Account')),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemBuilder: (context, index) => ListTile(
          leading: CircleAvatar(child: Text('${index + 1}')),
          title: Text(steps[index]),
          subtitle: const Text('Required before matching is unlocked'),
          trailing: const Icon(Icons.chevron_right),
        ),
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemCount: steps.length,
      ),
    );
  }
}

