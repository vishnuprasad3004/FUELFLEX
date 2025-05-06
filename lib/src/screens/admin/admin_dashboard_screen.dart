
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/auth_service.dart';
import '../../models/user_profile_model.dart'; // Import UserProfile for type safety
import '../../widgets/custom_drawer.dart';


class AdminDashboardScreen extends StatelessWidget {
  final UserProfile userProfile; // Pass the loaded UserProfile

  const AdminDashboardScreen({super.key, required this.userProfile});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Admin Dashboard', style: TextStyle(color: theme.colorScheme.onPrimary)),
        backgroundColor: theme.colorScheme.primary,
        iconTheme: IconThemeData(color: theme.colorScheme.onPrimary),
        elevation: 4,
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
      drawer: CustomDrawer(userProfile: userProfile),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            _buildWelcomeCard(context, userProfile),
            const SizedBox(height: 20),
            Text("Platform Overview", style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildOverviewSection(context),
            const SizedBox(height: 20),
             Text("Management Sections", style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildManagementGrid(context),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard(BuildContext context, UserProfile userProfile) {
    final theme = Theme.of(context);
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${userProfile.displayName ?? userProfile.email?.split('@')[0] ?? 'Admin'}!',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Manage and monitor platform activities efficiently.',
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.7)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewSection(BuildContext context) {
    // Placeholder data - replace with actual data fetching
    final summaryData = [
      {'icon': Icons.list_alt_rounded, 'label': 'Total Bookings', 'value': '125+'},
      {'icon': Icons.people_alt_rounded, 'label': 'Active Users', 'value': '50+'},
      {'icon': Icons.local_shipping_rounded, 'label': 'Ongoing Transports', 'value': '15'},
      {'icon': Icons.currency_rupee_rounded, 'label': 'Pending Repayments', 'value': '₹25,000'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.8, // Adjust for better fit
      ),
      itemCount: summaryData.length,
      itemBuilder: (context, index) {
        final item = summaryData[index];
        return Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(item['icon'] as IconData, size: 30, color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: 8),
                Text(
                  item['value'] as String,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  item['label'] as String,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

   Widget _buildManagementGrid(BuildContext context) {
    final managementItems = [
      {'icon': Icons.assignment_turned_in_rounded, 'title': 'Bookings', 'subtitle': 'View & Manage', 'onTap': () { /* Navigate to bookings list */ }},
      {'icon': Icons.inventory_2_rounded, 'title': 'Goods Listings', 'subtitle': 'Monitor Items', 'onTap': () { /* Navigate to goods list */ }},
      {'icon': Icons.supervised_user_circle_rounded, 'title': 'Users', 'subtitle': 'Manage Roles', 'onTap': () { /* Navigate to user management */ }},
      {'icon': Icons.directions_car_filled_rounded, 'title': 'Transports', 'subtitle': 'Track Status', 'onTap': () { /* Navigate to transport tracking */ }},
      {'icon': Icons.payment_rounded, 'title': 'Repayments', 'subtitle': 'Oversee Dues', 'onTap': () { /* Navigate to repayments */ }},
      {'icon': Icons.settings_applications_rounded, 'title': 'Settings', 'subtitle': 'Platform Config', 'onTap': () { /* Navigate to settings */ }},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.2,
      ),
      itemCount: managementItems.length,
      itemBuilder: (context, index) {
        final item = managementItems[index];
        return Card(
          elevation: 3,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: InkWell(
            onTap: item['onTap'] as void Function(),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(item['icon'] as IconData, size: 40, color: Theme.of(context).colorScheme.secondary),
                  const SizedBox(height: 12),
                  Text(
                    item['title'] as String,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                   Text(
                    item['subtitle'] as String,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
