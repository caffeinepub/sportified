import { useState } from 'react';
import { useGetProfile } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface UserLookupFormProps {
  onUserFound: (userId: string, userName: string) => void;
  actionLabel: string;
}

export default function UserLookupForm({ onUserFound, actionLabel }: UserLookupFormProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchedUserId, setSearchedUserId] = useState<string | null>(null);
  const { data: foundProfile, isLoading, error } = useGetProfile(searchedUserId);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      toast.error('Please enter a user ID');
      return;
    }
    setSearchedUserId(trimmed);
  };

  const handleAction = () => {
    if (foundProfile && searchedUserId) {
      onUserFound(searchedUserId, foundProfile.name);
      setSearchInput('');
      setSearchedUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId">User ID (Principal)</Label>
        <div className="flex gap-2">
          <Input
            id="userId"
            placeholder="Enter user principal ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}

      {error && <p className="text-sm text-destructive">User not found</p>}

      {foundProfile && searchedUserId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{foundProfile.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{searchedUserId}</p>
              </div>
              <Button onClick={handleAction}>{actionLabel}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
