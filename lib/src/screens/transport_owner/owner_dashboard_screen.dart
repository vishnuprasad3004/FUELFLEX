
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/auth_service.dart';
import '../../models/user_profile_model.dart';
import '../../widgets/custom_drawer.dart';

class OwnerDashboardScreen extends StatelessWidget {
  final UserProfile userProfile;
  const OwnerDashboardScreen({super.key, required this.userProfile});

  // Mock data for vehicle fleet
  final List<Map<String, dynamic>> _mockVehicles = const [
    {
      'id': 'V001',
      'name': 'Truck MH 14 AZ 5678',
      'location': 'Pune Ring Road (18.52, 73.85)',
      'fuelLevelPercent': 75,
      'fastagBalance': 2500.50,
      'status': 'Available'
    },
    {
      'id': 'V002',
      'name': 'Lorry TN 07 CQ 9012',
      'location': 'Chennai Bypass (13.08, 80.27)',
      'fuelLevelPercent': 40,
      'fastagBalance': 850.00,
      'status': 'On Trip'
    },
    {
      'id': 'V003',
      'name': 'Tanker DL 1 Z C 3456',
      'location': 'Delhi-Gurgaon Exp (28.70, 77.10)',
      'fuelLevelPercent': 90,
      'fastagBalance': 5120.75,
      'status': 'Maintenance'
    },
    {
      'id': 'V004',
      'name': 'Truck KA 01 MN 7890',
      'location': 'Outer Ring Rd, Blr (12.97, 77.59)',
      'fuelLevelPercent': 20,
      'fastagBalance': 300.25,
      'status': 'Available'
    },
  ];


  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Owner Dashboard', style: TextStyle(color: theme.colorScheme.onPrimary)),
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
      drawer: CustomDrawer(userProfile: userProfile),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildWelcomeCard(context, userProfile),
          const SizedBox(height: 20),
          Text(
            'My Vehicle Fleet',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          ..._mockVehicles.map((vehicle) => _buildVehicleCard(context, vehicle)).toList(),
          const SizedBox(height: 20),
           _buildMapPlaceholder(context),
        ],
      ),
       floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Navigate to add new vehicle screen
        },
        label: const Text('Add Vehicle'),
        icon: const Icon(Icons.add_circle_outline_rounded),
        backgroundColor: theme.colorScheme.secondary,
        foregroundColor: theme.colorScheme.onSecondary,
      ),
    );
  }

   Widget _buildWelcomeCard(BuildContext context, UserProfile userProfile) {
    final theme = Theme.of(context);
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: theme.colorScheme.surfaceVariant.withOpacity(0.7),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${userProfile.displayName ?? userProfile.email?.split('@')[0] ?? 'Owner'}!',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Here\'s an overview of your transport fleet.',
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.8)),
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildVehicleCard(BuildContext context, Map<String, dynamic> vehicle) {
    final theme = Theme.of(context);
    final fuelPercent = vehicle['fuelLevelPercent'] as int;
    Color fuelColor;
    if (fuelPercent > 60) {
      fuelColor = Colors.green.shade600;
    } else if (fuelPercent > 30) {
      fuelColor = Colors.orange.shade600;
    } else {
      fuelColor = Colors.red.shade600;
    }

    return Card(
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  vehicle['name'],
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                 Chip(
                  label: Text(vehicle['status'], style: TextStyle(color: theme.colorScheme.onSecondaryContainer, fontSize: 12)),
                  backgroundColor: vehicle['status'] == 'Available' ? Colors.green.shade100 : (vehicle['status'] == 'On Trip' ? Colors.blue.shade100 : Colors.orange.shade100),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _buildInfoRow(theme, Icons.location_on_outlined, 'Location:', vehicle['location']),
            const SizedBox(height: 8),
            _buildInfoRow(theme, Icons.local_gas_station_outlined, 'Fuel Level:', '$fuelPercent%'),
            Padding(
              padding: const EdgeInsets.only(left: 28.0, top: 4, right: 8), // Align with text
              child: LinearProgressIndicator(
                value: fuelPercent / 100,
                backgroundColor: fuelColor.withOpacity(0.2),
                valueColor: AlwaysStoppedAnimation<Color>(fuelColor),
                minHeight: 6,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(height: 8),
             _buildInfoRow(theme, Icons.credit_card_outlined, 'FASTag Balance:', '₹${(vehicle['fastagBalance'] as double).toStringAsFixed(2)}'),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  icon: const Icon(Icons.map_outlined, size: 18),
                  label: const Text('View on Map'),
                  onPressed: () {
                    // TODO: Implement map view for this vehicle
                  },
                ),
                 const SizedBox(width: 8),
                TextButton.icon(
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  label: const Text('Manage'),
                  onPressed: () {
                    // TODO: Implement manage vehicle details
                  },
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(ThemeData theme, IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: theme.colorScheme.secondary),
        const SizedBox(width: 8),
        Text(label, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            value,
            style: theme.textTheme.bodyMedium,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

   Widget _buildMapPlaceholder(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        height: 200,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.map_outlined, size: 60, color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5)),
              const SizedBox(height: 12),
              Text(
                'Live Fleet Map (Coming Soon)',
                style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant.withOpacity(0.7)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
