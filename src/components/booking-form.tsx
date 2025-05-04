
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPin, Package, Calendar, Clock, Truck, Building, Home, CircleDollarSign, Loader2, IndianRupee } from "lucide-react"; // Added IndianRupee

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { calculatePrice, type CalculatePriceInput, type CalculatePriceOutput } from "@/ai/flows/ai-powered-pricing";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar as ShadCalendar } from "@/components/ui/calendar"


// Define the form schema using Zod
const formSchema = z.object({
  pickupAddress: z.string().min(5, { message: "Pickup address must be at least 5 characters." }),
  destinationAddress: z.string().min(5, { message: "Destination address must be at least 5 characters." }),
  // Latitude/Longitude will be derived from addresses via geocoding in a real app
  // For demo purposes, we'll use example coordinates if geocoding isn't implemented.
  pickupLatitude: z.number().min(-90).max(90).optional(), // Made optional, will be set after geocoding
  pickupLongitude: z.number().min(-180).max(180).optional(), // Made optional
  destinationLatitude: z.number().min(-90).max(90).optional(), // Made optional
  destinationLongitude: z.number().min(-180).max(180).optional(), // Made optional
  goodsDescription: z.string().min(3, { message: "Please describe the goods." }),
  loadWeightKg: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  pickupDate: z.date({ required_error: "Pickup date is required." }),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
});

type FormData = z.infer<typeof formSchema>;

// Example coordinates (replace with actual geocoding results)
const EXAMPLE_COORDINATES = {
    delhi: { lat: 28.6139, lng: 77.2090 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
};

export function BookingForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [priceResult, setPriceResult] = React.useState<CalculatePriceOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickupAddress: "",
      destinationAddress: "",
      goodsDescription: "",
      loadWeightKg: undefined, // Use undefined for number inputs initially
      pickupDate: undefined,
      pickupTime: "09:00", // Default time
      // Lat/Lng are now optional in schema, will be determined before API call
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setPriceResult(null); // Clear previous results

    // --- Geocoding Step (Placeholder) ---
    // In a real application, you would use a geocoding service here
    // to convert `values.pickupAddress` and `values.destinationAddress`
    // into latitude and longitude coordinates.
    //
    // Example using placeholder coordinates for demo:
    const pickupCoords = {
        latitude: values.pickupLatitude ?? EXAMPLE_COORDINATES.delhi.lat,
        longitude: values.pickupLongitude ?? EXAMPLE_COORDINATES.delhi.lng,
    };
    const destinationCoords = {
        latitude: values.destinationLatitude ?? EXAMPLE_COORDINATES.mumbai.lat,
        longitude: values.destinationLongitude ?? EXAMPLE_COORDINATES.mumbai.lng,
    };
    console.log(
      `[Demo] Using coordinates - Pickup: ${pickupCoords.latitude}, ${pickupCoords.longitude} | Dest: ${destinationCoords.latitude}, ${destinationCoords.longitude}`
    );
    console.warn(
        "NOTE: These coordinates are examples (Delhi/Mumbai). Implement geocoding for real addresses."
    );
    // --- End Geocoding Placeholder ---


    // Prepare input for the AI function using (geocoded or example) coordinates
    const aiInput: CalculatePriceInput = {
      pickupLatitude: pickupCoords.latitude,
      pickupLongitude: pickupCoords.longitude,
      destinationLatitude: destinationCoords.latitude,
      destinationLongitude: destinationCoords.longitude,
      loadWeightKg: values.loadWeightKg,
    };

    try {
      const result = await calculatePrice(aiInput);
      setPriceResult(result);
      toast({
        title: "Price Estimated Successfully",
        description: result.estimatedPrice > 0
            ? `Estimated cost: ₹${result.estimatedPrice.toLocaleString('en-IN')}`
            : "Estimation failed, see details.",
        variant: result.estimatedPrice === 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Error calculating price:", error);
      // Displaying a more specific error might be useful if the AI returns error details
      const errorMessage = (error instanceof Error && error.message.includes("AI model failed"))
        ? "AI model failed to generate estimate. Please try again."
        : "Failed to estimate price. Please check details or try again later.";

      toast({
        variant: "destructive",
        title: "Error Estimating Price",
        description: errorMessage,
      });
       // Optionally set a default error state in priceResult
       setPriceResult({
           estimatedPrice: 0,
           breakdown: `Error: ${errorMessage}`,
           currency: "INR"
       });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Book Your Transport</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your shipment details for an AI-powered price estimate (Supports India locations).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Information */}
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4 text-secondary" /> Pickup Address (India)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Connaught Place, New Delhi" {...field} />
                    </FormControl>
                    <FormMessage />
                    {/* Add a note about geocoding */}
                     <FormDescription className="text-xs">
                        (Address is used to estimate coordinates for demo)
                     </FormDescription>
                  </FormItem>
                )}
              />

              {/* Destination Information */}
              <FormField
                control={form.control}
                name="destinationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-secondary" /> Destination Address (India)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 456 Marine Drive, Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                     <FormDescription className="text-xs">
                        (Address is used to estimate coordinates for demo)
                     </FormDescription>
                  </FormItem>
                )}
              />
            </div>

             {/* Goods Information */}
             <FormField
              control={form.control}
              name="goodsDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-secondary" /> Goods Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics shipment, textiles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Load Weight */}
              <FormField
                control={form.control}
                name="loadWeightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Truck className="mr-2 h-4 w-4 text-secondary" /> Load Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {/* Pickup Date */}
              <FormField
                  control={form.control}
                  name="pickupDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel className="flex items-center mb-1"><Calendar className="mr-2 h-4 w-4 text-secondary" /> Pickup Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <ShadCalendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pickup Time */}
                <FormField
                  control={form.control}
                  name="pickupTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Clock className="mr-2 h-4 w-4 text-secondary" /> Pickup Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>


            {/* Hidden Lat/Lng Fields - These are no longer used directly by the form submission */}
            {/* They are here just to satisfy the schema if needed, but values come from geocoding/defaults */}
             <FormField control={form.control} name="pickupLatitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="pickupLongitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="destinationLatitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="destinationLongitude" render={({ field }) => <Input type="hidden" {...field} />} />


            <Button type="submit" className="w-full bg-accent hover:bg-primary transition-colors duration-200" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Estimating Price...
                </>
              ) : (
                <>
                 <IndianRupee className="mr-2 h-4 w-4" /> Get Price Estimate (INR)
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {priceResult && (
        <CardFooter className="flex flex-col items-start space-y-4 mt-6 border-t pt-6">
           <h3 className="text-lg font-semibold text-primary">Price Estimate Result</h3>
           <div className="w-full p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <p className={`text-2xl font-bold mb-2 ${priceResult.estimatedPrice <= 0 ? 'text-destructive' : 'text-accent'}`}> {/* Check for <= 0 */}
                 {priceResult.estimatedPrice > 0
                    ? `₹${priceResult.estimatedPrice.toLocaleString('en-IN')}`
                    : "Estimate Unavailable"} {/* Adjusted message */}
              </p>
              <Separator className="my-2 bg-secondary/30" />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap"> {/* Allow line breaks in breakdown */}
                <strong className="text-foreground">Details:</strong> {priceResult.breakdown} {/* Changed label to Details */}
              </p>
           </div>
            <p className="text-xs text-muted-foreground italic text-center w-full">
              Note: This is an estimate for transport within India based on provided details and standard assumptions. Real-world factors may influence the final price.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}

