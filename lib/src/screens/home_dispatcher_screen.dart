
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../models/user_profile_model.dart';
import 'admin/admin_dashboard_screen.dart';
import 'buyer_seller/buyer_seller_dashboard_screen.dart';
import 'transport_owner/owner_dashboard_screen.dart';
import '../auth/login_screen.dart'; // Fallback if profile error

class HomeDispatcherScreen extends StatefulWidget {
  final User user; // Firebase User object
  const HomeDispatcherScreen({super.key, required this.user});

  @override
  State<HomeDispatcherScreen> createState() => _HomeDispatcherScreenState();
}

class _HomeDispatcherScreenState extends State<HomeDispatcherScreen> {
  Future<UserProfile?>? _userProfileFuture;

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  void _loadUserProfile() {
    final authService = Provider.of<AuthService>(context, listen: false);
    _userProfileFuture = authService.getUserProfile(widget.user.uid);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<UserProfile?>(
      future: _userProfileFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError || snapshot.data == null) {
          // Handle error or profile not found - e.g., log out and redirect to login
          print("Error fetching profile or profile not found: ${snapshot.error}");
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Provider.of<AuthService>(context, listen: false).signOut();
             // Show an error SnackBar before navigating
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Error loading user profile. Please try logging in again.'),
                backgroundColor: Colors.red,
              ),
            );
            // AuthGate will handle the navigation to LoginOrRegister due to signOut
          });
          // Displaying a loading or error message temporarily
          return const Scaffold(
            body: Center(child: Text('Error loading profile. Redirecting...')),
          );
        }

        final userProfile = snapshot.data!;

        switch (userProfile.role) {
          case UserRole.admin:
            return AdminDashboardScreen(userProfile: userProfile);
          case UserRole.transportOwner:
            return OwnerDashboardScreen(userProfile: userProfile);
          case UserRole.buyerSeller:
          default: // Fallback to buyerSeller if role is somehow unrecognized
            return BuyerSellerDashboardScreen(userProfile: userProfile);
        }
      },
    );
  }
}
