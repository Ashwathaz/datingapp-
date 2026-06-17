import 'package:flutter/material.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Matches')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: const [
          ListTile(
            leading: CircleAvatar(child: Icon(Icons.favorite)),
            title: Text('No active matches yet'),
            subtitle: Text('Mutual likes unlock chat, AI icebreakers, and calls.'),
          ),
        ],
      ),
    );
  }
}

