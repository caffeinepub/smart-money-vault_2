import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    licenses : Map.Map<Text, OldLicense>;
    trades : Map.Map<Text, OldTrade>;
    usedNonces : Map.Map<Text, Time.Time>;
    botProfiles : Map.Map<Principal, OldBotProfile>;
    auditLog : Map.Map<Principal, [OldAuditEntry]>;
  };

  type OldUserProfile = {
    name : Text;
    accountId : ?Text;
    planTier : ?{ #Free; #Pro; #Whale };
    botPublicKey : ?Blob;
    bot_id : ?Text;
    timezone : ?Text;
    notificationsEnabled : Bool;
  };

  type OldLicense = {
    active : Bool;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
    revokedAt : ?Time.Time;
  };

  type OldTrade = {
    tradeId : Text;
    accountId : Text;
    side : { #buy; #sell };
    instrument : Text;
    size : Float;
    entryPrice : Float;
    entryTimestamp : Time.Time;
    exitPrice : ?Float;
    exitTimestamp : ?Time.Time;
  };

  type OldBotProfile = {
    publicKey : ?Blob;
    botUrl : ?Text;
    lastHeartbeat : Time.Time;
    cyclesWarning : Bool;
    uplinkStatus : Bool;
  };

  type OldAuditEntry = {
    timestamp : Time.Time;
    action : Text;
    details : Text;
    principal : Principal;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    licenses : Map.Map<Text, OldLicense>;
    trades : Map.Map<Text, OldTrade>;
    usedNonces : Map.Map<Text, Time.Time>;
    botProfiles : Map.Map<Principal, OldBotProfile>;
    auditLog : Map.Map<Principal, [OldAuditEntry]>;
    tiersMap : Map.Map<Text, NewTier>;
  };

  type NewTier = {
    id : Text;
    name : Text;
    maxBots : ?Nat;
    maxApiCalls : ?Nat;
    priceInCents : Nat;
    features : [Text];
    active : Bool;
  };

  public func run(old : OldActor) : NewActor {
    let initialTiers = Map.empty<Text, NewTier>();

    let freeTier : NewTier = {
      id = "free";
      name = "Paper Hand";
      maxBots = ?1;
      maxApiCalls = ?1000;
      priceInCents = 0;
      features = [
        "Basic strategy access",
        "Limited bots",
        "Entry-level support",
      ];
      active = true;
    };

    let proTier : NewTier = {
      id = "pro";
      name = "Diamond Hand";
      maxBots = ?5;
      maxApiCalls = ?50000;
      priceInCents = 5000;
      features = [
        "Advanced strategies",
        "Unlimited bots",
        "Premium features",
      ];
      active = true;
    };

    let whaleTier : NewTier = {
      id = "whale";
      name = "Whale";
      maxBots = null;
      maxApiCalls = null;
      priceInCents = 50000;
      features = [
        "Exclusive access",
        "Unlimited everything",
        "Direct support",
      ];
      active = true;
    };

    initialTiers.add("free", freeTier);
    initialTiers.add("pro", proTier);
    initialTiers.add("whale", whaleTier);

    {
      old with
      tiersMap = initialTiers
    };
  };
};
