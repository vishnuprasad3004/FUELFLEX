
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Truck, Package, IndianRupee, Clock, Search, ThumbsUp, ShieldCheck, Cpu, Apple, Armchair, ShoppingBasket } from "lucide-react"; // Changed Couch to Armchair
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-background to-secondary/10">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-primary/5">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
              Ship Anything, Anywhere in India
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Fast, reliable, and AI-powered goods transport for electronics, groceries, furniture, and more. Get instant quotes and book with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-transport" passHref>
                <Button size="lg" className="bg-accent hover:bg-primary text-accent-foreground transition-colors duration-200 text-lg px-8 py-6 w-full sm:w-auto">
                  <Truck className="mr-2 h-5 w-5" /> Get Instant Quote
                </Button>
              </Link>
              <Link href="#how-it-works" passHref>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <Image
            src="https://picsum.photos/seed/logisticsHero/1200/400"
            alt="Busy logistics hub with trucks and packages"
            width={1200}
            height={400}
            className="mx-auto mt-10 rounded-lg shadow-xl object-cover"
            data-ai-hint="logistics hub"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">What Can You Ship?</h2>
            <p className="mt-2 text-lg text-muted-foreground">We transport a wide variety of goods across India.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <CategoryCard
              icon={<Cpu className="h-10 w-10 text-primary" />}
              title="Electronics & Appliances"
              description="Secure transport for TVs, computers, washing machines, and more."
              imageUrl="https://picsum.photos/seed/electronicsCategory/400/300"
              imageHint="electronics gadgets"
            />
            <CategoryCard
              icon={<ShoppingBasket className="h-10 w-10 text-primary" />}
              title="Groceries & Agri-Produce"
              description="Reliable delivery for bulk rice, grains, packaged foods, and fresh produce."
              imageUrl="https://picsum.photos/seed/groceriesCategory/400/300"
              imageHint="grocery items"
            />
            <CategoryCard
              icon={<Armchair className="h-10 w-10 text-primary" />} 
              title="Furniture & Home Goods"
              description="Careful handling of sofas, beds, tables, and other household items."
              imageUrl="https://picsum.photos/seed/furnitureCategory/400/300"
              imageHint="modern furniture"
            />
            <CategoryCard
              icon={<Package className="h-10 w-10 text-primary" />}
              title="General Merchandise & More"
              description="Books, textiles, industrial parts - if it fits, we can ship it."
              imageUrl="https://picsum.photos/seed/generalCategory/400/300"
              imageHint="assorted packages"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-12 md:py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Easy Booking in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <HowItWorksStep
              stepNumber="1"
              icon={<Search className="h-8 w-8 text-accent" />}
              title="Enter Your Details"
              description="Provide pickup/drop locations, goods type, weight, and preferred vehicle."
            />
            <HowItWorksStep
              stepNumber="2"
              icon={<IndianRupee className="h-8 w-8 text-accent" />}
              title="Get AI-Powered Quote"
              description="Receive an instant, transparent price estimate based on your requirements."
            />
            <HowItWorksStep
              stepNumber="3"
              icon={<Truck className="h-8 w-8 text-accent" />}
              title="Book & Track"
              description="Confirm your booking and track your shipment in real-time (tracking coming soon)."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Why Choose FuelFlex?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                icon={<ThumbsUp className="h-8 w-8 text-primary" />}
                title="Reliable Fleet"
                description="Access a wide range of verified vehicles suitable for all your transport needs."
                />
                <FeatureCard
                icon={<Cpu className="h-8 w-8 text-primary" />}
                title="AI-Powered Pricing"
                description="Get transparent and competitive price estimates instantly with our smart algorithms."
                />
                <FeatureCard
                icon={<ShieldCheck className="h-8 w-8 text-primary" />}
                title="Secure Goods Handling"
                description="We prioritize safety, ensuring your goods are transported securely."
                />
                <FeatureCard
                icon={<Clock className="h-8 w-8 text-primary" />}
                title="Efficient Logistics"
                description="Optimized routes and processes for timely delivery of your consignments."
                />
            </div>
        </div>
      </section>
    </main>
  );
}

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

function CategoryCard({ icon, title, description, imageUrl, imageHint }: CategoryCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Image 
        src={imageUrl} 
        alt={title} 
        width={400} 
        height={200} 
        className="w-full h-40 object-cover"
        data-ai-hint={imageHint}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
          <CardTitle className="text-xl text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Link href="/book-transport" passHref>
            <Button variant="outline" className="w-full">Book Now <ArrowRight className="ml-2 h-4 w-4"/></Button>
        </Link>
      </div>
    </Card>
  );
}

interface HowItWorksStepProps {
  stepNumber: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function HowItWorksStep({ stepNumber, icon, title, description }: HowItWorksStepProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md border border-border">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary text-primary-foreground">
        <span className="text-2xl font-bold">{stepNumber}</span>
      </div>
       <div className="mb-3 text-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-primary">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
          {icon}
        </div>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
