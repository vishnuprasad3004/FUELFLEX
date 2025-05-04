
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  return (
     // Removed main container styling, rely on root layout and card for centering/padding
     <div className="flex items-center justify-center py-12 px-4">
      <Card className="mx-auto max-w-sm w-full shadow-lg border border-border rounded-lg">
        <CardHeader className="space-y-1 text-center">
          <UserPlus className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">Create an Account</CardTitle>
          <CardDescription>Enter your information to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Optional: Add First/Last Name fields if needed */}
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="Max" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Robinson" required />
              </div>
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Create account
            </Button>
             {/* Optional: Add social signup buttons if needed */}
            {/* <Button variant="outline" className="w-full">
              Sign up with Google
            </Button> */}
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary hover:text-primary/90">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
