"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/firebase/firebase-config';
import { getUserProfile } from '@/services/user-service';
import { UserRole } from '@/models/user';
import { Loader2, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthState } from 'react-firebase-hooks/auth';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentUser, authLoading, authError] = useAuthState(auth);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (!authLoading && currentUser) {
      // If user is already logged in, fetch profile and redirect
      getUserProfile(currentUser.uid).then(profile => {
        if (profile) {
          switch (profile.role) {
            case UserRole.ADMIN:
              router.push('/admin/dashboard');
              break;
            case UserRole.TRANSPORT_OWNER:
              router.push('/owner/dashboard');
              break;
            case UserRole.BUYER_SELLER:
            default:
              router.push('/');
              break;
          }
        } else {
          router.push('/'); // Fallback if profile not found
        }
      }).catch(() => router.push('/'));
    }
  }, [currentUser, authLoading, router]);


  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        const userProfile = await getUserProfile(user.uid);
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userProfile?.displayName || user.email}!`,
          variant: "default",
        });

        if (userProfile) {
          switch (userProfile.role) {
            case UserRole.ADMIN:
              router.push('/admin/dashboard');
              break;
            case UserRole.TRANSPORT_OWNER:
              router.push('/owner/dashboard');
              break;
            case UserRole.BUYER_SELLER:
              router.push('/'); 
              break;
            default:
              console.warn("Unknown user role:", userProfile.role, "Defaulting to home page.");
              router.push('/'); 
          }
        } else {
          console.warn("User profile not found for UID:", user.uid, "Defaulting to home page.");
          setError("User profile not found. Please contact support if this issue persists.");
          router.push('/');
        }
      } else {
        // This case should generally not be reached if signInWithEmailAndPassword succeeds.
        throw new Error("Login failed. User details not available after sign-in.");
      }
    } catch (authError: any) {
      console.error("Firebase Auth Error:", authError);
      let errorMessage = "Failed to login. Please check your email and password.";
      if (authError.code) {
        switch (authError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = "Invalid email or password. Please try again.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many login attempts. Please try again later.";
            break;
          case 'auth/user-disabled':
            errorMessage = "This account has been disabled.";
            break;
          default:
            errorMessage = authError.message || "An unknown authentication error occurred.";
        }
      }
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  // If user is already logged in, they will be redirected by useEffect, so no need to render form.
  if (currentUser) return null;


  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="mx-auto max-w-sm w-full shadow-xl border border-border rounded-lg">
        <CardHeader className="space-y-1 text-center">
          <LogIn className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="#" // TODO: Implement password reset
                        className="ml-auto inline-block text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
