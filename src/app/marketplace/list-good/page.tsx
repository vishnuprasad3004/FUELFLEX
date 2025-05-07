'use client';

import { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, UploadCloud, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import { uploadFile } from '@/services/storage-service'; 
import { GOODS_CATEGORIES, type GoodsCategory } from '@/models/goods';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useToast } from "@/components/ui/use-toast";
import Image from 'next/image';

const listGoodSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters"),
  category: z.nativeEnum(GOODS_CATEGORIES, { errorMap: () => ({ message: "Please select a category" }) }),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Price must be a positive number")
  ),
  quantity: z.preprocess(
    (val) => val ? parseInt(String(val), 10) : undefined, // Allow empty or convert to number
    z.number().int().positive("Quantity must be a positive integer").optional() // Make quantity optional
  ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  locationAddress: z.string().min(5, "Pickup address is required"),
  weightKg: z.preprocess(
    (val) => val ? parseFloat(String(val)) : undefined,
    z.number().positive("Weight must be a positive number").optional()
  ),
  // contact: z.string().min(10, "Contact information is required (e.g., phone number)"), // Removed contact field
  // images: z.custom<FileList>().optional(), // For file uploads - handled separately
});

type ListGoodFormInputs = z.infer<typeof listGoodSchema>;

export default function ListGoodPage() {
  useAuthRedirect({ requireAuth: true, requireRole: 'buyer_seller' });
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ListGoodFormInputs>({
    resolver: zodResolver(listGoodSchema),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles(files);
      const previews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setImageFiles(null);
      setImagePreviews([]);
    }
  };

  const onSubmit: SubmitHandler<ListGoodFormInputs> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to list a good.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      let imageUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const file of Array.from(imageFiles)) {
          const path = `goods/${currentUser.uid}/${Date.now()}-${file.name}`;
          const url = await uploadFile({ file, path });
          imageUrls.push(url);
        }
      }

      const goodData = {
        sellerId: currentUser.uid,
        productName: data.productName,
        category: data.category,
        price: data.price,
        quantity: data.quantity, // Will be undefined if not provided, or a number
        description: data.description,
        location: { 
          address: data.locationAddress,
          latitude: 0, 
          longitude: 0, 
        },
        // contact: data.contact, // Removed contact field
        images: imageUrls,
        weightKg: data.weightKg,
        postedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true, 
      };

      const docRef = await addDoc(collection(firestore, 'goods'), goodData);
      toast({
        title: "Good Listed Successfully!",
        description: `${data.productName} is now available in the marketplace.`,
      });
      reset();
      setImageFiles(null);
      setImagePreviews([]);
      router.push(`/marketplace/goods/${docRef.id}`);

    } catch (error: any) {
      console.error("Error listing good:", error);
      toast({
        title: "Listing Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
       <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center"><PlusCircle className="mr-2 h-6 w-6" /> List Your Good for Sale</CardTitle>
          <CardDescription>Fill in the details below to add your item to the marketplace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" {...register('productName')} placeholder="e.g., Samsung 55-inch Smart TV" />
              {errors.productName && <p className="text-sm text-destructive mt-1">{errors.productName.message}</p>}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {GOODS_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <Label htmlFor="price">Price (INR)</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} placeholder="e.g., 25000" />
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
              </div>

              {/* Quantity (Optional) */}
              <div>
                <Label htmlFor="quantity">Quantity <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                <Input id="quantity" type="number" step="1" {...register('quantity')} placeholder="e.g., 10" />
                {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} placeholder="Detailed description of your product..." />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            {/* Location Address */}
            <div>
              <Label htmlFor="locationAddress">Pickup Address</Label>
              <Input id="locationAddress" {...register('locationAddress')} placeholder="Full pickup address" />
              {errors.locationAddress && <p className="text-sm text-destructive mt-1">{errors.locationAddress.message}</p>}
            </div>
            
            {/* Contact Field Removed */}
            {/* <div>
              <Label htmlFor="contact">Contact Information (Phone/Email)</Label>
              <Input id="contact" {...register('contact')} placeholder="Your contact details for buyers" />
              {errors.contact && <p className="text-sm text-destructive mt-1">{errors.contact.message}</p>}
            </div> */}

            {/* Weight (Optional) */}
            <div>
              <Label htmlFor="weightKg">Approximate Weight (kg) <span className="text-xs text-muted-foreground">(Optional)</span></Label>
              <Input id="weightKg" type="number" step="0.1" {...register('weightKg')} placeholder="e.g., 15.5" />
              {errors.weightKg && <p className="text-sm text-destructive mt-1">{errors.weightKg.message}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="images">Product Images <span className="text-xs text-muted-foreground">(Optional, max 3 recommended)</span></Label>
              <Input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} />
              {imagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative w-full h-24 border rounded overflow-hidden">
                       <Image src={src} alt={`Preview ${index + 1}`} layout="fill" objectFit="cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              List Good
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
