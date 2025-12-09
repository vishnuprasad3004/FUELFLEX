
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, LogInIcon } from 'lucide-react';
import { createUserProfile } from '@/services/user-service';
import { UserRole } from '@/models/user';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For inline error display
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    try {
       // Special case for admin login
      if (data.email === 'njvishnun@gmail.com' && data.password === 'chennai001') {
          try {
              await signInWithEmailAndPassword(auth, data.email, data.password);
              toast({
                  title: "Admin Login Successful",
                  description: "Welcome, Admin! Redirecting...",
              });
              // The useAuthRedirect hook will handle the redirection to /admin/dashboard
              return; 
          } catch (err: any) {
              // If admin user does not exist, create it
              if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                  await createUserProfile(userCredential.user.uid, data.email, UserRole.ADMIN, { displayName: "Admin" });
                  toast({
                      title: "Admin Account Created",
                      description: "Welcome, Admin! Redirecting...",
                  });
                   // The useAuthRedirect hook will handle the redirection
                  return;
              } else {
                  // For other errors (e.g., wrong password for existing admin), throw them to be caught below
                  throw err;
              }
          }
      }

      // Regular user login
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting...",
      });
      // AuthProvider will fetch profile and useAuthRedirect will handle navigation.
    } catch (err: any) {
      console.error("Login error:", err.code, err.message);
      let errorMessage = "Failed to login. Please check your credentials and try again.";

      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // More generic error in newer SDK versions
          errorMessage = "Invalid email or password. Please check your credentials.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address format is not valid.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This user account has been disabled. Please contact support.";
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
        title: "Login Failed",
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
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} aria-invalid={errors.password ? "true" : "false"} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {/* {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>} */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogInIcon className="mr-2 h-4 w-4" />}
        Login
      </Button>
    </form>
  );
}
