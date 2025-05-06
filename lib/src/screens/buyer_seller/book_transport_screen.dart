
import 'dart:convert'; // For jsonEncode
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart'; // For date formatting
import 'package:http/http.dart' as http; // For API calls
import 'package:geocoding/geocoding.dart' as geo; // For geocoding

import '../../models/goods_model.dart'; // If booking for specific goods
import '../../models/booking_model.dart'; // For Booking and VehicleType
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../config/api_config.dart'; // For API base URL

class BookTransportScreen extends StatefulWidget {
  final Good? goodToTransport; // Optional: if booking from a goods detail page

  const BookTransportScreen({super.key, this.goodToTransport});

  @override
  State<BookTransportScreen> createState() => _BookTransportScreenState();
}

class _BookTransportScreenState extends State<BookTransportScreen> {
  final _formKey = GlobalKey<FormState>();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Form controllers
  final TextEditingController _pickupAddressController = TextEditingController();
  final TextEditingController _destinationAddressController = TextEditingController();
  final TextEditingController _goodsTypeController = TextEditingController();
  final TextEditingController _loadWeightController = TextEditingController();
  BookingVehicleType _selectedVehicleType = VEHICLE_TYPES.first;
  DateTime? _preferredDate;
  TimeOfDay? _preferredTime;

  // For API price estimation
  bool _isEstimatingPrice = false;
  bool _isSubmittingBooking = false;
  Map<String, dynamic>? _priceEstimateResult;
  String? _apiError;

  geo.Location? _pickupCoordinates;
  geo.Location? _destinationCoordinates;


  @override
  void initState() {
    super.initState();
    if (widget.goodToTransport != null) {
      _pickupAddressController.text = widget.goodToTransport!.location.address;
      _goodsTypeController.text = widget.goodToTransport!.productName; // or category
      if (widget.goodToTransport!.weightKg != null) {
        _loadWeightController.text = widget.goodToTransport!.weightKg.toString();
      }
      // Pre-fill coordinates if available from good
       if (widget.goodToTransport!.location.latitude != null && widget.goodToTransport!.location.longitude != null) {
         _pickupCoordinates = geo.Location(
            latitude: widget.goodToTransport!.location.latitude!,
            longitude: widget.goodToTransport!.location.longitude!,
            timestamp: DateTime.now() // dummy timestamp
        );
      }
    }
  }

