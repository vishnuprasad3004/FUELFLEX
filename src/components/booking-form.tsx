"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPin, Package, Calendar, Clock, Truck, Building, Home, CircleDollarSign, Loader2 } from "lucide-react";

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
  // Mocking lat/lng for now. In a real app, these would likely be derived from addresses via a geocoding service.
  pickupLatitude: z.number().min(-90).max(90).default(40.7128), // Example: New York City Latitude
  pickupLongitude: z.number().min(-180).max(180).default(-74.0060), // Example: New York City Longitude
  destinationLatitude: z.number().min(-90).max(90).default(34.0522), // Example: Los Angeles Latitude
  destinationLongitude: z.number().min(-180).max(180).default(-118.2437), // Example: Los Angeles Longitude
  goodsDescription: z.string().min(3, { message: "Please describe the goods." }),
  loadWeightKg: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  pickupDate: z.date({ required_error: "Pickup date is required." }),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
});

type FormData = z.infer<typeof formSchema>;

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
      pickupTime: "09:00", // Default time
      // Lat/Lng defaults are set in the schema
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setPriceResult(null); // Clear previous results

    // Prepare input for the AI function
    const aiInput: CalculatePriceInput = {
      pickupLatitude: values.pickupLatitude,
      pickupLongitude: values.pickupLongitude,
      destinationLatitude: values.destinationLatitude,
      destinationLongitude: values.destinationLongitude,
      loadWeightKg: values.loadWeightKg,
    };

    try {
      const result = await calculatePrice(aiInput);
      setPriceResult(result);
      toast({
        title: "Price Estimated Successfully",
        description: `Estimated cost: $${result.estimatedPrice.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Error calculating price:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to estimate price. Please check the details and try again.",
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
          Enter your shipment details to get an AI-powered price estimate.
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
                    <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-secondary" /> Pickup Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destination Information */}
              <FormField
                control={form.control}
                name="destinationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-secondary" /> Destination Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 456 Oak Ave, Othercity, USA" {...field} />
                    </FormControl>
                    <FormMessage />
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
                    <Input placeholder="e.g., Pallet of widgets, furniture" {...field} />
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
                      <Input type="number" placeholder="e.g., 500" {...field} />
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


            {/* Hidden Lat/Lng Fields (for demo) */}
            {/* In a real app, you'd likely use a Geocoding API here */}
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
                 <CircleDollarSign className="mr-2 h-4 w-4" /> Get Price Estimate
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
              <p className="text-2xl font-bold text-accent mb-2">
                ${priceResult.estimatedPrice.toFixed(2)}
              </p>
              <Separator className="my-2 bg-secondary/30" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Breakdown:</strong> {priceResult.breakdown}
              </p>
           </div>
            <p className="text-xs text-muted-foreground italic text-center w-full">
              Note: This is an estimate. Final price may vary. Fuel cost will be charged separately with interest upon repayment.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
