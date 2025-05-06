
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/goods_model.dart'; // Ensure this model exists
import '../../widgets/goods_card.dart'; // You'll create this widget
import 'goods_detail_screen.dart'; // For navigation

class BrowseGoodsScreen extends StatefulWidget {
  const BrowseGoodsScreen({super.key});

  @override
  State<BrowseGoodsScreen> createState() => _BrowseGoodsScreenState();
}

class _BrowseGoodsScreenState extends State<BrowseGoodsScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  String _searchTerm = '';
  String? _selectedCategory; // Can be null if no category is selected

  Stream<QuerySnapshot<Map<String, dynamic>>> _getGoodsStream() {
    Query query = _firestore.collection('goods').where('isActive', isEqualTo: true);

    if (_selectedCategory != null && _selectedCategory!.isNotEmpty) {
      query = query.where('category', isEqualTo: _selectedCategory);
    }
    // Note: Firestore does not support case-insensitive search or partial string matching directly
    // for searching on _searchTerm. You'd typically use a third-party search service like Algolia
    // or implement a more complex solution for full-text search.
    // For a basic filter, you can filter client-side after fetching, or structure data for simple queries.
    // Here, we'll fetch based on category and then filter by name client-side if searchTerm is present.
    return query.orderBy('postedAt', descending: true).snapshots()
      as Stream<QuerySnapshot<Map<String, dynamic>>>;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Browse Goods'),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search goods by name...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: theme.colorScheme.surfaceVariant.withOpacity(0.5),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _searchTerm = value;
                    });
                  },
                ),
                const SizedBox(height: 10),
                // Basic Category Filter (DropdownButton or similar)
                DropdownButtonFormField<String>(
                  decoration: InputDecoration(
                    labelText: 'Filter by Category',
                     border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: theme.colorScheme.surfaceVariant.withOpacity(0.5),
                  ),
                  value: _selectedCategory,
                  hint: const Text('All Categories'),
                  isExpanded: true,
                  items: [
                    const DropdownMenuItem<String>(
                      value: null, // Represents "All Categories"
                      child: Text('All Categories'),
                    ),
                    ...GOODS_CATEGORIES.map((category) { // GOODS_CATEGORIES from goods_model.dart
                      return DropdownMenuItem<String>(
                        value: category,
                        child: Text(category),
                      );
                    }).toList(),
                  ],
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedCategory = newValue;
                    });
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: _getGoodsStream(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }
                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return const Center(child: Text('No goods found.'));
                }

                List<Good> goodsList = snapshot.data!.docs
                    .map((doc) => Good.fromJson(doc.data(), doc.id))
                    .toList();

                // Client-side filtering for search term (basic implementation)
                if (_searchTerm.isNotEmpty) {
                  goodsList = goodsList.where((good) =>
                    good.productName.toLowerCase().contains(_searchTerm.toLowerCase()) ||
                    (good.description?.toLowerCase().contains(_searchTerm.toLowerCase()) ?? false)
                  ).toList();
                }
                 if (goodsList.isEmpty && _searchTerm.isNotEmpty) {
                  return const Center(child: Text('No goods match your search.'));
                }


                return GridView.builder(
                  padding: const EdgeInsets.all(12.0),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
                    childAspectRatio: 0.75, // Adjust as needed
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: goodsList.length,
                  itemBuilder: (context, index) {
                    final good = goodsList[index];
                    return GoodsCard(
                      good: good,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => GoodsDetailScreen(good: good),
                          ),
                        );
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
