
'use client';

import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, PlusCircle, Search, Filter, ArrowRight, Truck } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { Good, GoodsCategory } from '@/models/goods';
import { GOODS_CATEGORIES } from '@/models/goods';
import { firestore } from '@/firebase/firebase-config';
import { collection, query, where, getDocs, limit, startAfter, orderBy, QueryDocumentSnapshot, DocumentData, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";

const ITEMS_PER_PAGE = 12;

export default function MarketplacePage() {
  useAuthRedirect({ requireAuth: true, requireRole: 'buyer_seller' });

  const [goods, setGoods] = useState<Good[]>([]);
  const [filteredGoods, setFilteredGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<GoodsCategory | 'all'>('all');
  
  // Sorting
  const [sortBy, setSortBy] = useState<'postedAt' | 'price'>('postedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [lastVisibleDoc, setLastVisibleDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);


  const fetchGoods = async (loadMore = false) => {
    setLoading(true);
    try {
      let goodsQuery = query(
        collection(firestore, 'goods'),
        where('isActive', '==', true), 
        orderBy(sortBy, sortDirection),
        limit(ITEMS_PER_PAGE)
      );

      if (loadMore && lastVisibleDoc) {
        goodsQuery = query(goodsQuery, startAfter(lastVisibleDoc));
      } else {
        setLastVisibleDoc(null); 
      }
      
      if (categoryFilter !== 'all') {
         goodsQuery = query(collection(firestore, 'goods'), where('isActive', '==', true), where('category', '==', categoryFilter), orderBy(sortBy, sortDirection), limit(ITEMS_PER_PAGE));
         if (loadMore && lastVisibleDoc) {
            goodsQuery = query(collection(firestore, 'goods'), where('isActive', '==', true), where('category', '==', categoryFilter), orderBy(sortBy, sortDirection), startAfter(lastVisibleDoc), limit(ITEMS_PER_PAGE));
         }
      }


      const unsubscribe = onSnapshot(goodsQuery, (querySnapshot) => {
        const fetchedGoods: Good[] = [];
        querySnapshot.forEach((doc) => {
          fetchedGoods.push({ productId: doc.id, ...doc.data() } as Good);
        });

        if (loadMore) {
          setGoods(prevGoods => [...prevGoods, ...fetchedGoods]);
        } else {
          setGoods(fetchedGoods);
        }
        
        setHasMore(fetchedGoods.length === ITEMS_PER_PAGE);
        if (querySnapshot.docs.length > 0) {
          setLastVisibleDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching goods: ", error);
        toast({ title: "Error", description: "Failed to fetch goods.", variant: "destructive" });
        setLoading(false);
      });
      return unsubscribe;

    } catch (error) {
      console.error("Error constructing goods query: ", error);
      toast({ title: "Query Error", description: "Could not initialize goods fetch.", variant: "destructive" });
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribePromise = fetchGoods();
     return () => {
      unsubscribePromise?.then(unsub => {
        if (typeof unsub === 'function') {
          unsub();
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortDirection, categoryFilter]); 

  useEffect(() => {
    let tempGoods = [...goods];
    if (searchTerm) {
      tempGoods = tempGoods.filter(g => 
        g.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredGoods(tempGoods);
  }, [goods, searchTerm]);


  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchGoods(true);
    }
  };

  const memoizedFilteredGoods = useMemo(() => filteredGoods, [filteredGoods]);


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl bg-gradient-to-r from-primary via-primary/90 to-accent/50 text-primary-foreground border-primary/30">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center p-6">
          <div>
            <CardTitle className="text-3xl font-bold flex items-center"><ShoppingBag className="mr-3 h-8 w-8" /> Goods Marketplace</CardTitle>
            <CardDescription className="text-primary-foreground/90 mt-1">Browse goods, find sellers, and book transport.</CardDescription>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link href="/marketplace/list-good" passHref legacyBehavior>
              <Button variant="secondary" size="lg" className="shadow-md text-secondary-foreground hover:bg-secondary/80">
                <PlusCircle className="mr-2 h-5 w-5" /> List Your Good
              </Button>
            </Link>
            <Link href="/marketplace/book-transport" passHref legacyBehavior>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
                <Truck className="mr-2 h-5 w-5" /> Book Transport
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Filtering and Search Section */}
      <Card className="mb-8 p-6 shadow-lg border-border">
        <CardContent className="flex flex-col md:flex-row gap-4 items-center p-0">
          <div className="flex-grow w-full md:w-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search by product name, description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10"
              aria-label="Search goods"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as GoodsCategory | 'all')}>
              <SelectTrigger className="w-full md:w-[200px] h-11" aria-label="Filter by category">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {GOODS_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy + '_' + sortDirection} onValueChange={(value) => {
              const [newSortBy, newSortDirection] = value.split('_');
              setSortBy(newSortBy as 'postedAt' | 'price');
              setSortDirection(newSortDirection as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-full md:w-[180px] h-11" aria-label="Sort by">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postedAt_desc">Newest First</SelectItem>
                <SelectItem value="postedAt_asc">Oldest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goods Listing Section */}
      {loading && goods.length === 0 && (
         <div className="text-center py-10">
            <ShoppingBag className="h-16 w-16 text-muted-foreground animate-pulse mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading available goods...</p>
        </div>
      )}
      
      {!loading && memoizedFilteredGoods.length === 0 && (
        <Card className="text-center py-16 shadow-md border-dashed border-muted-foreground/30">
          <CardContent>
            <Search className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <p className="text-2xl font-semibold text-foreground mb-2">No Goods Found</p>
            <p className="text-md text-muted-foreground">Try adjusting your search terms or category filters.</p>
          </CardContent>
        </Card>
      )}

      {memoizedFilteredGoods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {memoizedFilteredGoods.map((good) => (
            <Card key={good.productId} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full group transform hover:-translate-y-1 border-border hover:border-primary/50">
              <Link href={`/marketplace/goods/${good.productId}`} className="block">
                <div className="relative w-full h-52 bg-muted overflow-hidden">
                  <Image
                    src={good.images?.[0] || `https://picsum.photos/seed/${good.productId}/400/300`}
                    alt={good.productName}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={`${good.category} marketplace`}
                    className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                </div>
              </Link>
              <CardHeader className="pb-2 pt-4">
                <Link href={`/marketplace/goods/${good.productId}`} className="block">
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate" title={good.productName}>
                    {good.productName}
                  </CardTitle>
                </Link>
                <CardDescription className="text-xs text-muted-foreground">{good.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <p className="text-sm text-muted-foreground h-10 overflow-hidden text-ellipsis leading-tight">
                  {good.description.substring(0, 70)}{good.description.length > 70 ? '...' : ''}
                </p>
                <div className="flex justify-between items-center pt-1">
                  <p className="text-xl font-bold text-primary">₹{good.price.toLocaleString()}</p>
                  {good.quantity && <span className="text-xs text-muted-foreground">Qty: {good.quantity}</span>}
                </div>
              </CardContent>
              <div className="p-4 border-t mt-auto">
                <Link href={`/marketplace/goods/${good.productId}`} passHref legacyBehavior>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {hasMore && !loading && memoizedFilteredGoods.length > 0 && (
        <div className="text-center mt-12">
          <Button onClick={handleLoadMore} variant="outline" size="lg" className="text-primary border-primary hover:bg-primary/10">
            Load More Goods
          </Button>
        </div>
      )}
    </div>
  );
}