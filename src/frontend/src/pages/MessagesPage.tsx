import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { LoadingState, EmptyState } from '../components/QueryStates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/sign-in' });
    }
  }, [identity, navigate]);

  if (!identity) return null;

  if (isLoading) {
    return <LoadingState message="Loading messages..." />;
  }

  const handleOpenChat = () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      toast.error('Please enter a user ID');
      return;
    }
    navigate({ to: `/messages/${trimmed}` });
  };

  const allContacts = [
    ...(profile?.friends || []),
    ...(profile?.following || []),
    ...(profile?.followers || []),
  ];

  const uniqueContacts = Array.from(new Set(allContacts.map((p) => p.toString())));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your connections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start a Conversation</CardTitle>
          <CardDescription>Enter a user ID to open a chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                placeholder="Enter user principal ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenChat()}
              />
              <Button onClick={handleOpenChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {uniqueContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Your connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uniqueContacts.map((contactId) => (
                <Button
                  key={contactId}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: `/messages/${contactId}` })}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="truncate">{contactId}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
