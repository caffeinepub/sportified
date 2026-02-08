import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetActivityLogs } from '../hooks/useQueries';
import { LoadingState, EmptyState } from '../components/QueryStates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ActivityLogger from '../components/ActivityLogger';
import { getTodayKey } from '../lib/date';
import { Footprints, Dumbbell, Activity } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: logs, isLoading: logsLoading } = useGetActivityLogs();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/sign-in' });
    }
  }, [identity, navigate]);

  if (!identity) return null;

  if (profileLoading || logsLoading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  const todayKey = getTodayKey();
  const todayLog = logs?.find((log) => log.date === todayKey);

  const goals = {
    steps: 10000,
    squats: 30,
    pushups: 30,
  };

  const current = {
    steps: todayLog ? Number(todayLog.steps) : 0,
    squats: todayLog ? Number(todayLog.squats) : 0,
    pushups: todayLog ? Number(todayLog.pushups) : 0,
  };

  const progressPercent = {
    steps: Math.min((current.steps / goals.steps) * 100, 100),
    squats: Math.min((current.squats / goals.squats) * 100, 100),
    pushups: Math.min((current.pushups / goals.pushups) * 100, 100),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile?.name}!</h1>
        <p className="text-muted-foreground">Track your daily fitness goals</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Steps</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {current.steps.toLocaleString()} / {goals.steps.toLocaleString()}
            </div>
            <Progress value={progressPercent.steps} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">{progressPercent.steps.toFixed(0)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squats</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {current.squats} / {goals.squats}
            </div>
            <Progress value={progressPercent.squats} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">{progressPercent.squats.toFixed(0)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pushups</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {current.pushups} / {goals.pushups}
            </div>
            <Progress value={progressPercent.pushups} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">{progressPercent.pushups.toFixed(0)}% complete</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Activity</CardTitle>
          <CardDescription>Update your daily progress</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLogger currentLog={todayLog} />
        </CardContent>
      </Card>
    </div>
  );
}
