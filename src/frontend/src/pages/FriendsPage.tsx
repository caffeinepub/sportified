import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useGetProfile,
} from '../hooks/useQueries';
import { LoadingState, EmptyState } from '../components/QueryStates';
import UserLookupForm from '../components/UserLookupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserPlus, Check, X } from 'lucide-react';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/sign-in' });
    }
  }, [identity, navigate]);

  if (!identity) return null;

  if (isLoading) {
    return <LoadingState message="Loading friends..." />;
  }

  const handleSendRequest = async (userId: string, userName: string) => {
    try {
      await sendRequest.mutateAsync(userId);
      toast.success(`Friend request sent to ${userName}`);
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  const handleAccept = async (userId: string) => {
    try {
      await acceptRequest.mutateAsync(userId);
      toast.success('Friend request accepted!');
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (userId: string) => {
    try {
      await declineRequest.mutateAsync(userId);
      toast.success('Friend request declined');
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="text-muted-foreground">Manage your friend connections</p>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends ({profile?.friends.length || 0})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({profile?.friendRequests.length || 0})</TabsTrigger>
          <TabsTrigger value="add">Add Friend</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {!profile?.friends.length ? (
            <EmptyState message="No friends yet. Send a friend request to get started!" />
          ) : (
            <div className="space-y-3">
              {profile.friends.map((friendId) => (
                <FriendCard key={friendId.toString()} userId={friendId.toString()} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {!profile?.friendRequests.length ? (
            <EmptyState message="No pending friend requests" />
          ) : (
            <div className="space-y-3">
              {profile.friendRequests.map((requesterId) => {
                const userId = requesterId.toString();
                return (
                  <Card key={userId}>
                    <CardContent className="pt-6">
                      <FriendRequestCard
                        userId={userId}
                        onAccept={() => handleAccept(userId)}
                        onDecline={() => handleDecline(userId)}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add a Friend</CardTitle>
              <CardDescription>Enter a user's ID to send them a friend request</CardDescription>
            </CardHeader>
            <CardContent>
              <UserLookupForm onUserFound={handleSendRequest} actionLabel="Send Request" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FriendCard({ userId }: { userId: string }) {
  const { data: profile } = useGetProfile(userId);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{profile?.name || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{userId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FriendRequestCard({
  userId,
  onAccept,
  onDecline,
}: {
  userId: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { data: profile } = useGetProfile(userId);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{profile?.name || 'Loading...'}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{userId}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onAccept} size="sm">
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
        <Button onClick={onDecline} size="sm" variant="outline">
          <X className="h-4 w-4 mr-1" />
          Decline
        </Button>
      </div>
    </div>
  );
}
