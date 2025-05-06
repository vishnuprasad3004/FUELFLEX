
import type { Timestamp } from 'firebase/firestore';
import type { VehicleType } from './goods'; // Assuming VehicleType might be shared or defined elsewhere if not specific to goods

export enum BookingStatus {
  PENDING = 'pending', // Buyer has requested booking, awaiting seller/admin confirmation
  CONFIRMED = 'confirmed', // Seller/Admin confirmed, awaiting transport assignment
  AWAITING_PICKUP = 'awaiting_pickup', // Transport assigned, ready for pickup
  IN_TRANSIT = 'in_transit', // Goods are currently being transported
  DELIVERED = 'delivered', // Goods delivered to destination
  COMPLETED = 'completed', // Transport finished, payment (if any post-delivery) finalized
  CANCELLED_BY_BUYER = 'cancelled_by_buyer',
  CANCELLED_BY_SELLER = 'cancelled_by_seller',
  CANCELLED_BY_ADMIN = 'cancelled_by_admin',
  ON_HOLD = 'on_hold', // Booking temporarily paused
  PAYMENT_DUE = 'payment_due', // Transport completed, payment for transport pending
  FAILED = 'failed', // Booking could not be processed or transport failed
}

export enum RepaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  NOT_APPLICABLE = 'not_applicable',
  PARTIALLY_PAID = 'partially_paid',
}

export interface ActionLogEntry {
  timestamp: Timestamp | Date;
  actorId: string; // User ID (buyer, seller, admin, system)
  actionDescription: string;
  details?: Record<string, any>;
}

export const VEHICLE_TYPES = [
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
] as const;

export type BookingVehicleType = typeof VEHICLE_TYPES[number];


export interface Booking {
  bookingId: string; // Firestore document ID
  buyerId: string; // Firebase Auth ID of the buyer
  goodsId: string; // Reference to the 'goods' document being transported
  sellerId: string; // Firebase Auth ID of the seller (denormalized from goods for easier querying)

  // Pickup location is sourced from the 'goods' document
  // from: { 
  //   address: string;
  //   latitude: number;
  //   longitude: number;
  // };
  
  // Drop-off location specified by the buyer
  dropoffLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  
  // Goods details are primarily in the 'goods' document, but some might be snapshot here
  // goodsType: string; // Likely sourced from goods.category or goods.productName
  // weightKg: number; // Likely sourced from goods.weightKg * quantity_booked

  vehicleType?: BookingVehicleType; // Buyer might select or it might be suggested
  preferredPickupDate?: Timestamp | Date | null; // Buyer's preferred pickup date/time

  status: BookingStatus;
  
  driverId?: string | null;
  driverName?: string;

  estimatedTransportCost?: number; // AI-calculated cost for the transport service
  finalTransportCost?: number;

  // Fuel Credit related fields (if applicable to the transport provider/driver)
  fuelCreditRequested?: boolean;
  fuelCost?: number | null;
  repayAmount?: number | null;
  repayDueDate?: Timestamp | Date | null;
  repayStatus: RepaymentStatus;

  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  
  actionLogs: ActionLogEntry[];

  specialInstructions?: string; // From buyer for the transport
  paymentDetails?: {
    transportFeeTransactionId?: string;
    goodsPriceTransactionId?: string; // If platform handles goods payment
    method?: string;
    status?: string;
  };
  invoiceId?: string;
}

// Example of how a booking object might look in the new marketplace model:
/*
const exampleMarketplaceBooking: Booking = {
  bookingId: 'firestoreBookingId456',
  buyerId: 'buyerFirebaseUid123',
  goodsId: 'firestoreDocIdGood123', // Links to the Good document
  sellerId: 'sellerFirebaseUid789', // Denormalized from Good
  dropoffLocation: {
    address: '789 Buyer Street, Pune, Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
  },
  vehicleType: 'Mini Truck (Tata Ace, Mahindra Jeeto, etc.)',
  preferredPickupDate: new Date('2024-09-20T14:00:00Z'),
  status: BookingStatus.PENDING,
  estimatedTransportCost: 850,
  repayStatus: RepaymentStatus.NOT_APPLICABLE,
  createdAt: new Date(),
  updatedAt: new Date(),
  actionLogs: [
    { timestamp: new Date(), actorId: 'buyerFirebaseUid123', actionDescription: 'Transport booking created for goodsId: firestoreDocIdGood123.' }
  ],
};
*/
