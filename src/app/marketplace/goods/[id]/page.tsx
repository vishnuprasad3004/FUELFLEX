
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import type { Good } from '@/models/goods';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Truck, MapPin, Tag, Package, CalendarDays } from 'lucide-react'; // Removed ShoppingCart, Phone. Added CalendarDays
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

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
            router.push('/marketplace'); 
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
      setLoading(false);
      toast({ title: "Invalid ID", description: "No good ID provided.", variant: "destructive" });
      router.push('/marketplace');
    }
  }, [goodId, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading good details...</p>
      </div>
    );
  }

  if (!good) {
    return ( 
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-lg text-muted-foreground">Good item not found or error loading details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 group hover:bg-secondary">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
      </Button>

      <Card className="overflow-hidden shadow-xl border-primary/20">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative h-80 md:h-[500px] bg-muted group">
            <Image
              src={good.images?.[0] || `https://picsum.photos/seed/${good.productId}/800/600`}
              alt={good.productName}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-105"
              data-ai-hint={`${good.category} product`}
            />
             {good.images && good.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                    1 / {good.images.length}
                </div>
             )}
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 flex flex-col bg-card">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground">{good.productName}</CardTitle>
              <CardDescription className="text-2xl text-primary font-semibold mt-1">₹{good.price.toLocaleString()}</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-5 flex-grow">
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="mr-3 h-5 w-5 text-primary" /> Category: <span className="ml-1 font-medium text-foreground">{good.category}</span>
              </div>
              {good.quantity && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="mr-3 h-5 w-5 text-primary" /> Quantity Available: <span className="ml-1 font-medium text-foreground">{good.quantity}</span>
                </div>
              )}
              
              <p className="text-base leading-relaxed text-foreground/90">{good.description}</p>

              {good.weightKg && (
                <p className="text-sm text-muted-foreground">Approx. Weight: <span className="font-medium text-foreground">{good.weightKg} kg</span></p>
              )}

              <div className="pt-4 border-t mt-5">
                <h3 className="font-semibold mb-3 text-md text-foreground">Seller &amp; Pickup Information</h3>
                <div className="flex items-start text-sm text-muted-foreground mb-2">
                  <MapPin className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 
                  <div>
                    <span className="font-medium text-foreground block">Pickup Location:</span>
                    {good.location.address}
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-3 h-5 w-5 text-primary" /> Posted on: <span className="ml-1 font-medium text-foreground">{format(new Date((good.postedAt as any).seconds * 1000), 'PPP')}</span>
                </div>
              </div>
            </CardContent>
            
            <div className="mt-auto pt-8">
              <Link href={`/marketplace/book-transport?goodsId=${good.productId}`} passHref legacyBehavior>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base py-3">
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