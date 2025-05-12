
'use client';
import React from 'react'; // Added React import
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Truck, Package, IndianRupee, Clock, Search, ThumbsUp, Cpu, ShoppingBasket, SofaIcon, ShirtIcon, PlusCircle } from "lucide-react"; 
import Image from 'next/image';
import { useAuthRedirect } from '@/hooks/use-auth-redirect'; 
import { useAuth } from '@/components/auth/auth-provider';

const categories = [
  { name: "Electronics", icon: <Cpu className="h-8 w-8 text-primary" />, description: "Ship TVs, computers, and more.", dataAiHint: "electronics shipping" },
  { name: "Groceries & Produce", icon: <ShoppingBasket className="h-8 w-8 text-primary" />, description: "Fresh produce, packaged goods.", dataAiHint: "grocery delivery" },
  { name: "Furniture", icon: <SofaIcon className="h-8 w-8 text-primary" />, description: "Sofas, tables, and large items.", dataAiHint: "furniture transport" },
  { name: "Fashion & Apparel", icon: <ShirtIcon className="h-8 w-8 text-primary" />, description: "Clothing, textiles, accessories.", dataAiHint: "apparel logistics" },
];

const features = [
  { name: "Wide Reach", icon: <Truck className="h-6 w-6 text-accent" />, description: "Transport goods across all India." },
  { name: "Secure Packaging", icon: <Package className="h-6 w-6 text-accent" />, description: "Ensuring your items are safe." },
  { name: "Transparent Pricing", icon: <IndianRupee className="h-6 w-6 text-accent" />, description: "Get upfront cost estimates." },
  { name: "Timely Delivery", icon: <Clock className="h-6 w-6 text-accent" />, description: "Reliable and punctual services." },
];

