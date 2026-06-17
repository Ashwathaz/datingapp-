import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:3000');

final dioProvider = Provider<Dio>((ref) {
  final session = ref.watch(sessionProvider);
  final dio = Dio(BaseOptions(baseUrl: '$apiBaseUrl/api/v1'));
  dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
    if (session.accessToken != null) {
      options.headers['authorization'] = 'Bearer ${session.accessToken}';
    }
    handler.next(options);
  }));
  return dio;
});

final sessionProvider = StateNotifierProvider<SessionController, SessionState>((ref) {
  return SessionController();
});

class SessionState {
  const SessionState({this.accessToken, this.refreshToken});
  final String? accessToken;
  final String? refreshToken;
  bool get isAuthenticated => accessToken != null;
}

class SessionController extends StateNotifier<SessionState> {
  SessionController() : super(const SessionState());

  void setTokens(Map<String, dynamic> tokens) {
    state = SessionState(accessToken: tokens['accessToken'] as String?, refreshToken: tokens['refreshToken'] as String?);
  }

  void logout() => state = const SessionState();
}

