'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import type { Good } from '@/models/goods';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Truck, ShoppingCart, MapPin, Phone, Tag, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function GoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const goodId = typeof params.id === 'string' ? params.id : null;

  const [good, setGood] = useState<Good | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (goodId) {
      const fetchGood = async () => {
        setLoading(true);
        try {
          const goodRef = doc(firestore, 'goods', goodId);
          const docSnap = await getDoc(goodRef);

          if (docSnap.exists()) {
            setGood({ productId: docSnap.id, ...docSnap.data() } as Good);
          } else {
            toast({
              title: "Not Found",
              description: "This good item could not be found.",
              variant: "destructive",
            });
            router.push('/marketplace'); // Redirect if good not found
          }
        } catch (error) {
          console.error("Error fetching good details:", error);
          toast({
            title: "Error",
            description: "Failed to fetch good details.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchGood();
    } else {
      // Handle case where ID is not available or invalid, though router should catch this earlier
      setLoading(false);
      toast({ title: "Invalid ID", description: "No good ID provided.", variant: "destructive" });
      router.push('/marketplace');
    }
  }, [goodId, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading good details...</p>
      </div>
    );
  }

  if (!good) {
    return ( // Fallback for when good is null after loading (e.g., not found and redirect hasn't completed)
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Good item not found or error loading details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery (simplified) */}
          <div className="relative h-96 md:h-auto bg-muted">
            <Image
              src={good.images?.[0] || `https://picsum.photos/seed/${good.productId}/800/600`}
              alt={good.productName}
              layout="fill"
              objectFit="cover"
              data-ai-hint={`${good.category} product detail`}
            />
            {/* TODO: Add image carousel if multiple images */}
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl font-bold">{good.productName}</CardTitle>
              <CardDescription className="text-lg text-primary">₹{good.price.toLocaleString()}</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-4 flex-grow">
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="mr-2 h-4 w-4" /> Category: <span className="ml-1 font-medium text-foreground">{good.category}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Package className="mr-2 h-4 w-4" /> Quantity Available: <span className="ml-1 font-medium text-foreground">{good.quantity}</span>
              </div>
              
              <p className="text-base leading-relaxed">{good.description}</p>

              {good.weightKg && (
                <p className="text-sm text-muted-foreground">Approx. Weight: {good.weightKg} kg</p>
              )}

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2 text-md">Seller Information</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" /> Pickup Location: <span className="ml-1 font-medium text-foreground">{good.location.address}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" /> Contact: <span className="ml-1 font-medium text-foreground">{good.contact}</span>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">Posted on: {new Date((good.postedAt as any).seconds * 1000).toLocaleDateString()}</p>
              </div>
            </CardContent>
            
            <div className="mt-auto pt-6">
              <Link href={`/marketplace/book-transport?goodsId=${good.productId}`} passHref legacyBehavior>
                <Button size="lg" className="w-full">
                  <Truck className="mr-2 h-5 w-5" /> Book Transport for this Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
