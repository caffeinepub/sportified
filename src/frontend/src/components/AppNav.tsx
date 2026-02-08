import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, User, Trophy, Users, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/sport-selection', label: 'Sports', icon: Trophy },
    { path: '/friends', label: 'Friends', icon: Users },
    { path: '/following', label: 'Following', icon: UserPlus },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-[73px] z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: item.path })}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
