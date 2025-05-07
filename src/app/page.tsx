'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Truck, Package, IndianRupee, Clock, Search, ThumbsUp, ShieldCheck, Cpu, AppleIcon, TvIcon, ShirtIcon, SofaIcon, ShoppingBasket } from "lucide-react";
import Image from 'next/image';
import { useAuthRedirect } from '@/hooks/use-auth-redirect'; // For potential redirection if user is logged in
import { useAuth } from '@/components/auth/auth-provider';

const categories = [
  { name: "Electronics", icon: <Cpu className="h-8 w-8 text-primary" />, description: "Ship TVs, computers, and more.", dataAiHint: "electronics shipping" },
  { name: "Groceries & Produce", icon: <ShoppingBasket className="h-8 w-8 text-primary" />, description: "Fresh produce, packaged goods.", dataAiHint: "grocery delivery" },
  { name: "Furniture", icon: <SofaIcon className="h-8 w-8 text-primary" />, description: "Sofas, tables, and large items.", dataAiHint: "furniture transport" },
  { name: "Fashion & Apparel", icon: <ShirtIcon className="h-8 w-8 text-primary" />, description: "Clothing, textiles, accessories.", dataAiHint: "apparel logistics" },
];

const features = [
  { name: "Wide Reach", icon: <Truck className="h-6 w-6 text-primary" />, description: "Transport goods across all India." },
  { name: "Secure Packaging", icon: <Package className="h-6 w-6 text-primary" />, description: "Ensuring your items are safe." },
  { name: "Transparent Pricing", icon: <IndianRupee className="h-6 w-6 text-primary" />, description: "Get upfront cost estimates." },
  { name: "Timely Delivery", icon: <Clock className="h-6 w-6 text-primary" />, description: "Reliable and punctual services." },
];

export default function Home() {
  useAuthRedirect(); // Basic redirect if already logged in, might need customization
  const { currentUser, isBuyerSeller } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/80 via-primary to-secondary/70 text-primary-foreground py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Reliable Goods Transport Across India
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Book transport for electronics, groceries, furniture, and more with FuelFlex. Easy, fast, and secure.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={currentUser && isBuyerSeller ? "/marketplace/book-transport" : "/create-account"} passHref legacyBehavior>
              <Button size="lg" className="bg-background text-primary hover:bg-background/90 shadow-lg">
                Book a Transport <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/marketplace" passHref legacyBehavior>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 shadow-lg">
                Browse Goods <Search className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How FuelFlex Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">1. Find or List Goods</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Sellers list their items. Buyers browse and find what they need.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Truck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">2. Book Transport</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Provide pickup & drop-off details, get a price estimate, and book.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <ThumbsUp className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">3. Secure Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track your shipment and receive it safely at your destination.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Transport Anything, Anywhere</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={`/marketplace?category=${encodeURIComponent(category.name)}`} passHref>
                <Card className="group hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                  <CardHeader className="items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full transition-transform group-hover:scale-110">
                      {category.icon}
                    </div>
                    <CardTitle className="mt-4 text-xl">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  </CardContent>
                  <div className="p-4 text-center">
                    <Button variant="link" className="text-primary">
                      Browse {category.name} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Image Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Your Trusted Logistics Partner</h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
                From small parcels to large consignments, we handle it all with care and precision.
            </p>
            <Image 
              src="https://picsum.photos/seed/logistics-banner/1200/400" 
              alt="Logistics Network" 
              width={1200} 
              height={400} 
              className="rounded-lg shadow-xl mx-auto"
              data-ai-hint="logistics network" 
            />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FuelFlex?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-center text-center p-4 rounded-lg bg-primary/80 hover:bg-primary/70 transition-colors">
                <div className="p-3 bg-background rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                <p className="text-sm opacity-90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Ship or Sell?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of users who trust FuelFlex for their goods transport and marketplace needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
             <Link href={currentUser ? (isBuyerSeller ? "/marketplace/book-transport" : "/create-account?role=buyer_seller") : "/create-account"} passHref legacyBehavior>
              <Button size="lg" className="shadow-lg">
                Get Started as Buyer/Seller <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={currentUser ? (isBuyerSeller ? "/transport-owner/dashboard" : "/create-account?role=transport_owner") : "/create-account"} passHref legacyBehavior>
              <Button size="lg" variant="outline" className="shadow-lg">
                Join as Transport Owner <Truck className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <Image src="/logo.png" alt="FuelFlex Logo" width={50} height={50} className="mx-auto mb-4 filter grayscale brightness-200" data-ai-hint="logo transport dark"/>
          <p>&copy; {new Date().getFullYear()} FuelFlex Transport. All rights reserved.</p>
          <p className="text-sm mt-2">Your reliable partner for nationwide goods transport and fuel credit solutions.</p>
          <div className="mt-4 space-x-4">
            <Link href="/terms" className="hover:text-gray-200">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-200">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-200">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
