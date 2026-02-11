import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old UserProfile type without new fields
  type OldUserProfile = {
    name : Text;
    accountId : ?Text;
    planTier : ?{ #Free; #Pro; #Whale };
    botPublicKey : ?Blob;
    bot_id : ?Text;
  };

  // Old actor with only userProfiles (other types omitted)
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New UserProfile with added fields
  type NewUserProfile = {
    name : Text;
    accountId : ?Text;
    planTier : ?{ #Free; #Pro; #Whale };
    botPublicKey : ?Blob;
    bot_id : ?Text;
    timezone : ?Text;
    notificationsEnabled : Bool;
  };

  // New actor with updated UserProfile type
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          oldProfile with
          timezone = null;
          notificationsEnabled = true;
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
