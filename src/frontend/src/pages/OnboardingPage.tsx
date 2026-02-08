import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateProfile } from '../hooks/useQueries';
import { Sport } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getSportLabel, SPORT_OPTIONS } from '../lib/sports';

const SIGNUP_INTENT_KEY = 'sportified_signup_intent';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const createProfile = useCreateProfile();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  useEffect(() => {
    // Guard: redirect unauthenticated users to sign-in
    if (!identity) {
      navigate({ to: '/sign-in' });
      return;
    }

    // Guard: redirect users with existing profiles to dashboard
    if (isFetched && userProfile !== null) {
      navigate({ to: '/' });
    }
  }, [identity, userProfile, isFetched, navigate]);

  if (!identity || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
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

    if (!selectedSport) {
      toast.error('Please select your preferred sport');
      return;
    }

    try {
      await createProfile.mutateAsync({
        name: name.trim(),
        age: BigInt(ageNum),
        fitnessGoals: fitnessGoals.trim(),
        sport: selectedSport,
      });
      sessionStorage.removeItem(SIGNUP_INTENT_KEY);
      toast.success('Welcome to Sportified!');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to create profile. Please try again.');
      console.error('Profile creation error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started with Sportified</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fitnessGoals">Fitness Goals *</Label>
              <Textarea
                id="fitnessGoals"
                placeholder="What are your fitness goals? (e.g., lose weight, build muscle, improve endurance)"
                value={fitnessGoals}
                onChange={(e) => setFitnessGoals(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Preferred Sport *</Label>
              <Select value={selectedSport || ''} onValueChange={(value) => setSelectedSport(value as Sport)}>
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Select your preferred sport" />
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

            <Button type="submit" className="w-full" size="lg" disabled={createProfile.isPending}>
              {createProfile.isPending ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
