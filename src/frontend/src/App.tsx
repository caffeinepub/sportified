import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import SignInPage from './pages/SignInPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SportSelectionPage from './pages/SportSelectionPage';
import FriendsPage from './pages/FriendsPage';
import FollowingPage from './pages/FollowingPage';
import MessagesPage from './pages/MessagesPage';
import ChatThreadPage from './pages/ChatThreadPage';
import AppShell from './components/AppShell';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  useEffect(() => {
    if (isInitializing || profileLoading) return;

    const currentPath = window.location.pathname;
    const isAuthenticated = !!identity;

    // If authenticated and no profile, redirect to onboarding (unless already there or on sign-in)
    if (isAuthenticated && isFetched && userProfile === null) {
      if (currentPath !== '/onboarding' && currentPath !== '/sign-in') {
        navigate({ to: '/onboarding' });
      }
    }
  }, [identity, userProfile, isInitializing, profileLoading, isFetched, navigate]);

  return <>{children}</>;
}

function Layout() {
  return (
    <RouteGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </RouteGuard>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: SignInPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const sportSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sport-selection',
  component: SportSelectionPage,
});

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/friends',
  component: FriendsPage,
});

const followingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/following',
  component: FollowingPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesPage,
});

const chatThreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$userId',
  component: ChatThreadPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  onboardingRoute,
  profileRoute,
  sportSelectionRoute,
  friendsRoute,
  followingRoute,
  messagesRoute,
  chatThreadRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
