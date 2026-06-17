import 'package:flutter/material.dart';

class DiscoveryScreen extends StatelessWidget {
  const DiscoveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Discover')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
              child: const Row(
                children: [
                  Icon(Icons.lock_outline),
                  SizedBox(width: 12),
                  Expanded(child: Text('Matching unlocks after email, phone, selfie, and government ID verification.')),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                child: const Center(child: Text('Verified compatibility recommendations appear here.')),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.close), label: const Text('Pass'))),
                const SizedBox(width: 10),
                Expanded(child: FilledButton.icon(onPressed: () {}, icon: const Icon(Icons.favorite), label: const Text('Like'))),
                const SizedBox(width: 10),
                Expanded(child: FilledButton.tonalIcon(onPressed: () {}, icon: const Icon(Icons.star), label: const Text('Super'))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

