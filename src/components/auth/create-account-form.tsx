'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { createUserProfile } from '@/services/user-service'; // Ensure this path is correct
import { UserRole } from '@/models/user'; // Ensure this path is correct
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlusIcon } from 'lucide-react';

const createAccountSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Please select a role" }) }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
      role: undefined, // Ensure role is initially undefined for Select placeholder
    },
  });

  const onSubmit: SubmitHandler<CreateAccountFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: data.displayName });
        await createUserProfile(user.uid, data.email, data.role, { displayName: data.displayName });
      }
      
      toast({
        title: "Account Created Successfully!",
        description: "You can now log in. Redirecting...",
      });
      router.push('/login');

    } catch (err: any) {
      console.error("Create account error:", err);
      let errorMessage = "Failed to create account. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
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
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" placeholder="John Doe" {...register('displayName')} />
        {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">I am a...</Label>
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
                        {/* Admin role typically assigned manually, not via public registration */}
                        {/* <SelectItem value={UserRole.ADMIN}>Admin</SelectItem> */}
                    </SelectContent>
                </Select>
            )}
        />
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlusIcon className="mr-2 h-4 w-4" />}
        Create Account
      </Button>
    </form>
  );
}

// Need to import Controller from react-hook-form for the Select component
import { Controller } from 'react-hook-form';
