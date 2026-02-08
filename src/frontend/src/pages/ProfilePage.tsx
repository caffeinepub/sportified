import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { LoadingState } from '../components/QueryStates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getSportLabel, SPORT_OPTIONS } from '../lib/sports';
import { Sport } from '../backend';
import { Copy, Check } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/sign-in' });
    }
  }, [identity, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAge(profile.age.toString());
      setFitnessGoals(profile.fitnessGoals);
      setSelectedSport(profile.selectedSport);
    }
  }, [profile]);

  if (!identity) return null;

  if (isLoading) {
    return <LoadingState message="Loading profile..." />;
  }

  const handleSave = async () => {
    if (!profile || !name.trim() || !selectedSport) {
      toast.error('Please fill in all required fields');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum <= 0) {
      toast.error('Please enter a valid age');
      return;
    }

    if (!fitnessGoals.trim()) {
      toast.error('Please enter your fitness goals');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        ...profile,
        name: name.trim(),
        age: BigInt(ageNum),
        fitnessGoals: fitnessGoals.trim(),
        selectedSport,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCopyId = () => {
    const userId = identity.getPrincipal().toString();
    navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success('User ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const userId = identity.getPrincipal().toString();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fitnessGoals">Fitness Goals</Label>
            <Textarea
              id="fitnessGoals"
              value={fitnessGoals}
              onChange={(e) => setFitnessGoals(e.target.value)}
              placeholder="What are your fitness goals?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport">Preferred Sport</Label>
            <Select value={selectedSport || ''} onValueChange={(value) => setSelectedSport(value as Sport)}>
              <SelectTrigger id="sport">
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORT_OPTIONS.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {getSportLabel(sport)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saveProfile.isPending} className="w-full">
            {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User ID</CardTitle>
          <CardDescription>Share this ID with friends to connect</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={userId} readOnly className="font-mono text-sm" />
            <Button onClick={handleCopyId} variant="outline" size="icon">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Friends</p>
              <p className="text-2xl font-bold">{profile.friends.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Following</p>
              <p className="text-2xl font-bold">{profile.following.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-2xl font-bold">{profile.followers.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Friend Requests</p>
              <p className="text-2xl font-bold">{profile.friendRequests.length}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
