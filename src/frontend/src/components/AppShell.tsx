import { type ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppNav from './AppNav';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const hasProfile = isAuthenticated && !profileLoading && userProfile !== null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {hasProfile && <AppNav />}
      <main className="container mx-auto px-4 py-6 max-w-7xl">{children}</main>
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
