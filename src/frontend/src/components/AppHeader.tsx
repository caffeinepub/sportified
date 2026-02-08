import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn } from 'lucide-react';

export default function AppHeader() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/sign-in' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <button
          onClick={() => navigate({ to: isAuthenticated ? '/' : '/sign-in' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src="/assets/generated/sportified-logo.dim_512x512.png" alt="Sportified" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-foreground">Sportified</h1>
        </button>
        <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'}>
          {loginStatus === 'logging-in' ? (
            'Logging in...'
          ) : isAuthenticated ? (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
