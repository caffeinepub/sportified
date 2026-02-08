import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ActivityLog, Message, Sport } from '../backend';
import { Principal } from '@dfinity/principal';

// Profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetProfile(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        const principal = Principal.fromText(userId);
        return await actor.getUserProfile(principal);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      age,
      fitnessGoals,
      sport,
    }: {
      name: string;
      age: bigint;
      fitnessGoals: string;
      sport: Sport;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createProfile(name, age, fitnessGoals, sport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Activity queries
export function useGetActivityLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ActivityLog[]>({
    queryKey: ['activityLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLogsForCaller();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLogActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      steps,
      squats,
      pushups,
    }: {
      date: string;
      steps: bigint;
      squats: bigint;
      pushups: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.logActivity(date, steps, squats, pushups);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

// Friend queries
export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(targetId);
      await actor.sendFriendRequest(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (senderId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(senderId);
      await actor.acceptFriendRequest(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useDeclineFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (senderId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(senderId);
      await actor.declineFriendRequest(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Following queries
export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(targetId);
      await actor.followUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(targetId);
      await actor.unfollowUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Message queries
export function useGetConversation(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['conversation', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        const principal = Principal.fromText(userId);
        return await actor.getConversation(principal);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, content }: { to: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(to);
      await actor.sendMessage(principal, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.to] });
    },
  });
}
