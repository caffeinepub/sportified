import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
    selectedSport : {
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
    activityPublic : Bool;
    friendRequests : [Principal];
    friends : [Principal];
    following : [Principal];
    followers : [Principal];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    // Other state remains unchanged
  };

  type NewUserProfile = {
    name : Text;
    age : Nat;
    fitnessGoals : Text;
    selectedSport : {
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
    activityPublic : Bool;
    friendRequests : [Principal];
    friends : [Principal];
    following : [Principal];
    followers : [Principal];
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    // Other state remains unchanged
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_, oldProfile) {
        {
          oldProfile with
          age = 0; // Default age for migrated profiles
          fitnessGoals = "not set"; // Default goals for migrated profiles
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