  Future<void> _geocodeAddress(String address, bool isPickup) async {
    try {
      List<geo.Location> locations = await geo.locationFromAddress(address);
      if (locations.isNotEmpty) {
        setState(() {
          if (isPickup) {
            _pickupCoordinates = locations.first;
          } else {
            _destinationCoordinates = locations.first;
          }
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Could not find coordinates for ${isPickup ? "pickup" : "destination"} address.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error geocoding ${isPickup ? "pickup" : "destination"} address: $e')),
      );
    }
  }

  Future<void> _getAIPriceEstimate() async {
    if (!_formKey.currentState!.validate()) return;

    if (_pickupAddressController.text.isNotEmpty && _pickupCoordinates == null) {
       await _geocodeAddress(_pickupAddressController.text, true);
    }
    if (_destinationAddressController.text.isNotEmpty && _destinationCoordinates == null) {
       await _geocodeAddress(_destinationAddressController.text, false);
    }
    
    if (_pickupCoordinates == null || _destinationCoordinates == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please ensure both pickup and destination addresses are geocoded (coordinates found). Try entering them again or tap the map icon if available.')),
      );
      return;
    }

    setState(() {
      _isEstimatingPrice = true;
      _apiError = null;
      _priceEstimateResult = null;
    });

    final apiUrl = '${ApiConfig.baseUrl}/calculate-price';
    final payload = {
      'pickupLatitude': _pickupCoordinates!.latitude,
      'pickupLongitude': _pickupCoordinates!.longitude,
      'destinationLatitude': _destinationCoordinates!.latitude,
      'destinationLongitude': _destinationCoordinates!.longitude,
      'loadWeightKg': double.tryParse(_loadWeightController.text) ?? 0.0,
      'vehicleType': _selectedVehicleType,
    };

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        setState(() {
          _priceEstimateResult = jsonDecode(response.body);
        });
      } else {
        final errorBody = jsonDecode(response.body);
        setState(() {
          _apiError = errorBody['details'] ?? errorBody['error'] ?? 'Failed to get price estimate.';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_apiError!), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      setState(() {
        _apiError = 'Network error or API unavailable: $e';
      });
       ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_apiError!), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isEstimatingPrice = false);
    }
  }


  Future<void> _submitBooking() async {
     if (!_formKey.currentState!.validate()) return;
     if (_priceEstimateResult == null || _priceEstimateResult!['estimatedPrice'] == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please get a price estimate before booking.')),
        );
        return;
     }

    final User? currentUser = _auth.currentUser;
    if (currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You must be logged in to book transport.')),
      );
      return;
    }

    if (_pickupCoordinates == null || _destinationCoordinates == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pickup or destination coordinates are missing. Please re-enter addresses.')),
      );
      return;
    }

    setState(() => _isSubmittingBooking = true);

    DateTime? fullPreferredDateTime;
    if (_preferredDate != null && _preferredTime != null) {
      fullPreferredDateTime = DateTime(
        _preferredDate!.year,
        _preferredDate!.month,
        _preferredDate!.day,
        _preferredTime!.hour,
        _preferredTime!.minute,
      );
    }


    final bookingData = Booking(
      bookingId: '', // Firestore will generate
      buyerId: currentUser.uid,
      goodsId: widget.goodToTransport?.productId, // Optional
      sellerId: widget.goodToTransport?.sellerId, // Optional, from good
      dropoffLocation: LocationDetail(
        address: _destinationAddressController.text.trim(),
        latitude: _destinationCoordinates!.latitude,
        longitude: _destinationCoordinates!.longitude,
      ),
      // For 'from' location, if goodToTransport is null, user needs to input it.
      // Otherwise, it's from goodToTransport.location.
      // This example assumes if goodToTransport is null, pickupAddressController is used.
      // For simplicity, we'll use the controller if good is null, otherwise good's location.
      // A more robust form would explicitly handle pickup for non-good bookings.
      pickupLocation: widget.goodToTransport != null
        ? LocationDetail(
            address: widget.goodToTransport!.location.address,
            latitude: widget.goodToTransport!.location.latitude!,
            longitude: widget.goodToTransport!.location.longitude!
          )
        : LocationDetail(
            address: _pickupAddressController.text.trim(),
            latitude: _pickupCoordinates!.latitude,
            longitude: _pickupCoordinates!.longitude,
          ),
      vehicleType: _selectedVehicleType,
      preferredPickupDate: fullPreferredDateTime != null ? Timestamp.fromDate(fullPreferredDateTime) : null,
      status: BookingStatus.pending,
      estimatedTransportCost: _priceEstimateResult!['estimatedPrice']?.toDouble(),
      repayStatus: RepaymentStatus.notApplicable, // Default
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      actionLogs: [
        ActionLogEntry(
          timestamp: Timestamp.now(),
          actorId: currentUser.uid,
          actionDescription: 'Booking created by buyer.',
        )
      ],
      // Add goodsType and weightKg if not tied to a specific `goodToTransport`
      // For now, these would be part of `specialInstructions` or separate fields in Booking model
      // goodsDetails: GoodsDetails(
      //   goodsType: _goodsTypeController.text.trim(),
      //   weightKg: double.tryParse(_loadWeightController.text.trim()) ?? 0,
      // )
    );

    try {
      DocumentReference docRef = await _firestore.collection('bookings').add(bookingData.toJson());
      await docRef.update({'bookingId': docRef.id});

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking request submitted successfully!')),
      );
      Navigator.of(context).pop(); // Go back or to a confirmation screen
    } catch (e) {
       ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit booking: $e')),
      );
    } finally {
      setState(() => _isSubmittingBooking = false);
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _preferredDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(DateTime.now().year + 1),
    );
    if (picked != null && picked != _preferredDate) {
      setState(() {
        _preferredDate = picked;
      });
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _preferredTime ?? TimeOfDay.now(),
    );
    if (picked != null && picked != _preferredTime) {
      setState(() {
        _preferredTime = picked;
      });
    }
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Transport'),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text('Shipment Details', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _pickupAddressController,
                hintText: 'Pickup Address / City',
                prefixIcon: Icons.my_location_outlined,
                validator: (value) => value == null || value.isEmpty ? 'Enter pickup address' : null,
                onFieldSubmitted: (value) => _geocodeAddress(value, true),
                suffixIcon: IconButton(
                  icon: Icon(Icons.map_outlined, color: _pickupCoordinates != null ? Colors.green : theme.hintColor),
                  onPressed: () => _geocodeAddress(_pickupAddressController.text, true),
                ),
              ),
              if (_pickupCoordinates != null) Text('Lat: ${_pickupCoordinates!.latitude.toStringAsFixed(4)}, Lng: ${_pickupCoordinates!.longitude.toStringAsFixed(4)}', style: theme.textTheme.bodySmall),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _destinationAddressController,
                hintText: 'Destination Address / City',
                prefixIcon: Icons.location_on_outlined,
                validator: (value) => value == null || value.isEmpty ? 'Enter destination address' : null,
                 onFieldSubmitted: (value) => _geocodeAddress(value, false),
                suffixIcon: IconButton(
                  icon: Icon(Icons.map_outlined, color: _destinationCoordinates != null ? Colors.green : theme.hintColor),
                  onPressed: () => _geocodeAddress(_destinationAddressController.text, false),
                ),
              ),
              if (_destinationCoordinates != null) Text('Lat: ${_destinationCoordinates!.latitude.toStringAsFixed(4)}, Lng: ${_destinationCoordinates!.longitude.toStringAsFixed(4)}', style: theme.textTheme.bodySmall),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _goodsTypeController,
                hintText: 'Type of Goods',
                prefixIcon: Icons.inventory_2_outlined,
                validator: (value) => value == null || value.isEmpty ? 'Describe your goods' : null,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _loadWeightController,
                hintText: 'Load Weight (kg)',
                prefixIcon: Icons.scale_outlined,
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Enter load weight';
                  if (double.tryParse(value) == null || double.parse(value) <= 0) return 'Enter a valid weight';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<BookingVehicleType>(
                value: _selectedVehicleType,
                decoration: InputDecoration(
                  labelText: 'Vehicle Type',
                  prefixIcon: Icon(Icons.local_shipping_outlined, color: theme.primaryColor),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                ),
                items: VEHICLE_TYPES.map((BookingVehicleType type) {
                  return DropdownMenuItem<BookingVehicleType>(
                    value: type,
                    child: Text(type, style: const TextStyle(fontSize: 14), overflow: TextOverflow.ellipsis, maxLines: 2,),
                  );
                }).toList(),
                onChanged: (BookingVehicleType? newValue) {
                  setState(() {
                    _selectedVehicleType = newValue!;
                  });
                },
                validator: (value) => value == null ? 'Select a vehicle type' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => _selectDate(context),
                      child: InputDecorator(
                        decoration: InputDecoration(
                          labelText: 'Preferred Pickup Date',
                           prefixIcon: Icon(Icons.calendar_today_outlined, color: theme.primaryColor),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          filled: true,
                        ),
                        child: Text(
                          _preferredDate == null ? 'Select Date' : DateFormat('EEE, MMM d, yyyy').format(_preferredDate!),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: InkWell(
                      onTap: () => _selectTime(context),
                      child: InputDecorator(
                        decoration: InputDecoration(
                          labelText: 'Preferred Pickup Time',
                           prefixIcon: Icon(Icons.access_time_outlined, color: theme.primaryColor),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          filled: true,
                        ),
                        child: Text(
                          _preferredTime == null ? 'Select Time' : _preferredTime!.format(context),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _isEstimatingPrice
                  ? const Center(child: CircularProgressIndicator())
                  : CustomButton(
                      text: 'Get AI Price Estimate',
                      onPressed: _getAIPriceEstimate,
                      icon: Icons.calculate_outlined,
                    ),
              if (_apiError != null && !_isEstimatingPrice)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(_apiError!, style: TextStyle(color: theme.colorScheme.error)),
                ),
              if (_priceEstimateResult != null && !_isEstimatingPrice)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16.0),
                  child: Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('AI Price Estimate:', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Text(
                            '₹${_priceEstimateResult!['estimatedPrice']?.toStringAsFixed(2) ?? 'N/A'} ${_priceEstimateResult!['currency'] ?? ''}',
                            style: theme.textTheme.headlineSmall?.copyWith(color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
                          ),
                          if (_priceEstimateResult!['distanceKm'] != null)
                             Text('Distance: ${_priceEstimateResult!['distanceKm']} km (${_priceEstimateResult!['distanceText'] ?? ''})'),
                          if (_priceEstimateResult!['travelTimeHours'] != null)
                            Text('Est. Time: ${_priceEstimateResult!['travelTimeHours']} hours (${_priceEstimateResult!['durationText'] ?? ''})'),
                          const SizedBox(height: 8),
                          Text('Breakdown: ${_priceEstimateResult!['breakdown'] ?? 'Not available.'}', style: theme.textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              _isSubmittingBooking
                  ? const Center(child: CircularProgressIndicator())
                  : CustomButton(
                      text: 'Submit Booking Request',
                      onPressed: (_priceEstimateResult != null && _priceEstimateResult!['estimatedPrice'] != null) ? _submitBooking : null, // Enable only if estimate is available
                      icon: Icons.send_outlined,
                      backgroundColor: theme.colorScheme.secondary,
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
