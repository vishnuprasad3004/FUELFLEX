
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Truck, Send, ArrowLeft, CalendarIcon, MapPinIcon, ArrowRight, IndianRupee, Milestone, Clock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import { BookingStatus, RepaymentStatus } from '@/models/booking';
import type { Good } from '@/models/goods';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; 
import { calculatePrice, type CalculatePriceInput, type CalculatePriceOutput } from '@/ai/flows/ai-powered-pricing';
import { Separator } from '@/components/ui/separator';

const bookTransportSchema = z.object({
  // Pickup (could be from Goods or manual)
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupLatitude: z.number({required_error: "Pickup latitude is required from map selection.", invalid_type_error: "Pickup latitude must be a number"}).min(-90).max(90), 
  pickupLongitude: z.number({required_error: "Pickup longitude is required from map selection.", invalid_type_error: "Pickup longitude must be a number"}).min(-180).max(180),
  
  // Drop-off
  dropoffAddress: z.string().min(5, "Drop-off address is required"),
  dropoffLatitude: z.number({required_error: "Drop-off latitude is required from map selection.", invalid_type_error: "Drop-off latitude must be a number"}).min(-90).max(90),
  dropoffLongitude: z.number({required_error: "Drop-off longitude is required from map selection.", invalid_type_error: "Drop-off longitude must be a number"}).min(-180).max(180),

  goodsType: z.string().min(3, "Goods type/description is required"),
  weightKg: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Weight must be a positive number")
  ),
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
    trigger, 
  } = useForm<BookTransportFormInputs>({
    resolver: zodResolver(bookTransportSchema),
  });

  const watchedFieldsForEstimation = watch([
    "pickupLatitude", "pickupLongitude", "dropoffLatitude", "dropoffLongitude", 
    "weightKg"
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
            setValue('pickupLatitude', goodData.location.latitude, { shouldValidate: true });
            setValue('pickupLongitude', goodData.location.longitude, { shouldValidate: true });
            setValue('goodsType', goodData.productName);
            if (goodData.weightKg) setValue('weightKg', goodData.weightKg);
            trigger(['pickupLatitude', 'pickupLongitude']);
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
  }, [goodsId, setValue, toast, trigger]);

  const handleSelectOnMap = useCallback( (locationType: 'pickup' | 'dropoff') => {
    const mockSelectedLocation = 
      locationType === 'pickup' ? 
      {
        lat: 28.6139, 
        lng: 77.2090,
        address: "Connaught Place, New Delhi, Delhi (Mock)",
      } : 
      { 
        lat: 19.0760, 
        lng: 72.8777,
        address: "Mumbai Central, Mumbai, Maharashtra (Mock)",
      };

    if (locationType === 'pickup') {
      setValue('pickupLatitude', mockSelectedLocation.lat, { shouldValidate: true });
      setValue('pickupLongitude', mockSelectedLocation.lng, { shouldValidate: true });
      setValue('pickupAddress', mockSelectedLocation.address, { shouldValidate: true });
    } else {
      setValue('dropoffLatitude', mockSelectedLocation.lat, { shouldValidate: true });
      setValue('dropoffLongitude', mockSelectedLocation.lng, { shouldValidate: true });
      setValue('dropoffAddress', mockSelectedLocation.address, { shouldValidate: true });
    }
    toast({ title: "Location Selected (Mock)", description: `${mockSelectedLocation.address} set for ${locationType}.` });
  }, [setValue, toast]);


  const handleGetPriceEstimate = async () => {
    const allValid = await trigger([
        "pickupAddress", "pickupLatitude", "pickupLongitude",
        "dropoffAddress", "dropoffLatitude", "dropoffLongitude",
        "weightKg"
    ]);

    if (!allValid) {
      toast({ title: "Validation Error", description: "Please ensure all required fields, including map-selected locations, are filled correctly.", variant: "destructive" });
      return;
    }

    const values = getValues();
    const { pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, weightKg } = values;

    if (pickupLatitude == null || pickupLongitude == null || dropoffLatitude == null || dropoffLongitude == null || !weightKg ) {
      toast({
        title: "Missing Information",
        description: "Please ensure pickup/drop-off locations (selected via map) and weight are filled to get an estimate.",
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
  

  const onSubmit: SubmitHandler<BookTransportFormInputs> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    
    if (!priceEstimate || priceEstimate.estimatedPrice <= 0) {
      toast({ title: "Price Not Estimated", description: "Please get a valid price estimate before submitting.", variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        buyerId: currentUser.uid,
        goodsId: goodsId || null, 
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
        preferredPickupDate: data.preferredPickupDate || null,
        specialInstructions: data.specialInstructions || '',
        status: BookingStatus.PENDING,
        estimatedTransportCost: priceEstimate?.estimatedPrice || 0, 
        repayStatus: RepaymentStatus.NOT_APPLICABLE, 
        createdAt: new Date(),
        updatedAt: new Date(),
        actionLogs: [{
          timestamp: new Date(), 
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
      <Button variant="outline" onClick={() => router.back()} className="mb-6 group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            <Card className="shadow-lg border-border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center"><Truck className="mr-3 h-7 w-7 text-primary" /> Shipment Details</CardTitle>
                    <CardDescription>Enter details for your shipment. Fields marked * are required.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* From/To Section */}
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                        {/* From */}
                        <div className="flex-1 w-full">
                            <Label htmlFor="pickupAddress" className="flex items-center mb-1"><MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground"/>From*</Label>
                            <Input id="pickupAddress" {...register('pickupAddress')} placeholder="Pickup address (from map)" readOnly disabled={!!goodsId} />
                            <Button type="button" variant="outline" onClick={() => handleSelectOnMap('pickup')} className="w-full mt-2" disabled={!!goodsId}>
                                Select Pickup on Map
                            </Button>
                            {errors.pickupAddress && <p className="text-sm text-destructive mt-1">{errors.pickupAddress.message}</p>}
                        </div>
                        <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                        {/* To */}
                        <div className="flex-1 w-full">
                            <Label htmlFor="dropoffAddress" className="flex items-center mb-1"><MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground"/>To*</Label>
                            <Input id="dropoffAddress" {...register('dropoffAddress')} placeholder="Drop-off address (from map)" readOnly />
                            <Button type="button" variant="outline" onClick={() => handleSelectOnMap('dropoff')} className="w-full mt-2">
                                Select Drop-off on Map
                            </Button>
                            {errors.dropoffAddress && <p className="text-sm text-destructive mt-1">{errors.dropoffAddress.message}</p>}
                        </div>
                    </div>
                     <Separator />
                    {/* Goods Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                          <Label htmlFor="goodsType">Type/Description of Goods*</Label>
                          <Input id="goodsType" {...register('goodsType')} placeholder="e.g., Electronics, Furniture" disabled={!!goodsId && !!getValues("goodsType")} />
                          {errors.goodsType && <p className="text-sm text-destructive mt-1">{errors.goodsType.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="weightKg">Total Weight (kg)*</Label>
                          <Input id="weightKg" type="number" step="0.1" {...register('weightKg')} placeholder="e.g., 150.5" disabled={!!goodsId && getValues("weightKg") > 0} />
                          {errors.weightKg && <p className="text-sm text-destructive mt-1">{errors.weightKg.message}</p>}
                        </div>
                    </div>
                     <Separator />
                    {/* Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} 
                                    />
                                    </PopoverContent>
                                </Popover>
                                )}
                            />
                            {errors.preferredPickupDate && <p className="text-sm text-destructive mt-1">{errors.preferredPickupDate.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                          <Textarea id="specialInstructions" {...register('specialInstructions')} placeholder="e.g., Fragile items" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            </form>
        </div>

        {/* Right Sidebar - Summary & Actions */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg sticky top-24 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl">Quote & Summary</CardTitle>
                <CardDescription>Review your trip estimate below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button type="button" variant="secondary" onClick={handleGetPriceEstimate} disabled={isEstimatingPrice} className="w-full">
                  {isEstimatingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {priceEstimate ? 'Recalculate Price' : 'Calculate Price'}
                </Button>
                
                {isEstimatingPrice && (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-2 text-sm">Estimating your price...</p>
                    </div>
                )}
                
                {!isEstimatingPrice && !priceEstimate && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/50 rounded-lg">
                        <IndianRupee className="h-8 w-8 mb-2" />
                        <p className="text-sm">Click "Calculate Price" to see your transport estimate based on distance and weight.</p>
                    </div>
                )}

                {priceEstimate && (
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Estimated Price</span>
                        <span className="text-2xl font-bold text-primary">₹{priceEstimate.estimatedPrice.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                       <div className="flex justify-between items-center">
                            <span className="flex items-center text-muted-foreground"><Milestone className="mr-2 h-4 w-4"/> Distance</span>
                            <span className="font-semibold">{priceEstimate.distanceText || `${priceEstimate.distanceKm} km`}</span>
                       </div>
                        <div className="flex justify-between items-center">
                            <span className="flex items-center text-muted-foreground"><Clock className="mr-2 h-4 w-4"/> Est. Timeline</span>
                            <span className="font-semibold">{priceEstimate.durationText || `${priceEstimate.travelTimeHours} hours`}</span>
                       </div>
                    </div>
                    <CardDescription className="text-xs pt-2">
                        Breakdown: {priceEstimate.breakdown}
                    </CardDescription>
                  </div>
                )}

              </CardContent>
              <CardFooter>
                 <Button type="button" onClick={handleSubmit(onSubmit)} className="w-full" disabled={loading || isEstimatingPrice || !priceEstimate}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submit Booking
                </Button>
              </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}

