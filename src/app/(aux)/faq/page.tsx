// src/app/(aux)/faq/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How do I book a transport service?",
    answer: "You can book a transport service through our marketplace. Find the goods you want to transport or directly go to the 'Book Transport' section. You'll need to provide pickup and drop-off details, goods information, and preferred vehicle type. An estimated price will be shown before you confirm."
  },
  {
    question: "How is the transport cost calculated?",
    answer: "Transport cost is estimated based on factors like distance (using Google Distance Matrix API), load weight, vehicle type, and current (mock) fuel prices. Our AI-powered pricing model provides this estimate. The final cost may vary based on specific conditions."
  },
  {
    question: "Can I list my goods for sale?",
    answer: "Yes! If you are registered as a 'Buyer/Seller', you can list your goods on our marketplace. You'll need to provide details like product name, category, price, quantity, description, and pickup location."
  },
  {
    question: "What types of vehicles are available?",
    answer: `We support a range of vehicle types, including Mini Trucks (e.g., Tata Ace), Tempos, Light Commercial Vehicles (LCVs), Medium and Heavy Duty Trucks, Container Trucks, and more. You can select the appropriate vehicle type during booking.`
  },
  {
    question: "How do I become a transport owner on FuelFlex?",
    answer: "During registration, you can choose the 'Transport Owner' role. This will give you access to the transport owner dashboard where you can manage your fleet (this feature currently shows mock vehicle location, fuel levels, and FASTag balance)."
  },
  {
    question: "Is live vehicle tracking available?",
    answer: "Live vehicle tracking using Google Maps is a planned feature. Currently, the transport owner dashboard shows mock location data. Real-time updates will be integrated in the future."
  },
  {
    question: "What payment methods are supported?",
    answer: "Integration with UPI and Stripe for booking fees and fuel credit repayments is planned. Currently, payment gateway functionality is not live."
  },
  {
    question: "How does the fuel credit system work?",
    answer: "The fuel credit system is a planned feature for transport providers. Details on eligibility, repayment terms, and automated reminders via Firebase Cloud Functions will be available upon launch."
  },
  {
    question: "Where can I see my listed goods or past bookings?",
    answer: "If you are registered as a Buyer/Seller, your listed goods and booking history will be available in your user profile section or a dedicated 'My Bookings' / 'My Listings' page (planned feature)."
  },
  {
    question: "What if I forget my password?",
    answer: "On the login page, there is a 'Forgot Password?' link. Click on it and follow the instructions to reset your password via email."
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Link href="/" legacyBehavior>
        <Button variant="outline" className="mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Button>
      </Link>
      <Card className="shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">Frequently Asked Questions</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Find answers to common questions about FuelFlex.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-b last:border-b-0">
                <AccordionTrigger className="text-left hover:no-underline text-md font-medium py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
       <div className="mt-12 text-center">
        <p className="text-muted-foreground">Can&apos;t find your answer or need more help?</p>
        <Link href="/contact" passHref legacyBehavior>
          <Button variant="link" className="text-lg text-primary hover:underline">Contact Our Support Team</Button>
        </Link>
      </div>
    </div>
  );
}
```