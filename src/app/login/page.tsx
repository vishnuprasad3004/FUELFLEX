'use client';

import LoginForm from '@/components/auth/login-form';
import AuthFormWrapper from '@/components/auth/auth-form-wrapper';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

export default function LoginPage() {
  // Redirect if already authenticated
  useAuthRedirect({ redirectIfAuthenticated: '/' });


  return (
    <AuthFormWrapper
      title="Welcome Back!"
      description="Log in to access your FuelFlex account."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkHref="/create-account"
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}
