
'use client';

import { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from 'lucide-react';
import { createUserProfile } from '@/services/user-service'; 
import { UserRole } from '@/models/user'; 

const createAccountSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }).optional(),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Please select a role" }) }),
});

type CreateAccountFormInputs = z.infer<typeof createAccountSchema>;

export default function CreateAccountForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For inline error display if needed
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const defaultRole = searchParams.get('role') === UserRole.TRANSPORT_OWNER 
    ? UserRole.TRANSPORT_OWNER 
    : UserRole.BUYER_SELLER;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountFormInputs>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      role: defaultRole, 
    },
  });

  const onSubmit: SubmitHandler<CreateAccountFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (!auth) {
        throw new Error("Authentication service is not available. Check Firebase configuration.");
      }

      // Handle the special admin login case
      if (data.email === 'njvishnun@gmail.com' && data.password === 'chennai001') {
          try {
              await signInWithEmailAndPassword(auth, data.email, data.password);
              toast({
                  title: "Admin Login Successful",
                  description: "Welcome, Admin! Redirecting to your dashboard.",
              });
              router.push('/admin/dashboard');
              return; // Stop further execution
          } catch (err: any) {
              // If admin doesn't exist, create it.
              if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                  await createUserProfile(userCredential.user.uid, data.email, UserRole.ADMIN, { displayName: "Admin" });
                  toast({
                      title: "Admin Account Created",
                      description: "Welcome, Admin! Redirecting to your dashboard.",
                  });
                  router.push('/admin/dashboard');
                  return;
              } else {
                  throw err; // Re-throw other sign-in errors
              }
          }
      }


      // Regular user creation
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        await createUserProfile(user.uid, user.email || data.email, data.role, {
          displayName: data.displayName || user.email?.split('@')[0], 
          photoURL: user.photoURL, 
        });

        toast({
          title: "Account Created Successfully!",
          description: "Welcome to FuelFlex! Redirecting...",
        });
        
        // After successful creation, redirect based on role
        if (data.role === UserRole.TRANSPORT_OWNER) {
          router.push('/transport-owner/dashboard');
        } else {
          router.push('/marketplace');
        }
      }
    } catch (err: any) {
      console.error("Create account error:", err.code, err.message);
      let errorMessage = "Failed to create account. Please try again.";
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email address is already in use. Please try logging in or use a different email.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address is not valid. Please enter a correct email format.";
          break;
        case 'auth/weak-password':
          errorMessage = "The password is too weak. Please choose a stronger password (at least 6 characters).";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled. Please contact support.";
          break;
        case 'auth/api-key-not-valid':
        case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.': // Handle variations of the error code
          errorMessage = "CRITICAL CONFIG ERROR: Firebase API key is invalid. This app cannot connect to Firebase. Please ensure 'NEXT_PUBLIC_FIREBASE_API_KEY' in your .env file is correct and matches the Web API Key from your Firebase project settings (General > Your apps > SDK setup and configuration). Restart your server after fixing. See README.md for detailed setup instructions.";
          break;
        default:
          errorMessage = `An unexpected error occurred: ${err.message} (Code: ${err.code})`;
      }
      
      setError(errorMessage); // Set error for potential inline display
      toast({
        title: "Account Creation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 9000, // Longer duration for critical errors
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} aria-invalid={errors.email ? "true" : "false"} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="displayName">Display Name (Optional)</Label>
        <Input id="displayName" type="text" placeholder="Your Name" {...register('displayName')} />
        {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} aria-invalid={errors.password ? "true" : "false"} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">I am a...</Label>
        <Controller
            name="role"
            control={control}
            render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={UserRole.BUYER_SELLER}>Client / Shipper</SelectItem>
                        <SelectItem value={UserRole.TRANSPORT_OWNER}>Transport Owner</SelectItem>
                    </SelectContent>
                </Select>
            )}
        />
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
        Create Account or Login as Admin
      </Button>
    </form>
  );
}
