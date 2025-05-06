
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart'; // For date formatting
import '../../models/booking_model.dart'; // Ensure this model exists

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Stream<List<Booking>> _getMyBookingsStream() {
    final User? currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]); // Return empty stream if user not logged in
    }
    return _firestore
        .collection('bookings')
        .where('buyerId', isEqualTo: currentUser.uid)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Booking.fromJson(doc.data(), doc.id))
            .toList());
  }

  Color _getStatusColor(BookingStatus status, ThemeData theme) {
    switch (status) {
      case BookingStatus.pending:
        return Colors.orange.shade300;
      case BookingStatus.confirmed:
      case BookingStatus.awaitingPickup:
        return Colors.blue.shade300;
      case BookingStatus.inTransit:
        return Colors.lightBlue.shade400;
      case BookingStatus.delivered:
      case BookingStatus.completed:
        return Colors.green.shade400;
      case BookingStatus.cancelledByAdmin:
      case BookingStatus.cancelledByBuyer:
      case BookingStatus.cancelledBySeller:
      case BookingStatus.failed:
        return Colors.red.shade300;
      case BookingStatus.onHold:
        return Colors.grey.shade400;
      case BookingStatus.paymentDue:
        return Colors.amber.shade400;
      default:
        return theme.colorScheme.surfaceVariant;
    }
  }

  String _formatStatus(BookingStatus status) {
    // Convert enum like BookingStatus.inTransit to "In Transit"
    return status.toString().split('.').last.replaceAllMapped(
      RegExp(r'(?<=[a-z])([A-Z])'), (Match m) => ' ${m.group(1)}'
    ).capitalize();
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      // AppBar is usually part of the parent dashboard screen,
      // but if this screen can be accessed directly, add an AppBar here.
      // appBar: AppBar(title: Text('My Transport Bookings')),
      body: StreamBuilder<List<Booking>>(
        stream: _getMyBookingsStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inbox_outlined, size: 80, color: theme.hintColor.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  Text('You have no transport bookings yet.', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                   Text('Book transport for your goods to see them here.', style: theme.textTheme.bodySmall, textAlign: TextAlign.center,),
                ],
              ),
            );
          }

          final bookings = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(8.0),
            itemCount: bookings.length,
            itemBuilder: (context, index) {
              final booking = bookings[index];
              return Card(
                elevation: 2,
                margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(12),
                  leading: CircleAvatar(
                    backgroundColor: _getStatusColor(booking.status, theme).withOpacity(0.2),
                    child: Icon(
                      _getIconForStatus(booking.status),
                      color: _getStatusColor(booking.status, theme),
                    ),
                  ),
                  title: Text(
                    'To: ${booking.dropoffLocation.address.split(',').first}', // Show city
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Booking ID: ${booking.bookingId.substring(0, 8)}...'), // Show partial ID
                      if (booking.preferredPickupDate != null)
                        Text('Date: ${DateFormat('EEE, MMM d, yyyy').format(booking.preferredPickupDate!.toDate())}'),
                      Text('Status: ${_formatStatus(booking.status)}', style: TextStyle(color: _getStatusColor(booking.status, theme), fontWeight: FontWeight.bold)),
                    ],
                  ),
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 16, color: theme.hintColor),
                  onTap: () {
                    // TODO: Navigate to Booking Detail Screen
                    // Navigator.push(context, MaterialPageRoute(builder: (context) => BookingDetailScreen(booking: booking)));
                     ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Tapped on booking: ${booking.bookingId}')),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }

   IconData _getIconForStatus(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending: return Icons.hourglass_empty_rounded;
      case BookingStatus.confirmed: return Icons.check_circle_outline_rounded;
      case BookingStatus.awaitingPickup: return Icons.inventory_2_outlined;
      case BookingStatus.inTransit: return Icons.local_shipping_outlined;
      case BookingStatus.delivered: return Icons.done_all_rounded;
      case BookingStatus.completed: return Icons.verified_outlined;
      case BookingStatus.cancelledByAdmin:
      case BookingStatus.cancelledByBuyer:
      case BookingStatus.cancelledBySeller:
      case BookingStatus.failed:
        return Icons.cancel_outlined;
      case BookingStatus.onHold: return Icons.pause_circle_outline_rounded;
      case BookingStatus.paymentDue: return Icons.payment_outlined;
      default: return Icons.help_outline_rounded;
    }
  }
}

// Helper extension for capitalizing strings
extension StringExtension on String {
    String capitalize() {
      return "${this[0].toUpperCase()}${substring(1).toLowerCase()}";
    }
}

