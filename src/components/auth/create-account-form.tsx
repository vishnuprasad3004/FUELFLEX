'use client';

import { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from 'lucide-react';
import { createUserProfile } from '@/services/user-service'; // Ensure this path is correct
import { UserRole } from '@/models/user'; // Ensure this path is correct

const createAccountSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }).optional(),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Please select a role" }) }),
});

type CreateAccountFormInputs = z.infer<typeof createAccountSchema>;

export default function CreateAccountForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountFormInputs>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      role: UserRole.BUYER_SELLER, // Default role
    },
  });

  const onSubmit: SubmitHandler<CreateAccountFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        // Store additional user information (like role) in Firestore
        await createUserProfile(user.uid, user.email || data.email, data.role, {
          displayName: data.displayName || user.email?.split('@')[0], // Use email prefix if no display name
          photoURL: user.photoURL, // This will be null initially for email/password
        });

        toast({
          title: "Account Created Successfully!",
          description: "Welcome to FuelFlex! Redirecting...",
        });
        // AuthProvider will handle profile fetching, useAuthRedirect handles navigation
        // For explicit redirect: router.push('/'); or role-specific page
      }
    } catch (err: any) {
      console.error("Create account error:", err);
      let errorMessage = "Failed to create account. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.code === 'auth/api-key-not-valid') {
         errorMessage = "Firebase API key is invalid. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is correct and valid for your Firebase project. See README.md for setup instructions.";
      }
      setError(errorMessage);
      toast({
        title: "Account Creation Failed",
        description: errorMessage,
        variant: "destructive",
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
        <Label htmlFor="role">Register as</Label>
        <Controller
            name="role"
            control={control}
            render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={UserRole.BUYER_SELLER}>Buyer / Seller</SelectItem>
                        <SelectItem value={UserRole.TRANSPORT_OWNER}>Transport Owner</SelectItem>
                        {/* Admin role typically assigned manually, not during public registration */}
                        {/* <SelectItem value={UserRole.ADMIN}>Admin</SelectItem> */}
                    </SelectContent>
                </Select>
            )}
        />
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
        Create Account
      </Button>
    </form>
  );
}
