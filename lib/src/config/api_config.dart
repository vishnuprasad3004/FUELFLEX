
class ApiConfig {
  // For local Next.js dev server when running Flutter on a physical device or non-Android emulator:
  // static const String baseUrl = 'http://localhost:9002/api';

  // For Android emulator accessing local Next.js dev server:
  static const String baseUrl = 'http://10.0.2.2:9002/api';

  // For iOS simulator accessing local Next.js dev server:
  // static const String baseUrl = 'http://localhost:9002/api'; // Usually works directly

  // When deployed, replace with your actual backend URL:
  // static const String baseUrl = 'https://your-deployed-backend.com/api';
}
