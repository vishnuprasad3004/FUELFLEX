
import 'package:cloud_firestore/cloud_firestore.dart';

enum UserRole {
  buyerSeller,
  transportOwner,
  admin,
}

extension UserRoleExtension on UserRole {
  String get toJson => toString().split('.').last; // "buyerSeller", "transportOwner", "admin"

  static UserRole fromJson(String json) {
    switch (json) {
      case 'buyerSeller':
        return UserRole.buyerSeller;
      case 'transportOwner':
        return UserRole.transportOwner;
      case 'admin':
        return UserRole.admin;
      default:
        throw ArgumentError('Invalid UserRole string: $json');
    }
  }
  String get displayName {
    switch (this) {
      case UserRole.buyerSeller:
        return 'Buyer / Seller';
      case UserRole.transportOwner:
        return 'Transport Owner';
      case UserRole.admin:
        return 'Admin';
    }
  }
}


class UserProfile {
  final String uid;
  final String? email;
  final UserRole role;
  final String? displayName;
  final String? photoURL;
  final Timestamp createdAt;
  final Timestamp updatedAt;
  final String? phone; // Optional phone number

  UserProfile({
    required this.uid,
    this.email,
    required this.role,
    this.displayName,
    this.photoURL,
    required this.createdAt,
    required this.updatedAt,
    this.phone,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      uid: json['uid'] as String,
      email: json['email'] as String?,
      role: UserRoleExtension.fromJson(json['role'] as String),
      displayName: json['displayName'] as String?,
      photoURL: json['photoURL'] as String?,
      createdAt: json['createdAt'] as Timestamp,
      updatedAt: json['updatedAt'] as Timestamp,
      phone: json['phone'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'role': role.toJson,
      'displayName': displayName,
      'photoURL': photoURL,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'phone': phone,
    };
  }
}
