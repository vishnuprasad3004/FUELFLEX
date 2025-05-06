
import 'package:cloud_firestore/cloud_firestore.dart';

// Mirrored from Next.js: src/models/booking.ts
enum BookingStatus {
  pending,
  confirmed,
  awaitingPickup,
  inTransit,
  delivered,
  completed,
  cancelledByBuyer,
  cancelledBySeller,
  cancelledByAdmin,
  onHold,
  paymentDue,
  failed,
}

enum RepaymentStatus {
  pending,
  paid,
  overdue,
  notApplicable,
  partiallyPaid,
}

const List<BookingVehicleType> VEHICLE_TYPES = [
  "Mini Truck (Tata Ace, Mahindra Jeeto, etc.)",
  "Tempo / Pickup Truck (Tata Yodha, Bolero Pickup, etc.)",
  "Light Commercial Vehicle (LCV) (Tata 407, Eicher Pro 2000, etc.)",
  "Medium Duty Truck (10-16 Ton)",
  "Heavy Duty Truck (18-28 Ton, Multi-Axle)",
  "Container Truck (20ft, 40ft)",
  "Tanker",
  "Van / Tempo Traveller",
  "2-Wheeler (for small parcels)",
  "Other",
];

typedef BookingVehicleType = String;

class LocationDetail {
  final String address;
  final double latitude;
  final double longitude;

  LocationDetail({
    required this.address,
    required this.latitude,
    required this.longitude,
  });

  factory LocationDetail.fromJson(Map<String, dynamic> json) {
    return LocationDetail(
      address: json['address'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

class ActionLogEntry {
  final Timestamp timestamp;
  final String actorId;
  final String actionDescription;
  final Map<String, dynamic>? details;

  ActionLogEntry({
    required this.timestamp,
    required this.actorId,
    required this.actionDescription,
    this.details,
  });

   factory ActionLogEntry.fromJson(Map<String, dynamic> json) {
    return ActionLogEntry(
      timestamp: json['timestamp'] as Timestamp,
      actorId: json['actorId'] as String,
      actionDescription: json['actionDescription'] as String,
      details: json['details'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'timestamp': timestamp,
      'actorId': actorId,
      'actionDescription': actionDescription,
      'details': details,
    };
  }
}


// Optional: If goods details are denormalized or captured directly in booking
class GoodsDetails {
  final String goodsType;
  final double weightKg;
  // Add other relevant details if not linking to a full Goods object

  GoodsDetails({required this.goodsType, required this.weightKg});

  factory GoodsDetails.fromJson(Map<String, dynamic> json) {
    return GoodsDetails(
      goodsType: json['goodsType'] as String,
      weightKg: (json['weightKg'] as num).toDouble(),
    );
  }
  Map<String, dynamic> toJson() => {
    'goodsType': goodsType,
    'weightKg': weightKg,
  };
}


class Booking {
  final String bookingId;
  final String buyerId;
  final String? goodsId; // Can be null if booking ad-hoc transport
  final String? sellerId; // Can be null

  final LocationDetail pickupLocation; // Explicitly define for booking if ad-hoc
  final LocationDetail dropoffLocation;
  
  final GoodsDetails? goodsDetails; // For ad-hoc bookings if not linking to a Goods item

  final BookingVehicleType? vehicleType;
  final Timestamp? preferredPickupDate;
  final BookingStatus status;
  
  final String? driverId;
  final String? driverName;

  final double? estimatedTransportCost;
  final double? finalTransportCost;

  final bool? fuelCreditRequested;
  final double? fuelCost;
  final double? repayAmount;
  final Timestamp? repayDueDate;
  final RepaymentStatus repayStatus;

  final Timestamp createdAt;
  final Timestamp updatedAt;
  
  final List<ActionLogEntry> actionLogs;
  final String? specialInstructions;
  // paymentDetails and invoiceId can be added as needed

  Booking({
    required this.bookingId,
    required this.buyerId,
    this.goodsId,
    this.sellerId,
    required this.pickupLocation, // Added
    required this.dropoffLocation,
    this.goodsDetails, // Added
    this.vehicleType,
    this.preferredPickupDate,
    required this.status,
    this.driverId,
    this.driverName,
    this.estimatedTransportCost,
    this.finalTransportCost,
    this.fuelCreditRequested,
    this.fuelCost,
    this.repayAmount,
    this.repayDueDate,
    required this.repayStatus,
    required this.createdAt,
    required this.updatedAt,
    required this.actionLogs,
    this.specialInstructions,
  });

  factory Booking.fromJson(Map<String, dynamic> json, String id) {
    return Booking(
      bookingId: id,
      buyerId: json['buyerId'] as String,
      goodsId: json['goodsId'] as String?,
      sellerId: json['sellerId'] as String?,
      pickupLocation: LocationDetail.fromJson(json['pickupLocation'] as Map<String, dynamic>),
      dropoffLocation: LocationDetail.fromJson(json['dropoffLocation'] as Map<String, dynamic>),
      goodsDetails: json['goodsDetails'] != null ? GoodsDetails.fromJson(json['goodsDetails'] as Map<String, dynamic>) : null,
      vehicleType: json['vehicleType'] as BookingVehicleType?,
      preferredPickupDate: json['preferredPickupDate'] as Timestamp?,
      status: BookingStatus.values.firstWhere((e) => e.toString() == 'BookingStatus.${json['status']}', orElse: () => BookingStatus.pending),
      driverId: json['driverId'] as String?,
      driverName: json['driverName'] as String?,
      estimatedTransportCost: (json['estimatedTransportCost'] as num?)?.toDouble(),
      finalTransportCost: (json['finalTransportCost'] as num?)?.toDouble(),
      fuelCreditRequested: json['fuelCreditRequested'] as bool?,
      fuelCost: (json['fuelCost'] as num?)?.toDouble(),
      repayAmount: (json['repayAmount'] as num?)?.toDouble(),
      repayDueDate: json['repayDueDate'] as Timestamp?,
      repayStatus: RepaymentStatus.values.firstWhere((e) => e.toString() == 'RepaymentStatus.${json['repayStatus']}', orElse: () => RepaymentStatus.notApplicable),
      createdAt: json['createdAt'] as Timestamp,
      updatedAt: json['updatedAt'] as Timestamp,
      actionLogs: (json['actionLogs'] as List<dynamic>?)
          ?.map((e) => ActionLogEntry.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      specialInstructions: json['specialInstructions'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bookingId': bookingId, // Also store ID in document
      'buyerId': buyerId,
      'goodsId': goodsId,
      'sellerId': sellerId,
      'pickupLocation': pickupLocation.toJson(),
      'dropoffLocation': dropoffLocation.toJson(),
      'goodsDetails': goodsDetails?.toJson(),
      'vehicleType': vehicleType,
      'preferredPickupDate': preferredPickupDate,
      'status': status.toString().split('.').last,
      'driverId': driverId,
      'driverName': driverName,
      'estimatedTransportCost': estimatedTransportCost,
      'finalTransportCost': finalTransportCost,
      'fuelCreditRequested': fuelCreditRequested,
      'fuelCost': fuelCost,
      'repayAmount': repayAmount,
      'repayDueDate': repayDueDate,
      'repayStatus': repayStatus.toString().split('.').last,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'actionLogs': actionLogs.map((e) => e.toJson()).toList(),
      'specialInstructions': specialInstructions,
    };
  }
}
