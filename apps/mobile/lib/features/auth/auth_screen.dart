import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../onboarding/onboarding_screen.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool loading = false;
  String? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 24),
            Text('SoulSync', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text('Verified dating for people who want something real.'),
            const SizedBox(height: 28),
            TextField(controller: email, decoration: const InputDecoration(labelText: 'Email')),
            const SizedBox(height: 12),
            TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
            if (error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(error!, style: const TextStyle(color: Colors.red))),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: loading ? null : login,
              child: Text(loading ? 'Signing in...' : 'Sign in'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const OnboardingScreen())),
              child: const Text('Create verified account'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> login() async {
    setState(() { loading = true; error = null; });
    try {
      final response = await ref.read(dioProvider).post('/auth/login', data: {'email': email.text, 'password': password.text});
      ref.read(sessionProvider.notifier).setTokens(response.data as Map<String, dynamic>);
    } catch (e) {
      setState(() => error = 'Unable to sign in.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

