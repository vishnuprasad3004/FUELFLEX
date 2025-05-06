
"use client"; 

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GOODS_CATEGORIES, type Good } from "@/models/goods"; 
import Image from "next/image";
import Link from "next/link";
import { IndianRupee, MapPin, Package, Search, ShoppingCart, Tag, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Data - Replace with actual data fetching from Firestore
const mockGoods: Good[] = [
  {
    productId: "G001",
    sellerId: "S001",
    productName: "Organic Alphonso Mangoes (1 Dozen)",
    category: "Fruits & Vegetables",
    price: 750,
    quantity: 50,
    description: "Farm-fresh, naturally ripened Alphonso mangoes from Ratnagiri. Sweet and delicious.",
    location: { address: "Ratnagiri, Maharashtra", latitude: 16.9944, longitude: 73.3000 },
    contact: "Seller Contact: +91-XXXXXXXXXX",
    images: ["https://picsum.photos/seed/mangoes_1/400/300"],
    weightKg: 3,
    postedAt: new Date("2024-07-28T09:00:00Z"),
    updatedAt: new Date("2024-07-28T09:00:00Z"),
    isActive: true,
  },
  {
    productId: "G002",
    sellerId: "S002",
    productName: "Handcrafted Wooden Chair",
    category: "Furniture & Home Goods",
    price: 2200,
    quantity: 10,
    description: "Beautifully handcrafted Sheesham wood chair with intricate carvings. Perfect for study or dining.",
    location: { address: "Jodhpur, Rajasthan", latitude: 26.2389, longitude: 73.0243 },
    contact: "Seller Contact: +91-YYYYYYYYYY",
    images: ["https://picsum.photos/seed/woodchair_1/400/300"],
    weightKg: 8,
    postedAt: new Date("2024-07-27T14:30:00Z"),
    updatedAt: new Date("2024-07-27T14:30:00Z"),
    isActive: true,
  },
  {
    productId: "G003",
    sellerId: "S001",
    productName: "Basmati Rice (5kg Bag)",
    category: "Groceries & Agri-Produce",
    price: 450,
    quantity: 200,
    description: "Premium quality long-grain Basmati rice, aged for aroma and flavor.",
    location: { address: "Karnal, Haryana", latitude: 29.6857, longitude: 76.9905 },
    contact: "Seller Contact: +91-XXXXXXXXXX",
    images: ["https://picsum.photos/seed/basmatirice_1/400/300"],
    weightKg: 5,
    postedAt: new Date("2024-07-29T11:00:00Z"),
    updatedAt: new Date("2024-07-29T11:00:00Z"),
    isActive: true,
  },
   {
    productId: "G004",
    sellerId: "S003",
    productName: "Cotton T-Shirts (Pack of 5)",
    category: "Fashion & Apparel",
    price: 999,
    quantity: 75,
    description: "Comfortable and durable 100% cotton T-shirts in assorted colors.",
    location: { address: "Tiruppur, Tamil Nadu", latitude: 11.1085, longitude: 77.3411 },
    contact: "Seller Contact: +91-ZZZZZZZZZZ",
    images: ["https://picsum.photos/seed/tshirts_1/400/300"],
    weightKg: 0.8, // Weight for the pack
    postedAt: new Date("2024-07-30T10:00:00Z"),
    updatedAt: new Date("2024-07-30T10:00:00Z"),
    isActive: true,
  },
];


export default function BrowseGoodsPage() {
  const [goods, setGoods] = useState<Good[]>([]);
  const [filteredGoods, setFilteredGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  useEffect(() => {
    // Simulate fetching goods data
    // In a real app, fetch from Firestore here
    setGoods(mockGoods);
    setFilteredGoods(mockGoods);
    setLoading(false);
  }, []);

  useEffect(() => {
    let currentGoods = [...goods];

    // Filter by search term
    if (searchTerm) {
      currentGoods = currentGoods.filter(good =>
        good.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        good.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      currentGoods = currentGoods.filter(good => good.category === selectedCategory);
    }

    setFilteredGoods(currentGoods);
  }, [searchTerm, selectedCategory, goods]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };


  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-start p-4 md:p-8 bg-gradient-to-br from-background to-secondary/10">
      <div className="w-full max-w-7xl space-y-8">
        <div className="text-center mb-8">
          <ShoppingCart className="mx-auto h-12 w-12 text-primary mb-3" />
          <h1 className="text-3xl font-bold text-primary">Browse Goods for Sale</h1>
          <p className="text-muted-foreground">
            Find products from sellers across India and arrange transport.
          </p>
        </div>

        {/* Filtering Section */}
        <Card className="p-4 md:p-6 shadow-md">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Filter Products</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label htmlFor="searchTerm" className="text-sm font-medium text-muted-foreground">Search by Name/Description</label>
                        <Input 
                            id="searchTerm" 
                            placeholder="e.g., Mangoes, Wooden Chair" 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="categoryFilter" className="text-sm font-medium text-muted-foreground">Filter by Category</label>
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger id="categoryFilter">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {GOODS_CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     {/* Button is no longer needed as filters apply live */}
                     {/* <Button className="w-full md:w-auto"><Search className="mr-2 h-4 w-4"/>Apply Filters</Button> */}
                </div>
            </CardContent>
        </Card>
        

        {/* Goods Listing Section */}
        {loading && <p className="text-center py-10 text-muted-foreground">Loading products...</p>}
        {!loading && filteredGoods.length === 0 && (
          <p className="text-center py-10 text-muted-foreground">No goods found matching your criteria.</p>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGoods.map((good) => (
            <Card key={good.productId} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0 relative">
                {good.images && good.images[0] ? (
                  <Image
                    src={good.images[0]}
                    alt={good.productName}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                    data-ai-hint={`${good.category} product`}
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground opacity-50" />
                  </div>
                )}
                 <Badge className="absolute top-2 right-2" variant={good.quantity > 0 ? "default" : "destructive"}>
                    {good.quantity > 0 ? `${good.quantity} Available` : "Out of Stock"}
                 </Badge>
              </CardHeader>
              <CardContent className="p-4 flex-grow space-y-2">
                <CardTitle className="text-lg text-primary hover:text-accent transition-colors">
                  <Link href={`/goods/${good.productId}`}>{good.productName}</Link>
                </CardTitle>
                 <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="mr-1.5 h-3.5 w-3.5" /> {good.category}
                 </div>
                <CardDescription className="text-sm h-16 overflow-hidden text-ellipsis">
                  {good.description}
                </CardDescription>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1.5 h-3.5 w-3.5" /> {good.location.address}
                </div>
              </CardContent>
              <Separator className="my-0" />
              <CardFooter className="p-4 flex flex-col items-start space-y-3">
                <div className="flex justify-between items-center w-full">
                    <p className="text-xl font-semibold text-primary flex items-center">
                        <IndianRupee className="h-5 w-5 mr-0.5" />{good.price.toLocaleString('en-IN')}
                    </p>
                    {good.weightKg && <Badge variant="outline">~{good.weightKg} kg</Badge>}
                </div>
                <Link href={`/book-transport?goodsId=${good.productId}`} passHref className="w-full">
                  <Button className="w-full bg-accent hover:bg-primary text-accent-foreground" disabled={good.quantity <=0}>
                    <Truck className="mr-2 h-4 w-4" /> Book Transport
                  </Button>
                </Link>
                <Link href={`/goods/${good.productId}`} passHref className="w-full">
                    <Button variant="outline" className="w-full">
                        View Details
                    </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {/* Pagination Placeholder */}
        <div className="text-center mt-8">
            <Button variant="outline" disabled>Load More (Pagination Coming Soon)</Button>
        </div>
      </div>
    </main>
  );
}

// Individual Good Detail Page (Example Structure - /goods/[productId]/page.tsx)
// You would create a new file like src/app/goods/[productId]/page.tsx for this.
/*
export default function GoodDetailPage({ params }: { params: { productId: string } }) {
  // Fetch good details based on params.productId from Firestore
  // const good = fetchGoodById(params.productId);
  // if (!good) return <p>Good not found.</p>;

  return (
    <div>
      <h1>{good.productName}</h1>
      <p>{good.description}</p>
      // Display all other good details
      <Link href={`/book-transport?goodsId=${good.productId}`}>
        <Button>Book Transport for this Item</Button>
      </Link>
    </div>
  );
}
*/
