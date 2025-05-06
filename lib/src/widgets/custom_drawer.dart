
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../models/user_profile_model.dart';
// Import screen routes as needed
import '../screens/buyer_seller/browse_goods_screen.dart';
import '../screens/buyer_seller/sell_goods_screen.dart';
import '../screens/buyer_seller/book_transport_screen.dart';
import '../screens/buyer_seller/my_bookings_screen.dart';

class CustomDrawer extends StatelessWidget {
  final UserProfile userProfile;

  const CustomDrawer({super.key, required this.userProfile});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authService = Provider.of<AuthService>(context, listen: false);

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: <Widget>[
          UserAccountsDrawerHeader(
            accountName: Text(
              userProfile.displayName ?? 'User',
              style: TextStyle(
                color: theme.colorScheme.onPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            accountEmail: Text(
              userProfile.email ?? 'No email',
              style: TextStyle(color: theme.colorScheme.onPrimary.withOpacity(0.8)),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: theme.colorScheme.onPrimary,
              child: Text(
                (userProfile.displayName?.isNotEmpty == true
                        ? userProfile.displayName![0]
                        : userProfile.email?.isNotEmpty == true
                            ? userProfile.email![0]
                            : 'U')
                    .toUpperCase(),
                style: TextStyle(fontSize: 40.0, color: theme.colorScheme.primary),
              ),
            ),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
            ),
          ),
          if (userProfile.role == UserRole.buyerSeller) ...[
            ListTile(
              leading: Icon(Icons.store_mall_directory_outlined, color: theme.colorScheme.secondary),
              title: const Text('Browse Goods'),
              onTap: () {
                Navigator.pop(context); // Close drawer
                // Navigate to BrowseGoodsScreen - ensure it's part of BuyerSellerDashboard or handle directly
                // This assumes BuyerSellerDashboard handles its own internal navigation for these
                 if (ModalRoute.of(context)?.settings.name != '/browse_goods') {
                   // Example of direct navigation if not using a tabbed dashboard.
                   // Adjust based on your BuyerSellerDashboard structure.
                   // Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const BrowseGoodsScreen()));
                 }
              },
            ),
            ListTile(
              leading: Icon(Icons.add_business_outlined, color: theme.colorScheme.secondary),
              title: const Text('Sell Goods'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const SellGoodsScreen()));
              },
            ),
             ListTile(
              leading: Icon(Icons.local_shipping_outlined, color: theme.colorScheme.secondary),
              title: const Text('Book Transport'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const BookTransportScreen()));
              },
            ),
            ListTile(
              leading: Icon(Icons.receipt_long_outlined, color: theme.colorScheme.secondary),
              title: const Text('My Transport Bookings'),
              onTap: () {
                 Navigator.pop(context);
                 Navigator.push(context, MaterialPageRoute(builder: (context) => const MyBookingsScreen()));
              },
            ),
          ],
          if (userProfile.role == UserRole.transportOwner) ...[
            ListTile(
              leading: Icon(Icons.dashboard_outlined, color: theme.colorScheme.secondary),
              title: const Text('My Fleet'),
              onTap: () {
                Navigator.pop(context);
                // OwnerDashboardScreen should be the main screen for this role
              },
            ),
            // Add more owner-specific links: My Trips, Earnings, etc.
          ],
          if (userProfile.role == UserRole.admin) ...[
             ListTile(
              leading: Icon(Icons.admin_panel_settings_outlined, color: theme.colorScheme.secondary),
              title: const Text('Platform Overview'),
              onTap: () {
                Navigator.pop(context);
                // AdminDashboardScreen should be the main screen
              },
            ),
            // Add more admin links: Manage Users, Manage Bookings, Settings etc.
          ],
          const Divider(),
          ListTile(
            leading: Icon(Icons.settings_outlined, color: theme.colorScheme.secondary),
            title: const Text('Settings'),
            onTap: () {
              // TODO: Navigate to Settings screen
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: Icon(Icons.logout, color: theme.colorScheme.error),
            title: Text('Logout', style: TextStyle(color: theme.colorScheme.error)),
            onTap: () async {
              Navigator.pop(context);
              await authService.signOut();
              // AuthGate will handle navigation to login
            },
          ),
        ],
      ),
    );
  }
}
