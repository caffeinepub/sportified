import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

const SIGNUP_INTENT_KEY = 'sportified_signup_intent';

export default function SignInPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  useEffect(() => {
    if (identity && isFetched && !profileLoading) {
      setIsCheckingProfile(true);
      const signupIntent = sessionStorage.getItem(SIGNUP_INTENT_KEY);

      if (signupIntent === 'true') {
        // User clicked sign-up, route to onboarding regardless of profile status
        sessionStorage.removeItem(SIGNUP_INTENT_KEY);
        navigate({ to: '/onboarding' });
      } else if (userProfile !== null) {
        // Returning user with profile, go to dashboard
        navigate({ to: '/' });
      } else {
        // Returning user without profile (edge case), go to onboarding
        navigate({ to: '/onboarding' });
      }
    }
  }, [identity, userProfile, profileLoading, isFetched, navigate]);

  const handleLogin = async () => {
    sessionStorage.removeItem(SIGNUP_INTENT_KEY);
    try {
      await login();
    } catch (error: unknown) {
      console.error('Login error:', error);
    }
  };

  const handleSignup = async () => {
    sessionStorage.setItem(SIGNUP_INTENT_KEY, 'true');
    try {
      await login();
    } catch (error: unknown) {
      console.error('Signup error:', error);
      sessionStorage.removeItem(SIGNUP_INTENT_KEY);
    }
  };

  if (isCheckingProfile) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/assets/generated/sportified-bg.dim_1600x900.png)' }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/assets/generated/sportified-logo.dim_512x512.png" alt="Sportified" className="h-20 w-20" />
          </div>
          <CardTitle className="text-3xl">Welcome to Sportified</CardTitle>
          <CardDescription>Track your fitness goals and connect with friends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleLogin} disabled={loginStatus === 'logging-in'} className="w-full" size="lg">
            <LogIn className="mr-2 h-5 w-5" />
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            onClick={handleSignup}
            disabled={loginStatus === 'logging-in'}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            New user? Sign up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
