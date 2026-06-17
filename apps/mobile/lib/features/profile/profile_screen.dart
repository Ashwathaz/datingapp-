import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Trust Score', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 10),
                  const LinearProgressIndicator(value: 0.0),
                  const SizedBox(height: 8),
                  const Text('Complete verification and media checks to earn the trusted profile badge.'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Card(child: ListTile(leading: Icon(Icons.workspace_premium), title: Text('Premium'), subtitle: Text('Unlimited likes, travel mode, incognito, boosts, and priority support.'))),
          const Card(child: ListTile(leading: Icon(Icons.security), title: Text('Safety'), subtitle: Text('Block, report, and chat-safety protections are always available.'))),
        ],
      ),
    );
  }
}

