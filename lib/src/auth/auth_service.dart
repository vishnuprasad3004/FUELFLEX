
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_profile_model.dart'; // Ensure this model exists

class AuthService extends ChangeNotifier {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  User? get currentUser => _firebaseAuth.currentUser;

  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  // Sign in with email and password
  Future<UserCredential?> signInWithEmailAndPassword(
      String email, String password) async {
    try {
      UserCredential userCredential = await _firebaseAuth
          .signInWithEmailAndPassword(email: email, password: password);
      return userCredential;
    } on FirebaseAuthException catch (e) {
      debugPrint("AuthService SignIn Error: ${e.code} - ${e.message}");
      throw e; // Rethrow to be caught by UI
    }
  }

  // Sign up with email and password
  Future<UserCredential?> signUpWithEmailAndPassword(
      String email, String password, UserRole role, String? displayName) async {
    try {
      UserCredential userCredential = await _firebaseAuth
          .createUserWithEmailAndPassword(email: email, password: password);

      // Create user profile in Firestore
      if (userCredential.user != null) {
        UserProfile newUserProfile = UserProfile(
          uid: userCredential.user!.uid,
          email: userCredential.user!.email,
          role: role,
          displayName: displayName ?? email.split('@')[0], // Default display name
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        );
        await _firestore
            .collection('users')
            .doc(userCredential.user!.uid)
            .set(newUserProfile.toJson());
      }
      return userCredential;
    } on FirebaseAuthException catch (e) {
      debugPrint("AuthService SignUp Error: ${e.code} - ${e.message}");
      throw e; // Rethrow to be caught by UI
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await _firebaseAuth.signOut();
    } catch (e) {
      debugPrint("AuthService SignOut Error: $e");
      // Handle error, maybe show a toast
    }
  }

  // Get user profile from Firestore
  Future<UserProfile?> getUserProfile(String uid) async {
    try {
      DocumentSnapshot doc =
          await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return UserProfile.fromJson(doc.data() as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      debugPrint("AuthService GetUserProfile Error: $e");
      return null;
    }
  }
}
