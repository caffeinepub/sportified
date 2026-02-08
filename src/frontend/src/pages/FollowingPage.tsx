import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useFollowUser, useUnfollowUser, useGetProfile } from '../hooks/useQueries';
import { LoadingState, EmptyState } from '../components/QueryStates';
import UserLookupForm from '../components/UserLookupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function FollowingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/sign-in' });
    }
  }, [identity, navigate]);

  if (!identity) return null;

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  const handleFollow = async (userId: string, userName: string) => {
    try {
      await followUser.mutateAsync(userId);
      toast.success(`Now following ${userName}`);
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser.mutateAsync(userId);
      toast.success('Unfollowed user');
    } catch (error) {
      toast.error('Failed to unfollow user');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Following & Followers</h1>
        <p className="text-muted-foreground">Manage who you follow</p>
      </div>

      <Tabs defaultValue="following" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="following">Following ({profile?.following.length || 0})</TabsTrigger>
          <TabsTrigger value="followers">Followers ({profile?.followers.length || 0})</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="space-y-4">
          {!profile?.following.length ? (
            <EmptyState message="You're not following anyone yet" />
          ) : (
            <div className="space-y-3">
              {profile.following.map((userId) => (
                <FollowingCard
                  key={userId.toString()}
                  userId={userId.toString()}
                  onUnfollow={() => handleUnfollow(userId.toString())}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="space-y-4">
          {!profile?.followers.length ? (
            <EmptyState message="No followers yet" />
          ) : (
            <div className="space-y-3">
              {profile.followers.map((userId) => (
                <FollowerCard key={userId.toString()} userId={userId.toString()} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follow Someone</CardTitle>
              <CardDescription>Enter a user's ID to follow them</CardDescription>
            </CardHeader>
            <CardContent>
              <UserLookupForm onUserFound={handleFollow} actionLabel="Follow" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FollowingCard({ userId, onUnfollow }: { userId: string; onUnfollow: () => void }) {
  const { data: profile } = useGetProfile(userId);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{profile?.name || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{userId}</p>
          </div>
          <Button onClick={onUnfollow} variant="outline" size="sm">
            Unfollow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FollowerCard({ userId }: { userId: string }) {
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
