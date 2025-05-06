
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart'; // For images
import '../../models/goods_model.dart';
import 'book_transport_screen.dart'; // To navigate to booking
import '../../widgets/custom_button.dart';

class GoodsDetailScreen extends StatelessWidget {
  final Good good;

  const GoodsDetailScreen({super.key, required this.good});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      body: CustomScrollView(
        slivers: <Widget>[
          SliverAppBar(
            expandedHeight: screenHeight * 0.35, // 35% of screen height
            pinned: true,
            floating: false,
            backgroundColor: theme.colorScheme.primary,
            iconTheme: IconThemeData(color: theme.colorScheme.onPrimary),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                good.productName,
                style: TextStyle(color: theme.colorScheme.onPrimary, fontSize: 16),
                overflow: TextOverflow.ellipsis,
              ),
              centerTitle: true, // Or false based on preference
              background: (good.images != null && good.images!.isNotEmpty && good.images!.first.isNotEmpty)
                  ? CachedNetworkImage(
                      imageUrl: good.images!.first,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: theme.colorScheme.surfaceVariant),
                      errorWidget: (context, url, error) => Icon(Icons.broken_image, size: 100, color: theme.hintColor),
                    )
                  : Container(
                      color: theme.colorScheme.surfaceVariant,
                      child: Icon(Icons.inventory_2, size: 100, color: theme.hintColor.withOpacity(0.5)),
                    ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    good.productName,
                    style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₹${good.price.toStringAsFixed(2)}',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Chip(
                        label: Text('${good.quantity} available', style: TextStyle(color: theme.colorScheme.onSecondaryContainer)),
                        backgroundColor: theme.colorScheme.secondaryContainer.withOpacity(0.7),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow(theme, Icons.category_outlined, 'Category:', good.category),
                  _buildDetailRow(theme, Icons.scale_outlined, 'Weight:', good.weightKg != null ? '${good.weightKg} kg' : 'N/A'),
                  _buildDetailRow(theme, Icons.location_on_outlined, 'Pickup Location:', good.location.address),
                  _buildDetailRow(theme, Icons.contact_phone_outlined, 'Seller Contact:', good.contact),
                  const SizedBox(height: 16),
                  Text(
                    'Description',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    good.description ?? 'No description available.',
                    style: theme.textTheme.bodyLarge?.copyWith(height: 1.5),
                  ),
                  const SizedBox(height: 24),
                  // Add more images if available in a carousel or list
                  if (good.images != null && good.images!.length > 1) ...[
                    Text(
                      'More Images',
                       style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 120,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: good.images!.length,
                        itemBuilder: (context, index) {
                          if (index == 0) return const SizedBox.shrink(); // Skip first image already shown
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: CachedNetworkImage(
                                imageUrl: good.images![index],
                                width: 120,
                                height: 120,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(width:120, height: 120, color: theme.colorScheme.surfaceVariant),
                                errorWidget: (context, url, error) => Container(width:120, height: 120, color: theme.colorScheme.surfaceVariant, child: Icon(Icons.broken_image_outlined, color: theme.hintColor)),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                  CustomButton(
                    text: 'Book Transport for this Item',
                    onPressed: good.quantity > 0 ? () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BookTransportScreen(goodToTransport: good),
                        ),
                      );
                    } : null, // Disable if out of stock
                    icon: Icons.local_shipping_outlined,
                  ),
                  if (good.quantity <= 0)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(
                        'This item is currently out of stock.',
                        style: TextStyle(color: theme.colorScheme.error, fontStyle: FontStyle.italic),
                        textAlign: TextAlign.center,
                      ),
                    ),
                   const SizedBox(height: 40), // Extra space at bottom
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(ThemeData theme, IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: theme.colorScheme.secondary),
          const SizedBox(width: 12),
          Text('$label ', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
          Expanded(
            child: Text(value, style: theme.textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
