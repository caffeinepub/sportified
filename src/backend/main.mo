import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  module PrincipalTuple {
    public func compare(tuple1 : (Principal, Principal), tuple2 : (Principal, Principal)) : Order.Order {
      switch (Principal.compare(tuple1.0, tuple2.0)) {
        case (#equal) { Principal.compare(tuple1.1, tuple2.1) };
        case (order) { order };
      };
    };
  };

  public type Sport = {
    #basketball;
    #badminton;
    #football;
    #baseball;
    #swimming;
    #cycling;
    #tennis;
    #volleyball;
    #yoga;
    #skiing;
  };

  module Sport {
    public func toText(sport : Sport) : Text {
      switch (sport) {
        case (#basketball) { "Basketball" };
        case (#badminton) { "Badminton" };
        case (#football) { "Football" };
        case (#baseball) { "Baseball" };
        case (#swimming) { "Swimming" };
        case (#cycling) { "Cycling" };
        case (#tennis) { "Tennis" };
        case (#volleyball) { "Volleyball" };
        case (#yoga) { "Yoga" };
        case (#skiing) { "Skiing" };
      };
    };
  };

  // Updated UserProfile
  public type UserProfile = {
    name : Text;
    age : Nat;
    fitnessGoals : Text;
    selectedSport : Sport;
    activityPublic : Bool;
    friendRequests : [Principal];
    friends : [Principal];
    following : [Principal];
    followers : [Principal];
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type ActivityLog = {
    date : Text;
    steps : Nat;
    squats : Nat;
    pushups : Nat;
  };

  let activityLogs = Map.empty<Principal, List.List<ActivityLog>>();

  public type Message = {
    sender : Principal;
    receiver : Principal;
    timestamp : Time.Time;
    content : Text;
  };

  let messages = Map.empty<(Principal, Principal), List.List<Message>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func existsInArray<T>(_array : [T], element : T, equalFunc : (T, T) -> Bool) : Bool {
    _array.values().any(func(x) { equalFunc(x, element) });
  };

  public shared ({ caller }) func createProfile(name : Text, age : Nat, fitnessGoals : Text, sport : Sport) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        let profile : UserProfile = {
          name;
          age;
          fitnessGoals;
          selectedSport = sport;
          activityPublic = true;
          friendRequests = [];
          friends = [];
          following = [];
          followers = [];
        };
        userProfiles.add(caller, profile);
      };
      case (?_) { Runtime.trap("Profile already exists!") };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    
    // Users can view their own profile or any other user's profile (social app)
    // Admins can view any profile
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(updatedProfile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    
    // Verify the profile exists before updating
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Create a profile first.") };
      case (?_) {
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func sendFriendRequest(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };

    if (caller == target) {
      Runtime.trap("You cannot send requests to yourself!");
    };

    switch (userProfiles.get(target)) {
      case (null) {
        Runtime.trap("Target profile not found!");
      };
      case (?targetProfile) {
        if (existsInArray(targetProfile.friendRequests, caller, Principal.equal)) {
          Runtime.trap("Friend request already sent!");
        };

        let updatedRequests = targetProfile.friendRequests.concat([caller]);
        let updatedTargetProfile : UserProfile = {
          targetProfile with friendRequests = updatedRequests;
        };
        userProfiles.add(target, updatedTargetProfile);
      };
    };
  };

  public shared ({ caller }) func acceptFriendRequest(sender : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Your profile was not found!") };
      case (?receiverProfile) {
        if (not existsInArray(receiverProfile.friendRequests, sender, Principal.equal)) {
          Runtime.trap("Friend request not found!");
        };

        let updatedFriends = receiverProfile.friends.concat([sender]);
        let updatedFriendRequests = receiverProfile.friendRequests.filter(func(p) { not Principal.equal(p, sender) });
        let updatedProfile : UserProfile = {
          receiverProfile with
          friends = updatedFriends;
          friendRequests = updatedFriendRequests;
        };
        userProfiles.add(caller, updatedProfile);

        switch (userProfiles.get(sender)) {
          case (null) {};
          case (?senderProfile) {
            let senderFriends = senderProfile.friends.concat([caller]);
            let updatedSender : UserProfile = {
              senderProfile with friends = senderFriends;
            };
            userProfiles.add(sender, updatedSender);
          };
        };
      };
    };
  };

  public shared ({ caller }) func declineFriendRequest(sender : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can decline friend requests");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Your profile was not found!") };
      case (?receiverProfile) {
        if (not existsInArray(receiverProfile.friendRequests, sender, Principal.equal)) {
          Runtime.trap("Friend request not found!");
        };

        let updatedFriendRequests = receiverProfile.friendRequests.filter(func(p) { not Principal.equal(p, sender) });
        let updatedProfile : UserProfile = {
          receiverProfile with friendRequests = updatedFriendRequests;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == target) {
      Runtime.trap("You cannot follow yourself.");
    };

    switch (userProfiles.get(target)) {
      case (null) {
        Runtime.trap("Target profile not found.");
      };
      case (?_) {
        let callerProfile = switch (userProfiles.get(caller)) {
          case (null) {
            Runtime.trap("Your profile was not found.");
          };
          case (?profile) { profile };
        };

        if (existsInArray(callerProfile.following, target, Principal.equal)) {
          Runtime.trap("Already following this user.");
        };

        let updatedFollowing = callerProfile.following.concat([target]);
        let updatedCallerProfile : UserProfile = {
          callerProfile with following = updatedFollowing
        };
        userProfiles.add(caller, updatedCallerProfile);

        switch (userProfiles.get(target)) {
          case (null) {};
          case (?targetProfile) {
            let targetFollowers = targetProfile.followers.concat([caller]);
            let updatedTarget : UserProfile = {
              targetProfile with followers = targetFollowers
            };
            userProfiles.add(target, updatedTarget);
          };
        };
      };
    };
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    if (caller == target) {
      Runtime.trap("You cannot unfollow yourself.");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Your profile was not found.");
      };
      case (?profile) { profile };
    };

    if (not existsInArray(callerProfile.following, target, Principal.equal)) {
      Runtime.trap("Not following this user.");
    };

    let updatedFollowing = callerProfile.following.filter(func(p) { not Principal.equal(p, target) });
    let updatedCallerProfile : UserProfile = {
      callerProfile with following = updatedFollowing
    };
    userProfiles.add(caller, updatedCallerProfile);

    switch (userProfiles.get(target)) {
      case (null) {};
      case (?targetProfile) {
        let targetFollowers = targetProfile.followers.filter(func(p) { not Principal.equal(p, caller) });
        let updatedTarget : UserProfile = {
          targetProfile with followers = targetFollowers
        };
        userProfiles.add(target, updatedTarget);
      };
    };
  };

  public shared ({ caller }) func logActivity(date : Text, steps : Nat, squats : Nat, pushups : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log activities");
    };

    let activity : ActivityLog = {
      date;
      steps;
      squats;
      pushups;
    };

    let userLogs = switch (activityLogs.get(caller)) {
      case (null) { List.empty<ActivityLog>() };
      case (?logs) { logs };
    };

    userLogs.add(activity);
    activityLogs.add(caller, userLogs);
  };

  public query ({ caller }) func getActivityLogsForCaller() : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access activity logs");
    };

    let logs = switch (activityLogs.get(caller)) {
      case (null) { List.empty<ActivityLog>() };
      case (?userLogs) { userLogs };
    };
    logs.toArray();
  };

  public query ({ caller }) func getActivityLogsForUser(user : Principal) : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access activity logs");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      switch (userProfiles.get(user)) {
        case (null) { Runtime.trap("User profile not found") };
        case (?profile) {
          if (not profile.activityPublic) {
            Runtime.trap("Unauthorized: User's activity is private");
          };
        };
      };
    };

    let logs = switch (activityLogs.get(user)) {
      case (null) { List.empty<ActivityLog>() };
      case (?userLogs) { userLogs };
    };
    logs.toArray();
  };

  public shared ({ caller }) func sendMessage(to : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    switch (userProfiles.get(to)) {
      case (null) { Runtime.trap("Recipient profile not found") };
      case (?_) {};
    };

    let message : Message = {
      sender = caller;
      receiver = to;
      timestamp = Time.now();
      content;
    };

    let convoKey1 = (caller, to);
    let convoKey2 = (to, caller);

    let messages1 = switch (messages.get(convoKey1)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };
    messages1.add(message);
    messages.add(convoKey1, messages1);

    let messages2 = switch (messages.get(convoKey2)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };
    messages2.add(message);
    messages.add(convoKey2, messages2);
  };

  public query ({ caller }) func getConversation(user : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access conversations");
    };

    let convoKey = (caller, user);
    let convoMessages = switch (messages.get(convoKey)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };
    convoMessages.toArray();
  };
};
