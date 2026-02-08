import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { LoadingState } from '../components/QueryStates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSportLabel, SPORT_OPTIONS } from '../lib/sports';
import { Sport } from '../backend';
import { Check } from 'lucide-react';

export default function SportSelectionPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/sign-in' });
    }
  }, [identity, navigate]);

  useEffect(() => {
    if (profile) {
      setSelectedSport(profile.selectedSport);
    }
  }, [profile]);

  if (!identity) return null;

  if (isLoading) {
    return <LoadingState message="Loading sports..." />;
  }

  const handleSelectSport = async (sport: Sport) => {
    if (!profile) return;

    setSelectedSport(sport);

    try {
      await saveProfile.mutateAsync({
        ...profile,
        selectedSport: sport,
      });
      toast.success(`${getSportLabel(sport)} selected!`);
    } catch (error) {
      toast.error('Failed to update sport');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Choose Your Sport</h1>
        <p className="text-muted-foreground">Select your favorite sport to personalize your experience</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPORT_OPTIONS.map((sport) => {
          const isSelected = selectedSport === sport;
          return (
            <Card
              key={sport}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectSport(sport)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {getSportLabel(sport)}
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
