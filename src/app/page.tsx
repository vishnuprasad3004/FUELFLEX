
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Truck, Package, IndianRupee, Clock } from "lucide-react";
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4 md:p-8 bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto text-center py-12 md:py-24">
        <Image 
          src="https://picsum.photos/seed/fuelflexlogo/150/150" 
          alt="FuelFlex Platform Logo" 
          width={120} 
          height={120} 
          className="mx-auto mb-6 rounded-full shadow-lg"
          data-ai-hint="transportation logo"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Welcome to FuelFlex Transport
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your smart solution for efficient goods transportation across India. Get AI-powered price estimates, book services, and manage your logistics seamlessly.
        </p>
        <Link href="/book-transport" passHref>
          <Button size="lg" className="bg-accent hover:bg-primary text-accent-foreground transition-colors duration-200 text-lg px-8 py-6">
            Book Your Transport Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 mb-12">
        <FeatureCard
          icon={<Truck className="h-8 w-8 text-primary" />}
          title="Reliable Fleet"
          description="Access a wide range of vehicles suitable for all your transport needs."
        />
        <FeatureCard
          icon={<IndianRupee className="h-8 w-8 text-primary" />}
          title="AI-Powered Pricing"
          description="Get transparent and competitive price estimates instantly."
        />
        <FeatureCard
          icon={<Package className="h-8 w-8 text-primary" />}
          title="Secure Goods Handling"
          description="We ensure your goods are transported safely and securely."
        />
        <FeatureCard
          icon={<Clock className="h-8 w-8 text-primary" />}
          title="Timely Deliveries"
          description="Efficient logistics for on-time delivery of your consignments."
        />
      </div>
       <div className="container mx-auto text-center mt-8">
          <Image
            src="https://picsum.photos/seed/indiantrucks/800/300"
            alt="Illustration of trucks on Indian highways"
            width={800}
            height={300}
            className="mx-auto rounded-lg shadow-md opacity-80"
            data-ai-hint="Indian highway trucks"
          />
        </div>
    </main>
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
