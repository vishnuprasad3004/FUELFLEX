'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Truck, Send, ArrowLeft, CalendarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import { VEHICLE_TYPES, BookingStatus, RepaymentStatus, type BookingVehicleType } from '@/models/booking';
import type { Good } from '@/models/goods';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // For Popover Calendar styling
import { calculatePrice, type CalculatePriceInput, type CalculatePriceOutput } from '@/ai/flows/ai-powered-pricing';


const bookTransportSchema = z.object({
  // Pickup (could be from Goods or manual)
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupLatitude: z.number().optional(), // Will be filled by geocoding or from Goods
  pickupLongitude: z.number().optional(),
  
  // Drop-off
  dropoffAddress: z.string().min(5, "Drop-off address is required"),
  dropoffLatitude: z.number({invalid_type_error: "Drop-off latitude must be a number"}).min(-90).max(90),
  dropoffLongitude: z.number({invalid_type_error: "Drop-off longitude must be a number"}).min(-180).max(180),

  goodsType: z.string().min(3, "Goods type/description is required"),
  weightKg: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Weight must be a positive number")
  ),
  vehicleType: z.string().refine(val => VEHICLE_TYPES.includes(val as any), {
    message: `Invalid vehicle type. Must be one of: ${VEHICLE_TYPES.join(', ')}`
  }),
  preferredPickupDate: z.date().optional(),
  specialInstructions: z.string().optional(),
});

type BookTransportFormInputs = z.infer<typeof bookTransportSchema>;

