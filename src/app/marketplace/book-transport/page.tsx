'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Truck, Send, ArrowLeft, CalendarIcon, MapPinIcon } from 'lucide-react';
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
import { cn } from "@/lib/utils"; 
import { calculatePrice, type CalculatePriceInput, type CalculatePriceOutput } from '@/ai/flows/ai-powered-pricing';


const bookTransportSchema = z.object({
  // Pickup (could be from Goods or manual)
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupLatitude: z.number().optional(), 
  pickupLongitude: z.number().optional(),
  
  // Drop-off
  dropoffAddress: z.string().min(5, "Drop-off address is required"),
  dropoffLatitude: z.number({required_error: "Drop-off latitude is required from map selection.", invalid_type_error: "Drop-off latitude must be a number"}).min(-90).max(90),
  dropoffLongitude: z.number({required_error: "Drop-off longitude is required from map selection.", invalid_type_error: "Drop-off longitude must be a number"}).min(-180).max(180),

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

// Placeholder for a Map Modal component (not implemented in this step)
// interface MapModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onLocationSelect: (coords: { lat: number; lng: number; address: string }) => void;
//   initialAddress?: string;
// }
// const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, onLocationSelect, initialAddress }) => {
//   if (!isOpen) return null;
//   // This would contain the actual map implementation (e.g., Google Maps, Leaflet)
//   return (
//     <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '80%', maxWidth: '600px' }}>
//         <h2>Select Location on Map</h2>
//         <p>Map component would be here. For now, using placeholder coordinates.</p>
//         <input type="text" placeholder="Search address or pick on map" defaultValue={initialAddress} />
//         {/* Simulate selecting a location */}
//         <Button onClick={() => onLocationSelect({ lat: 19.0760, lng: 72.8777, address: "Mumbai, Maharashtra, India (Mock)" })}>Select Mumbai (Mock)</Button>
//         <Button onClick={onClose} style={{ marginLeft: '10px' }}>Close</Button>
//       </div>
//     </div>
//   );
// };


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

  // Map Modal State
  const [isPickupMapOpen, setIsPickupMapOpen] = useState(false);
  const [isDropoffMapOpen, setIsDropoffMapOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
    reset,
    trigger, // To manually trigger validation
  } = useForm<BookTransportFormInputs>({
    resolver: zodResolver(bookTransportSchema),
  });

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
            // Trigger validation for potentially pre-filled fields
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
    // This is where you would open a map modal or navigate to a map selection page.
    // For this example, we'll simulate selecting a location and setting values.
    // In a real app, `MapModal` component would be used here.
    
    const mockSelectedLocation = {
        lat: locationType === 'dropoff' ? 19.0760 : 28.6139, // Mumbai for dropoff, Delhi for pickup (mock)
        lng: locationType === 'dropoff' ? 72.8777 : 77.2090,
        address: locationType === 'dropoff' ? "Mumbai Central, Mumbai, Maharashtra (Mock)" : "Connaught Place, New Delhi, Delhi (Mock)",
    };

    if (locationType === 'pickup') {
      setValue('pickupLatitude', mockSelectedLocation.lat, { shouldValidate: true });
      setValue('pickupLongitude', mockSelectedLocation.lng, { shouldValidate: true });
      setValue('pickupAddress', mockSelectedLocation.address); // Update address field too
      setIsPickupMapOpen(false);
    } else {
      setValue('dropoffLatitude', mockSelectedLocation.lat, { shouldValidate: true });
      setValue('dropoffLongitude', mockSelectedLocation.lng, { shouldValidate: true });
      setValue('dropoffAddress', mockSelectedLocation.address); // Update address field too
      setIsDropoffMapOpen(false);
    }
    toast({ title: "Location Selected (Mock)", description: `${mockSelectedLocation.address} set for ${locationType}.` });
  }, [setValue, toast]);


  const handleGetPriceEstimate = async () => {
    // Ensure lat/lng are validated before estimating
    const isValidPickupLat = await trigger("pickupLatitude");
    const isValidPickupLng = await trigger("pickupLongitude");
    const isValidDropoffLat = await trigger("dropoffLatitude");
    const isValidDropoffLng = await trigger("dropoffLongitude");

    if (!isValidPickupLat || !isValidPickupLng || !isValidDropoffLat || !isValidDropoffLng) {
      toast({ title: "Validation Error", description: "Please ensure pickup and drop-off locations are selected correctly.", variant: "destructive" });
      return;
    }

    const values = getValues();
    const { pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, weightKg, vehicleType } = values;

    if (pickupLatitude == null || pickupLongitude == null || dropoffLatitude == null || dropoffLongitude == null || !weightKg || !vehicleType) {
      toast({
        title: "Missing Information",
        description: "Please ensure pickup/drop-off locations (selected via map), weight, and vehicle type are filled to get an estimate.",
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
  

  const onSubmit: SubmitHandler<BookTransportFormInputs> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    
    // Crucial: Ensure coordinates are set. They are required by the schema.
    // If a map module is used, it must populate these values.
    if (data.pickupLatitude == null || data.pickupLongitude == null) {
        toast({title: "Pickup Location Incomplete", description: "Pickup coordinates are missing. Please select the pickup location on the map.", variant: "warning"});
        return; 
    }
    if (data.dropoffLatitude == null || data.dropoffLongitude == null) {
        toast({title: "Drop-off Location Incomplete", description: "Drop-off coordinates are missing. Please select the drop-off location on the map.", variant: "warning"});
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
        vehicleType: data.vehicleType as BookingVehicleType,
        preferredPickupDate: data.preferredPickupDate || null,
        specialInstructions: data.specialInstructions || '',
        status: BookingStatus.PENDING,
        estimatedTransportCost: priceEstimate?.estimatedPrice || 0, 
        repayStatus: RepaymentStatus.NOT_APPLICABLE, 
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
          <CardDescription>Enter details for your shipment. Locations are selected via map. Fields marked * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Pickup Section */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-1">Pickup Details</legend>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="pickupAddress">Pickup Address*</Label>
                  <Input id="pickupAddress" {...register('pickupAddress')} placeholder="Type address or select on map" disabled={!!goodsId && !!getValues("pickupAddress")} />
                  {errors.pickupAddress && <p className="text-sm text-destructive mt-1">{errors.pickupAddress.message}</p>}
                </div>
                 {/* Hidden fields for pickup lat/lng, populated by map or pre-filled */}
                <input type="hidden" {...register('pickupLatitude')} />
                <input type="hidden" {...register('pickupLongitude')} />
                {errors.pickupLatitude && <p className="text-sm text-destructive mt-1">{errors.pickupLatitude.message}</p>}
                {errors.pickupLongitude && <p className="text-sm text-destructive mt-1">{errors.pickupLongitude.message}</p>}
                
                {/* Only show "Select on Map" for pickup if not pre-filled from a good */}
                {(!goodsId || !getValues("pickupLatitude")) && (
                    <Button type="button" variant="outline" onClick={() => handleSelectOnMap('pickup')} className="w-full">
                        <MapPinIcon className="mr-2 h-4 w-4" /> Select Pickup on Map (Mock)
                    </Button>
                )}
                {getValues("pickupLatitude") && getValues("pickupLongitude") && (
                    <p className="text-xs text-muted-foreground">Pickup Coordinates: Lat: {getValues("pickupLatitude")?.toFixed(4)}, Lng: {getValues("pickupLongitude")?.toFixed(4)}</p>
                )}
              </div>
            </fieldset>

            {/* Drop-off Section */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-1">Drop-off Details</legend>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="dropoffAddress">Drop-off Address*</Label>
                  <Input id="dropoffAddress" {...register('dropoffAddress')} placeholder="Type address or select on map" />
                  {errors.dropoffAddress && <p className="text-sm text-destructive mt-1">{errors.dropoffAddress.message}</p>}
                </div>
                {/* Hidden fields for lat/lng, will be populated by map selection */}
                <input type="hidden" {...register('dropoffLatitude')} />
                <input type="hidden" {...register('dropoffLongitude')} />
                {errors.dropoffLatitude && <p className="text-sm text-destructive mt-1">{errors.dropoffLatitude.message}</p>}
                {errors.dropoffLongitude && <p className="text-sm text-destructive mt-1">{errors.dropoffLongitude.message}</p>}

                <Button type="button" variant="outline" onClick={() => handleSelectOnMap('dropoff')} className="w-full">
                  <MapPinIcon className="mr-2 h-4 w-4" /> Select Drop-off on Map (Mock)
                </Button>
                {getValues("dropoffLatitude") && getValues("dropoffLongitude") && (
                    <p className="text-xs text-muted-foreground">Drop-off Coordinates: Lat: {getValues("dropoffLatitude")?.toFixed(4)}, Lng: {getValues("dropoffLongitude")?.toFixed(4)}</p>
                )}
              </div>
            </fieldset>
            
            {/* Goods Details Section */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-1">Goods Details</legend>
              <div className="space-y-4 mt-2">
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

      {/* Placeholder for Map Modal - in a real app this would be a proper component */}
      {/* <MapModal 
        isOpen={isPickupMapOpen || isDropoffMapOpen}
        onClose={() => { setIsPickupMapOpen(false); setIsDropoffMapOpen(false); }}
        onLocationSelect={(loc) => handleSelectOnMap(isPickupMapOpen ? 'pickup' : 'dropoff', loc)}
        initialAddress={isPickupMapOpen ? getValues("pickupAddress") : getValues("dropoffAddress")}
      /> */}

    </div>
  );
}

