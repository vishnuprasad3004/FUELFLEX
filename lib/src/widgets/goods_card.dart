
import 'package:flutter/material.dart';
import '../models/goods_model.dart'; // Your Good model
import 'package:cached_network_image/cached_network_image.dart'; // For network images with caching

class GoodsCard extends StatelessWidget {
  final Good good;
  final VoidCallback onTap;

  const GoodsCard({super.key, required this.good, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias, // Important for image border radius
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Expanded(
              flex: 3, // Give more space to the image
              child: (good.images != null && good.images!.isNotEmpty && good.images!.first.isNotEmpty)
                  ? CachedNetworkImage(
                      imageUrl: good.images!.first,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
                        child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                      errorWidget: (context, url, error) => Container(
                         color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
                        child: Icon(Icons.broken_image_outlined, size: 40, color: theme.hintColor),
                      ),
                    )
                  : Container( // Placeholder if no image
                      color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
                      child: Icon(Icons.inventory_2_outlined, size: 50, color: theme.hintColor.withOpacity(0.5)),
                    ),
            ),
            Expanded(
              flex: 2, // Space for text content
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Text(
                      good.productName,
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '₹${good.price.toStringAsFixed(0)}',
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined, size: 14, color: theme.hintColor),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            good.location.address.split(',').first, // Show only city or first part
                            style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