export default function BookTransportPage() {
  useAuthRedirect({ requireAuth: true, requireRole: 'buyer_seller' });
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const goodsId = searchParams.get('goodsId');
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingGoods, setLoadingGoods] = useState(!!goodsId);
  const [priceEstimate, setPriceEstimate] = useState<CalculatePriceOutput | null>(null);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
    reset,
  } = useForm<BookTransportFormInputs>({
    resolver: zodResolver(bookTransportSchema),
  });

  // Watch relevant fields for price estimation
  const watchedFieldsForEstimation = watch([
    "pickupLatitude", "pickupLongitude", "dropoffLatitude", "dropoffLongitude", 
    "weightKg", "vehicleType"
  ]);

  useEffect(() => {
    if (goodsId) {
      const fetchGoodDetails = async () => {
        setLoadingGoods(true);
        try {
          const goodRef = doc(firestore, 'goods', goodsId);
          const docSnap = await getDoc(goodRef);
          if (docSnap.exists()) {
            const goodData = docSnap.data() as Good;
            setValue('pickupAddress', goodData.location.address);
            setValue('pickupLatitude', goodData.location.latitude);
            setValue('pickupLongitude', goodData.location.longitude);
            setValue('goodsType', goodData.productName);
            if (goodData.weightKg) setValue('weightKg', goodData.weightKg);
          } else {
            toast({ title: "Error", description: "Associated good not found.", variant: "destructive"});
          }
        } catch (error) {
          console.error("Error fetching good for booking:", error);
          toast({ title: "Error", description: "Failed to load good details.", variant: "destructive"});
        } finally {
          setLoadingGoods(false);
        }
      };
      fetchGoodDetails();
    }
  }, [goodsId, setValue, toast]);

  const handleGetPriceEstimate = async () => {
    const values = getValues();
    const { pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, weightKg, vehicleType } = values;

    if (pickupLatitude == null || pickupLongitude == null || dropoffLatitude == null || dropoffLongitude == null || !weightKg || !vehicleType) {
      toast({
        title: "Missing Information",
        description: "Please fill in pickup/drop-off coordinates, weight, and vehicle type to get an estimate.",
        variant: "warning",
      });
      return;
    }
    
    setIsEstimatingPrice(true);
    setPriceEstimate(null);
    try {
      const input: CalculatePriceInput = {
        pickupLatitude,
        pickupLongitude,
        destinationLatitude: dropoffLatitude,
        destinationLongitude: dropoffLongitude,
        loadWeightKg: weightKg,
        vehicleType,
      };
      const result = await calculatePrice(input);
      setPriceEstimate(result);
      if (result.estimatedPrice <= 0 && result.breakdown.toLowerCase().includes('error')) {
        toast({ title: "Estimation Error", description: result.breakdown, variant: "destructive"});
      } else {
        toast({ title: "Price Estimated", description: `Estimated cost: ₹${result.estimatedPrice.toLocaleString()}`});
      }
    } catch (error: any) {
      console.error("Error calculating price:", error);
      toast({ title: "Estimation Failed", description: error.message || "Could not get price estimate.", variant: "destructive"});
    } finally {
      setIsEstimatingPrice(false);
    }
  };
  
  // Debounced price estimation or manual trigger might be better for UX
  // For now, let's use a manual button.

  const onSubmit: SubmitHandler<BookTransportFormInputs> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    // A real app would use a geocoding service here for pickupAddress if lat/lng not set
    if (data.pickupLatitude == null || data.pickupLongitude == null) {
        toast({title: "Geocoding Needed", description: "Pickup location needs coordinates. (Geocoding not implemented in this demo)", variant: "warning"});
        // In a real app, call geocoding service:
        // const coords = await geocodeAddress(data.pickupAddress);
        // setValue('pickupLatitude', coords.lat);
        // setValue('pickupLongitude', coords.lng);
        // For demo, let's use placeholders or prevent submission
        // For now, we'll assume they are set if coming from goodsId or manually.
        // This check is more for if a user just types an address without it being resolved.
        return; 
    }


    setLoading(true);
    try {
      const bookingData = {
        buyerId: currentUser.uid,
        goodsId: goodsId || null, // Link to good if applicable
        pickupLocation: {
          address: data.pickupAddress,
          latitude: data.pickupLatitude,
          longitude: data.pickupLongitude,
        },
        dropoffLocation: {
          address: data.dropoffAddress,
          latitude: data.dropoffLatitude,
          longitude: data.dropoffLongitude,
        },
        goodsType: data.goodsType,
        weightKg: data.weightKg,
        vehicleType: data.vehicleType as BookingVehicleType,
        preferredPickupDate: data.preferredPickupDate || null,
        specialInstructions: data.specialInstructions || '',
        status: BookingStatus.PENDING,
        estimatedTransportCost: priceEstimate?.estimatedPrice || 0, // Store estimate
        // fuelCreditRequested: false, // Default or from form
        repayStatus: RepaymentStatus.NOT_APPLICABLE, // Default
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        actionLogs: [{
          timestamp: serverTimestamp(),
          actorId: currentUser.uid,
          actionDescription: 'Booking created by buyer.',
        }],
      };

      const docRef = await addDoc(collection(firestore, 'bookings'), bookingData);
      toast({
        title: "Transport Booked Successfully!",
        description: `Your booking ID is ${docRef.id.substring(0,8)}. We'll notify you about updates.`,
      });
      reset();
      setPriceEstimate(null);
      // router.push(`/marketplace/booking/${docRef.id}`); // Redirect to booking confirmation/details
      router.push('/marketplace');


    } catch (error: any) {
      console.error("Error booking transport:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingGoods && goodsId) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading item details for booking...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center"><Truck className="mr-3 h-7 w-7" /> Book Goods Transport</CardTitle>
          <CardDescription>Enter details for your shipment. All fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Pickup Section */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-1">Pickup Details</legend>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="pickupAddress">Pickup Address*</Label>
                  <Input id="pickupAddress" {...register('pickupAddress')} placeholder="Full pickup address" disabled={!!goodsId} />
                  {errors.pickupAddress && <p className="text-sm text-destructive mt-1">{errors.pickupAddress.message}</p>}
                </div>
                {/* Lat/Lng for pickup could be hidden if auto-filled from goods or geocoded */}
              </div>
            </fieldset>

            {/* Drop-off Section */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-1">Drop-off Details</legend>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="dropoffAddress">Drop-off Address*</Label>
                  <Input id="dropoffAddress" {...register('dropoffAddress')} placeholder="Full drop-off address" />
                  {errors.dropoffAddress && <p className="text-sm text-destructive mt-1">{errors.dropoffAddress.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="dropoffLatitude">Drop-off Latitude*</Label>
                        <Input id="dropoffLatitude" type="number" step="any" {...register('dropoffLatitude', { valueAsNumber: true })} placeholder="e.g., 19.0760" />
                        {errors.dropoffLatitude && <p className="text-sm text-destructive mt-1">{errors.dropoffLatitude.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="dropoffLongitude">Drop-off Longitude*</Label>
                        <Input id="dropoffLongitude" type="number" step="any" {...register('dropoffLongitude', { valueAsNumber: true })} placeholder="e.g., 72.8777" />
                        {errors.dropoffLongitude && <p className="text-sm text-destructive mt-1">{errors.dropoffLongitude.message}</p>}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Tip: Use Google Maps to find coordinates by right-clicking on a location.</p>
              </div>
            </fieldset>
            
            {/* Goods Details Section */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-1">Goods Details</legend>
              <div className="space-y-4 mt-2">
                 <div>
                  <Label htmlFor="goodsType">Type/Description of Goods*</Label>
                  <Input id="goodsType" {...register('goodsType')} placeholder="e.g., Electronics, Furniture, 10 boxes of Apples" disabled={!!goodsId} />
                  {errors.goodsType && <p className="text-sm text-destructive mt-1">{errors.goodsType.message}</p>}
                </div>
                <div>
                  <Label htmlFor="weightKg">Total Weight (kg)*</Label>
                  <Input id="weightKg" type="number" step="0.1" {...register('weightKg')} placeholder="e.g., 150.5" disabled={!!goodsId && getValues("weightKg") > 0} />
                  {errors.weightKg && <p className="text-sm text-destructive mt-1">{errors.weightKg.message}</p>}
                </div>
              </div>
            </fieldset>

            {/* Transport Preferences */}
             <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-1">Transport Preferences</legend>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type*</Label>
                  <Controller
                    name="vehicleType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="vehicleType"><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                        <SelectContent>
                          {VEHICLE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.vehicleType && <p className="text-sm text-destructive mt-1">{errors.vehicleType.message}</p>}
                </div>
                <div>
                    <Label htmlFor="preferredPickupDate">Preferred Pickup Date (Optional)</Label>
                    <Controller
                        name="preferredPickupDate"
                        control={control}
                        render={({ field }) => (
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                            />
                            </PopoverContent>
                        </Popover>
                        )}
                    />
                    {errors.preferredPickupDate && <p className="text-sm text-destructive mt-1">{errors.preferredPickupDate.message}</p>}
                </div>
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea id="specialInstructions" {...register('specialInstructions')} placeholder="e.g., Fragile items, call before arrival." />
                </div>
              </div>
            </fieldset>

            {/* Price Estimation */}
            <Card className="my-6 bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Price Estimation</CardTitle>
                <CardDescription>Get an estimated cost for your transport. This is subject to final confirmation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="button" variant="outline" onClick={handleGetPriceEstimate} disabled={isEstimatingPrice} className="w-full md:w-auto">
                  {isEstimatingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Get Price Estimate
                </Button>
                {priceEstimate && (
                  <div className="p-3 border rounded-md bg-background">
                    <p className="font-semibold text-lg">Estimated Cost: <span className="text-primary">₹{priceEstimate.estimatedPrice.toLocaleString()}</span></p>
                    <p className="text-sm text-muted-foreground">Distance: {priceEstimate.distanceText || `${priceEstimate.distanceKm} km`}</p>
                    <p className="text-sm text-muted-foreground">Travel Time: {priceEstimate.durationText || `${priceEstimate.travelTimeHours} hours`}</p>
                    <p className="text-xs mt-2 text-muted-foreground">Breakdown: {priceEstimate.breakdown}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Button type="submit" className="w-full" disabled={loading || isEstimatingPrice}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Booking Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
