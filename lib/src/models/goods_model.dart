
import 'package:cloud_firestore/cloud_firestore.dart';

const List<GoodsCategory> GOODS_CATEGORIES = [
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
];

typedef GoodsCategory = String; // Using String for simplicity, could be an enum

class Location {
  final String address;
  final double? latitude;
  final double? longitude;

  Location({
    required this.address,
    this.latitude,
    this.longitude,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      address: json['address'] as String,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
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

class Good {
  final String productId;
  final String sellerId;
  final String productName;
  final GoodsCategory category;
  final double price;
  final int quantity;
  final String? description;
  final Location location;
  final String contact;
  final List<String>? images; // List of image URLs
  final double? weightKg;
  final Timestamp postedAt;
  final Timestamp updatedAt;
  final bool isActive;

  Good({
    required this.productId,
    required this.sellerId,
    required this.productName,
    required this.category,
    required this.price,
    required this.quantity,
    this.description,
    required this.location,
    required this.contact,
    this.images,
    this.weightKg,
    required this.postedAt,
    required this.updatedAt,
    required this.isActive,
  });

  factory Good.fromJson(Map<String, dynamic> json, String id) {
    return Good(
      productId: id, // Use document ID as productId
      sellerId: json['sellerId'] as String,
      productName: json['productName'] as String,
      category: json['category'] as GoodsCategory,
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'] as int,
      description: json['description'] as String?,
      location: Location.fromJson(json['location'] as Map<String, dynamic>),
      contact: json['contact'] as String,
      images: (json['images'] as List<dynamic>?)?.map((e) => e as String).toList(),
      weightKg: (json['weightKg'] as num?)?.toDouble(),
      postedAt: json['postedAt'] as Timestamp,
      updatedAt: json['updatedAt'] as Timestamp,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId, // Store it also in the document for consistency
      'sellerId': sellerId,
      'productName': productName,
      'category': category,
      'price': price,
      'quantity': quantity,
      'description': description,
      'location': location.toJson(),
      'contact': contact,
      'images': images,
      'weightKg': weightKg,
      'postedAt': postedAt,
      'updatedAt': updatedAt,
      'isActive': isActive,
    };
  }
}
