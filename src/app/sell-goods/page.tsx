
import { SellGoodsForm } from "@/components/sell-goods-form";
import { Separator } from "@/components/ui/separator";
import { Coins, ListChecks, PackagePlus, ShoppingCart, Store } from "lucide-react";

export default function SellGoodsPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-start p-4 md:p-8 bg-gradient-to-br from-background to-secondary/10">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center mb-8">
          <Store className="mx-auto h-12 w-12 text-primary mb-3" />
          <h1 className="text-3xl font-bold text-primary">List Your Goods</h1>
          <p className="text-muted-foreground">
            Fill in the details below to make your products available to buyers across India.
          </p>
        </div>
        
        <SellGoodsForm />

        <Separator className="my-12" />

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <PackagePlus className="h-7 w-7 text-accent" />
              <h3 className="text-xl font-semibold text-primary">Easy Listing</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Quickly add your products with all necessary details like category, price, and location.
            </p>
          </div>
          <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-7 w-7 text-accent" />
              <h3 className="text-xl font-semibold text-primary">Reach Buyers</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your listed goods will be visible to a wide network of buyers looking for transport.
            </p>
          </div>
          <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <Coins className="h-7 w-7 text-accent" />
              <h3 className="text-xl font-semibold text-primary">Transparent Process</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your inventory and sales with clear tracking and communication tools.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
