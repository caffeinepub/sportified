import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    sender: Principal;
    timestamp: Time;
    receiver: Principal;
}
export type Time = bigint;
export interface UserProfile {
    age: bigint;
    fitnessGoals: string;
    name: string;
    selectedSport: Sport;
    activityPublic: boolean;
    followers: Array<Principal>;
    following: Array<Principal>;
    friends: Array<Principal>;
    friendRequests: Array<Principal>;
}
export interface ActivityLog {
    date: string;
    squats: bigint;
    pushups: bigint;
    steps: bigint;
}
export enum Sport {
    baseball = "baseball",
    basketball = "basketball",
    swimming = "swimming",
    volleyball = "volleyball",
    football = "football",
    yoga = "yoga",
    cycling = "cycling",
    tennis = "tennis",
    skiing = "skiing",
    badminton = "badminton"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(sender: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProfile(name: string, age: bigint, fitnessGoals: string, sport: Sport): Promise<void>;
    declineFriendRequest(sender: Principal): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getActivityLogsForCaller(): Promise<Array<ActivityLog>>;
    getActivityLogsForUser(user: Principal): Promise<Array<ActivityLog>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(user: Principal): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logActivity(date: string, steps: bigint, squats: bigint, pushups: bigint): Promise<void>;
    saveCallerUserProfile(updatedProfile: UserProfile): Promise<void>;
    sendFriendRequest(target: Principal): Promise<void>;
    sendMessage(to: Principal, content: string): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
}
