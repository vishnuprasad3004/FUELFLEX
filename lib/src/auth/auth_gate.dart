
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';

import 'auth_service.dart';
import 'login_screen.dart';
import 'signup_screen.dart';
import '../screens/home_dispatcher_screen.dart'; // To dispatch to correct dashboard based on role

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);

    return StreamBuilder<User?>(
      stream: authService.authStateChanges,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasData) {
          // User is logged in, navigate to HomeDispatcherScreen
          // HomeDispatcherScreen will fetch profile and redirect based on role
          return HomeDispatcherScreen(user: snapshot.data!);
        }
        // User is not logged in, show LoginOrRegister
        return const LoginOrRegister();
      },
    );
  }
}

class LoginOrRegister extends StatefulWidget {
  const LoginOrRegister({super.key});

  @override
  State<LoginOrRegister> createState() => _LoginOrRegisterState();
}

class _LoginOrRegisterState extends State<LoginOrRegister> {
  bool showLoginPage = true;

  void toggleScreens() {
    setState(() {
      showLoginPage = !showLoginPage;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (showLoginPage) {
      return LoginScreen(onTap: toggleScreens);
    } else {
      return SignupScreen(onTap: toggleScreens);
    }
  }
}