export default function Home() {
  useAuthRedirect(); 
  const { currentUser, isBuyerSeller, isTransportOwner } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Hero Section */}
      <section className="relative text-primary-foreground py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <Image 
                src="https://picsum.photos/seed/hero-transport/1920/1080" 
                alt="Busy logistics hub with trucks and packages" 
                layout="fill" 
                objectFit="cover" 
                className="opacity-30"
                data-ai-hint="logistics hub"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/50 to-primary/30"></div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-xl text-white">
            FuelFlex: Your Goods, Delivered.
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-primary-foreground/95 leading-relaxed">
            Seamlessly transport electronics, groceries, furniture, and more across India. Experience reliable, fast, and secure logistics with AI-powered pricing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href={currentUser && isBuyerSeller ? "/marketplace/book-transport" : "/create-account"} passHref legacyBehavior>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl text-lg py-3 px-8 rounded-full transform hover:scale-105 transition-transform duration-300">
                Book a Transport <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/marketplace" passHref legacyBehavior>
              <Button size="lg" variant="secondary" className="shadow-xl text-secondary-foreground hover:bg-secondary/80 text-lg py-3 px-8 rounded-full transform hover:scale-105 transition-transform duration-300">
                Explore Marketplace <Search className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground tracking-tight">Streamlined Logistics in 3 Easy Steps</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {[
              { icon: <Search className="h-12 w-12 text-primary" />, title: "1. Find or List Goods", description: "Sellers list their items with ease. Buyers browse a diverse marketplace to find exactly what they need for transport." },
              { icon: <Truck className="h-12 w-12 text-primary" />, title: "2. Book Transport Instantly", description: "Provide pickup & drop-off details, get a transparent AI-powered price estimate, and confirm your booking in minutes." },
              { icon: <ThumbsUp className="h-12 w-12 text-primary" />, title: "3. Secure & Timely Delivery", description: "Relax as your goods are handled by trusted transporters. Track your shipment and receive it safely at your destination." },
            ].map((step, index) => (
              <Card key={index} className="shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-2 border-primary/20 rounded-xl">
                <CardHeader className="items-center">
                  <div className="mx-auto bg-primary/10 rounded-full p-5 w-fit ring-4 ring-primary/20 mb-4 transition-transform duration-300 hover:scale-110">
                    {step.icon}
                  </div>
                  <CardTitle className="mt-2 text-2xl font-semibold text-foreground">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground tracking-tight">Transport Anything, Anywhere in India</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link key={category.name} href={`/marketplace?category=${encodeURIComponent(category.name)}`} passHref legacyBehavior>
                <Card className="group hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer h-full flex flex-col bg-card transform hover:scale-105 border-border hover:border-primary/50 rounded-xl overflow-hidden">
                  <CardHeader className="items-center text-center p-6 bg-primary/5">
                    <div className="p-5 bg-primary/10 rounded-full transition-transform group-hover:scale-110 ring-4 ring-primary/20 group-hover:ring-primary/40">
                      {category.icon}
                    </div>
                    <CardTitle className="mt-5 text-xl font-semibold text-foreground">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow p-6">
                    <p className="text-muted-foreground text-sm leading-relaxed">{category.description}</p>
                  </CardContent>
                  <div className="p-6 text-center mt-auto bg-muted/30">
                    <Button variant="link" className="text-primary font-semibold group-hover:underline text-base">
                      Browse {category.name} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Image Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8 text-foreground tracking-tight">Your Trusted Logistics Partner</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
                From small parcels to large consignments, FuelFlex ensures your goods are handled with utmost care, efficiency, and precision across the nation.
            </p>
            <div className="rounded-xl shadow-2xl overflow-hidden mx-auto max-w-5xl border-4 border-primary/30 transform hover:scale-102 transition-transform duration-500">
              <Image 
                src="https://picsum.photos/seed/logistics-map-india/1200/500" 
                alt="Vibrant map of India with interconnected logistics routes and trucks" 
                width={1200} 
                height={500} 
                className="w-full h-auto"
                data-ai-hint="logistics india map" 
                priority
              />
            </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary/90 to-accent/70 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 tracking-tight">Why Choose FuelFlex?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-center text-center p-8 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-300 shadow-xl transform hover:scale-105">
                <div className="p-4 bg-accent rounded-full mb-5 ring-4 ring-accent/50 transition-transform duration-300 hover:rotate-12">
                  {React.cloneElement(feature.icon, { className: "h-10 w-10 text-accent-foreground" })}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.name}</h3>
                <p className="text-sm opacity-95 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground tracking-tight">Ready to Ship or Sell with FuelFlex?</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            Join thousands of satisfied users who trust FuelFlex for their goods transport and marketplace needs. Get started today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
             <Link href={currentUser ? (isBuyerSeller ? "/marketplace/list-good" : "/create-account?role=buyer_seller") : "/create-account?role=buyer_seller"} passHref legacyBehavior>
              <Button size="lg" className="shadow-xl bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-3 px-8 rounded-full transform hover:scale-105 transition-transform duration-300">
                 <PlusCircle className="mr-3 h-5 w-5" /> List / Buy Goods
              </Button>
            </Link>
            <Link href={currentUser ? (isTransportOwner ? "/transport-owner/dashboard" : "/create-account?role=transport_owner") : "/create-account?role=transport_owner"} passHref legacyBehavior>
              <Button size="lg" variant="outline" className="shadow-xl border-primary text-primary hover:bg-primary/10 text-lg py-3 px-8 rounded-full transform hover:scale-105 transition-transform duration-300">
                Join as Transport Owner <Truck className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 border-t-4 border-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="FuelFlex Logo" width={60} height={60} className="rounded-md shadow-lg" data-ai-hint="logo transport white"/>
          </div>
          <p className="font-semibold text-2xl mb-2 text-white">FuelFlex Transport</p>
          <p className="text-sm mt-2 opacity-90 max-w-md mx-auto leading-relaxed">Your reliable partner for nationwide goods transport and innovative fuel credit solutions. Powering India's logistics, one delivery at a time.</p>
          <div className="mt-8 space-x-6 text-sm">
            <Link href="/terms" className="hover:text-accent-foreground hover:underline transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-accent-foreground hover:underline transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-accent-foreground hover:underline transition-colors">Contact Us</Link>
            <Link href="/faq" className="hover:text-accent-foreground hover:underline transition-colors">FAQ</Link>
          </div>
           <p className="text-xs mt-10 opacity-70">&copy; {new Date().getFullYear()} FuelFlex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
