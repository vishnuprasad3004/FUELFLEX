
import type { Timestamp } from 'firebase/firestore';

export const GOODS_CATEGORIES = [
  "Electronics",
  "Groceries & Agri-Produce",
  "Furniture & Home Goods",
  "Fashion & Apparel",
  "Books & Stationery",
  "Automotive Parts",
  "Industrial Supplies",
  "Building Materials",
  "Pharmaceuticals",
  "Fruits & Vegetables",
  "Other",
] as const;

export type GoodsCategory = typeof GOODS_CATEGORIES[number];

export interface Good {
  productId: string; // Firestore document ID (auto-generated)
  sellerId: string; // Firebase Auth ID of the seller
  productName: string;
  category: GoodsCategory;
  price: number; // Price of the good itself, transport cost is separate
  quantity: number; // Available quantity
  description: string;
  
  // Pickup location for the goods
  location: { 
    address: string;
    latitude: number;
    longitude: number;
  };
  
  contact: string; // Seller's contact information (e.g., phone number or masked email)
  images?: string[]; // Array of URLs for product images (optional)
  
  weightKg?: number; // Optional: Approximate weight per unit or total if quantity is 1
  dimensions?: { // Optional: Approximate dimensions
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  };

  postedAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isActive: boolean; // To allow sellers to temporarily delist items
}

// Example of how a Good object might look:
/*
const exampleGood: Good = {
  productId: 'firestoreDocIdGood123',
  sellerId: 'sellerFirebaseUid789',
  productName: 'Fresh Mangoes (Box of 12)',
  category: 'Fruits & Vegetables',
  price: 500, // Price for the box of mangoes
  quantity: 50, // 50 boxes available
  description: 'Export quality Alphonso mangoes, directly from the farm.',
  location: {
    address: 'Ratnagiri Farm, Maharashtra',
    latitude: 16.9944,
    longitude: 73.3000
  },
  contact: '+91-98XXXXXX00',
  images: ['https://picsum.photos/seed/mangoes/400/300'],
  weightKg: 5, // Approx weight of one box
  postedAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};
*/
