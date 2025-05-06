
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPin, Package, DollarSign, Tag, Hash, Image as ImageIcon, Building, Home, Loader2, AlertCircle, Info, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GOODS_CATEGORIES, type GoodsCategory } from "@/models/goods";
// import { addDoc, collection } from "firebase/firestore"; // Uncomment when ready for Firestore
// import { firestore } from "@/firebase/firebase-config"; // Uncomment
// import { auth } from "@/firebase/firebase-config"; // To get sellerId, uncomment

// Mock coordinates for demo
const EXAMPLE_COORDINATES = {
    delhi: { lat: 28.6139, lng: 77.2090 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    bengaluru: { lat: 12.9716, lng: 77.5946 },
};

const formSchema = z.object({
  productName: z.string().min(3, { message: "Product name must be at least 3 characters." }).max(100),
  category: z.string().min(1, { message: "Please select a category." }) as z.ZodType<GoodsCategory>,
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  quantity: z.coerce.number().int().positive({ message: "Quantity must be a positive integer." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500),
  pickupAddress: z.string().min(5, { message: "Pickup address must be at least 5 characters." }),
  pickupLatitude: z.number().min(-90).max(90).optional(),
  pickupLongitude: z.number().min(-180).max(180).optional(),
  contact: z.string().min(10, { message: "Contact information is required (e.g., phone)." }).max(50),
  weightKg: z.coerce.number().positive({ message: "Approximate weight per unit must be positive." }).optional(),
  // imageFiles: typeof window === 'undefined' ? z.any() : z.instanceof(FileList).optional(), // For file uploads
});

type FormData = z.infer<typeof formSchema>;

export function SellGoodsForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      category: GOODS_CATEGORIES[0],
      price: undefined,
      quantity: undefined,
      description: "",
      pickupAddress: "Mumbai", // Default for demo
      pickupLatitude: EXAMPLE_COORDINATES.mumbai.lat,
      pickupLongitude: EXAMPLE_COORDINATES.mumbai.lng,
      contact: "",
      weightKg: undefined,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    // const currentUser = auth.currentUser; // Uncomment when auth is set up
    // if (!currentUser) {
    //   setSubmissionError("You must be logged in to list goods.");
    //   toast({ variant: "destructive", title: "Authentication Error", description: "Please log in." });
    //   setIsLoading(false);
    //   return;
    // }

    const pickupCoords = {
        latitude: values.pickupLatitude, 
        longitude: values.pickupLongitude,
    };
    
    if (!pickupCoords.latitude || !pickupCoords.longitude) {
      setSubmissionError("Could not determine coordinates for the pickup address. Please try a different address or ensure it's recognizable.");
      toast({ variant: "destructive", title: "Location Error", description: "Invalid pickup address coordinates." });
      setIsLoading(false);
      return;
    }

    const goodsData = {
      // sellerId: currentUser.uid, // Uncomment
      sellerId: "mockSellerId123", // Placeholder
      productName: values.productName,
      category: values.category,
      price: values.price,
      quantity: values.quantity,
      description: values.description,
      location: {
        address: values.pickupAddress,
        latitude: pickupCoords.latitude,
        longitude: pickupCoords.longitude,
      },
      contact: values.contact,
      weightKg: values.weightKg,
      // images: [], // Placeholder for image URLs after upload
      postedAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    try {
      console.log("[SellGoodsForm] Submitting goods data:", goodsData);
      // ** Firestore Integration Placeholder **
      // const docRef = await addDoc(collection(firestore, "goods"), goodsData);
      // console.log("[SellGoodsForm] Goods listed successfully with ID:", docRef.id);
      // setSubmissionSuccess(`Your product "${values.productName}" has been listed successfully! Product ID: ${docRef.id}`);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const mockProductId = `mock-${Date.now()}`;
      setSubmissionSuccess(`Mock: Your product "${values.productName}" has been listed! Product ID: ${mockProductId}`);
      toast({
        title: "Goods Listed (Mock)",
        description: `Product "${values.productName}" is now available.`,
      });
      form.reset(); // Reset form on success

    } catch (error: any) {
      console.error("[SellGoodsForm] Error listing goods:", error);
      setSubmissionError(`Failed to list goods: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Listing Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  React.useEffect(() => {
    const pickupAddr = form.watch('pickupAddress').toLowerCase();
    const getCoords = (addr: string) => {
        if (addr.includes('delhi')) return EXAMPLE_COORDINATES.delhi;
        if (addr.includes('mumbai')) return EXAMPLE_COORDINATES.mumbai;
        if (addr.includes('kolkata')) return EXAMPLE_COORDINATES.kolkata;
        if (addr.includes('chennai')) return EXAMPLE_COORDINATES.chennai;
        if (addr.includes('bengaluru' || addr.includes('bangalore'))) return EXAMPLE_COORDINATES.bengaluru;
        return null; 
    }
    const coords = getCoords(pickupAddr);
    if (coords) {
        form.setValue('pickupLatitude', coords.lat, { shouldValidate: true });
        form.setValue('pickupLongitude', coords.lng, { shouldValidate: true });
    } else {
        form.setValue('pickupLatitude', undefined, { shouldValidate: true });
        form.setValue('pickupLongitude', undefined, { shouldValidate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('pickupAddress')]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Product Details</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Provide information about the goods you want to sell and make available for transport.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-secondary" /> Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fresh Apples, Samsung LED TV" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Tag className="mr-2 h-4 w-4 text-secondary" /> Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GOODS_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-secondary" /> Price (INR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Hash className="mr-2 h-4 w-4 text-secondary" /> Available Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-secondary" /> Approx. Weight per Unit (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1.5" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Optional, but helps in transport estimation.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Info className="mr-2 h-4 w-4 text-secondary" /> Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed description of your product, condition, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pickupAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4 text-secondary" /> Pickup Address / City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Delhi, Mumbai, or specific address" {...field} />
                  </FormControl>
                   <FormDescription className="text-xs">
                      (Type major city name for demo coords, or full address for future geocoding)
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Hidden fields for coordinates */}
            <FormField control={form.control} name="pickupLatitude" render={({ field }) => <Input type="hidden" {...field} />} />
            <FormField control={form.control} name="pickupLongitude" render={({ field }) => <Input type="hidden" {...field} />} />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-secondary" /> Seller Contact Info</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Your Phone Number or Email" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">This will be shared with interested buyers/transporters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Placeholder - Actual implementation requires storage service */}
            <FormItem>
              <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-secondary" /> Product Images (Optional)</FormLabel>
              <FormControl>
                <Input type="file" multiple disabled />
              </FormControl>
              <FormDescription className="text-xs">Image upload functionality coming soon. Requires Firebase Storage setup.</FormDescription>
              <FormMessage />
            </FormItem>


            {submissionError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submissionError}</AlertDescription>
              </Alert>
            )}
             {submissionSuccess && (
              <Alert variant="default" className="mt-4 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-700 dark:text-green-300">Success!</AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-400">{submissionSuccess}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full bg-accent hover:bg-primary transition-colors duration-200" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Listing Goods...
                </>
              ) : (
                "List Goods for Sale"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
       <CardFooter>
            <p className="text-xs text-muted-foreground italic text-center w-full pt-2">
              By listing your goods, you agree to our terms and conditions regarding sale and transport coordination.
            </p>
       </CardFooter>
    </Card>
  );
}
