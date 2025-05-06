
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';

import 'firebase_options.dart';
import 'src/auth/auth_service.dart';
import 'src/auth/auth_gate.dart';
import 'src/theme/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        // Add other providers here (e.g., for goods, bookings)
      ],
      child: const FuelFlexApp(),
    ),
  );
}

class FuelFlexApp extends StatelessWidget {
  const FuelFlexApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    return MaterialApp(
      title: 'FuelFlex Transport',
      theme: themeProvider.lightTheme,
      darkTheme: themeProvider.darkTheme,
      themeMode: themeProvider.themeMode,
      home: const AuthGate(),
      debugShowCheckedModeBanner: false,
    );
  }
}
