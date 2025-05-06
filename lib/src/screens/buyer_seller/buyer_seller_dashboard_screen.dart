
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/auth_service.dart';
import '../../models/user_profile_model.dart';
import '../../widgets/custom_drawer.dart';
import 'browse_goods_screen.dart';
import 'sell_goods_screen.dart';
import 'my_bookings_screen.dart'; // You'll need to create this

class BuyerSellerDashboardScreen extends StatefulWidget {
  final UserProfile userProfile;
  const BuyerSellerDashboardScreen({super.key, required this.userProfile});

  @override
  State<BuyerSellerDashboardScreen> createState() => _BuyerSellerDashboardScreenState();
}

class _BuyerSellerDashboardScreenState extends State<BuyerSellerDashboardScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    BrowseGoodsScreen(), // Default view
    SellGoodsScreen(),
    MyBookingsScreen(), // Placeholder for user's bookings list
    // Add more screens like "My Listings", "Profile" here
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  String _getTitleForIndex(int index) {
    switch (index) {
      case 0:
        return 'Browse Goods';
      case 1:
        return 'Sell Your Goods';
      case 2:
        return 'My Transport Bookings';
      default:
        return 'Marketplace';
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(_getTitleForIndex(_selectedIndex), style: TextStyle(color: theme.colorScheme.onPrimary)),
        backgroundColor: theme.colorScheme.primary,
        iconTheme: IconThemeData(color: theme.colorScheme.onPrimary),
        elevation: 2,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () async {
              await authService.signOut();
              // AuthGate will handle navigation
            },
          ),
        ],
      ),
      drawer: CustomDrawer(userProfile: widget.userProfile),
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.store_mall_directory_outlined),
            activeIcon: Icon(Icons.store_mall_directory),
            label: 'Browse',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.add_business_outlined),
            activeIcon: Icon(Icons.add_business),
            label: 'Sell',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long),
            label: 'My Bookings',
          ),
          // Add more items for other sections like "My Listings", "Profile"
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: theme.colorScheme.primary,
        unselectedItemColor: theme.colorScheme.onSurface.withOpacity(0.6),
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed, // Use fixed for more than 3 items
        showUnselectedLabels: true,
      ),
    );
  }
}
