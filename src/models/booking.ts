
import type { Timestamp } from 'firebase/firestore';

export enum BookingStatus {
  PENDING = 'pending', // Initial state, awaiting admin confirmation or driver assignment
  CONFIRMED = 'confirmed', // Admin has confirmed, awaiting driver assignment or pickup
  ASSIGNED = 'assigned', // Driver assigned
  IN_TRANSIT = 'in_transit', // Goods are currently being transported
  COMPLETED = 'completed', // Transport finished, awaiting payment or finalization
  DELIVERED = 'delivered', // Goods delivered to destination
  CANCELLED = 'cancelled', // Booking cancelled by client or admin
  ON_HOLD = 'on_hold', // Booking temporarily paused
  PAYMENT_DUE = 'payment_due', // Transport completed, payment pending
}

export enum RepaymentStatus {
  PENDING = 'pending', // Repayment for fuel credit is pending
  PAID = 'paid', // Repayment made
  OVERDUE = 'overdue', // Repayment is past its due date
  NOT_APPLICABLE = 'not_applicable', // No fuel credit involved or not yet applicable
  PARTIALLY_PAID = 'partially_paid',
}

export interface ActionLogEntry {
  timestamp: Timestamp | Date; // Firestore Timestamp or Date object
  actorId: string; // User ID of the person who performed the action (e.g., admin, client, system)
  actionDescription: string; // Description of the action (e.g., "Booking created", "Status changed to in_transit")
  details?: Record<string, any>; // Optional additional details about the action
}

export interface Booking {
  bookingId: string; // Firestore document ID
  userId: string; // ID of the user (client) who created the booking
  clientId: string; // ID of the client who made the booking (can be same as userId or represent a company)
  clientName?: string; // Optional: denormalized client name for easier display
  
  from: {
    address: string;
    latitude: number;
    longitude: number;
  };
  to: {
    address: string;
    latitude: number;
    longitude: number;
  };
  
  goodsType: string; // Description of the goods (e.g., "Electronics", "Furniture")
  weightKg: number; // Weight of the goods in kilograms
  vehicleType: VehicleType; // Type of vehicle required (e.g., "Small Truck", "Van", "10-wheeler")
  preferredDate: Timestamp | Date | null; // Optional preferred pickup date/time
  
  status: BookingStatus; // Current status of the booking
  
  driverId?: string | null; // ID of the assigned driver
  driverName?: string; // Optional: denormalized driver name

  estimatedCost?: number; // Estimated cost of transport from AI/manual quote, influenced by vehicle type, weight, distance
  finalCost?: number; // Actual final cost after transport completion

  // Fuel Credit related fields
  fuelCreditRequested?: boolean;
  fuelCost?: number | null; // Cost of fuel if applicable (especially for credit)
  repayAmount?: number | null; // Amount to be repaid (fuelCost + interest, if any)
  repayDueDate?: Timestamp | Date | null;
  repayStatus: RepaymentStatus;

  // Timestamps
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  
  actionLogs: ActionLogEntry[]; // History of changes and actions on the booking

  // Additional optional fields
  specialInstructions?: string;
  estimatedDistanceKm?: number;
  estimatedDurationHours?: number;
  paymentDetails?: { // Placeholder for payment info
    transactionId?: string;
    method?: string;
    status?: string; // e.g., 'paid', 'pending_confirmation'
  };
  invoiceId?: string; // Reference to a generated invoice document/ID
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
  "Other",
] as const;

export type VehicleType = typeof VEHICLE_TYPES[number];

// Example of how a booking object might look:
/*
const exampleBooking: Booking = {
  bookingId: 'firestoreDocId123',
  userId: 'userFirebaseUid456',
  clientId: 'clientCompanyId789', // Could be same as userId for individual clients
  clientName: 'Rohan Industries',
  from: { address: '123 MG Road, Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946 },
  to: { address: '456 Marine Drive, Mumbai, Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  goodsType: 'Electronics - LED TVs',
  weightKg: 1200,
  vehicleType: 'Light Commercial Vehicle (LCV) (Tata 407, Eicher Pro 2000, etc.)',
  preferredDate: new Date('2024-09-15T10:00:00Z'),
  status: BookingStatus.PENDING,
  estimatedCost: 15500,
  repayStatus: RepaymentStatus.NOT_APPLICABLE,
  createdAt: new Date(),
  updatedAt: new Date(),
  actionLogs: [
    { timestamp: new Date(), actorId: 'userFirebaseUid456', actionDescription: 'Booking created by client.' }
  ],
};
*/

