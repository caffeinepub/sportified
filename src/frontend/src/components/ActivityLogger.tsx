import { useState, useEffect } from 'react';
import { useLogActivity } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { getTodayKey } from '../lib/date';
import type { ActivityLog } from '../backend';
import { Play, Pause } from 'lucide-react';

interface ActivityLoggerProps {
  currentLog?: ActivityLog;
}

export default function ActivityLogger({ currentLog }: ActivityLoggerProps) {
  const logActivity = useLogActivity();
  const [squats, setSquats] = useState('');
  const [pushups, setPushups] = useState('');
  const [steps, setSteps] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (currentLog) {
      setSteps(Number(currentLog.steps));
    }
  }, [currentLog]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        setSteps((prev) => prev + Math.floor(Math.random() * 5) + 1);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleLogManual = async () => {
    const squatsNum = parseInt(squats) || 0;
    const pushupsNum = parseInt(pushups) || 0;

    if (squatsNum === 0 && pushupsNum === 0) {
      toast.error('Please enter at least one value');
      return;
    }

    const currentSquats = currentLog ? Number(currentLog.squats) : 0;
    const currentPushups = currentLog ? Number(currentLog.pushups) : 0;

    try {
      await logActivity.mutateAsync({
        date: getTodayKey(),
        steps: BigInt(steps),
        squats: BigInt(currentSquats + squatsNum),
        pushups: BigInt(currentPushups + pushupsNum),
      });
      toast.success('Activity logged!');
      setSquats('');
      setPushups('');
    } catch (error) {
      toast.error('Failed to log activity');
    }
  };

  const handleSaveSteps = async () => {
    try {
      await logActivity.mutateAsync({
        date: getTodayKey(),
        steps: BigInt(steps),
        squats: BigInt(currentLog ? Number(currentLog.squats) : 0),
        pushups: BigInt(currentLog ? Number(currentLog.pushups) : 0),
      });
      toast.success('Steps saved!');
    } catch (error) {
      toast.error('Failed to save steps');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-accent/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Simulated Steps</Label>
            <Button
              variant={isSimulating ? 'destructive' : 'default'}
              size="sm"
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
          <div className="text-3xl font-bold">{steps.toLocaleString()} steps</div>
          <Button onClick={handleSaveSteps} variant="outline" size="sm" disabled={logActivity.isPending}>
            Save Steps
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold">Manual Logging</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="squats">Squats (add)</Label>
            <Input
              id="squats"
              type="number"
              min="0"
              placeholder="0"
              value={squats}
              onChange={(e) => setSquats(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pushups">Pushups (add)</Label>
            <Input
              id="pushups"
              type="number"
              min="0"
              placeholder="0"
              value={pushups}
              onChange={(e) => setPushups(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleLogManual} disabled={logActivity.isPending}>
          {logActivity.isPending ? 'Logging...' : 'Log Activity'}
        </Button>
      </div>
    </div>
  );
}
