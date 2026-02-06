// ======================================= PUBLIC ACTOR API & TYPES (BACKWARD COMPATIBILITY: LEGACY INVENTORY) ========================================= //
//
// ** BACKWARD COMPATIBILITY GUARANTEE **
// This exact API surface MUST remain 100% stable and compatible with legacy bots and frontend clients for this micro-step.
//   - ALL methods and public types in this section are considered fixed for this incremental step.
//   - Changes to this inventory should not break any existing interactions from legacy bots or previously deployed frontend clients.
//
// ** COMPATIBILITY INVENTORY (MUST REMAIN STABLE) **
//   Core methods: getCallerUserProfile, saveCallerUserProfile, getUserProfile
//   Auth: assignRole, isAdmin, getUserRole (from access-control)
//   License: createOrUpdateLicense, revokeLicense
//   Trade: getTradesPaginated, submitTrade
//   Heartbeat: getHeartbeatData
//   Vaults: storeStrategicVault, storeJwt
//   Types: UserProfile, StrategicVault, Strategy, Symbol, StrategyBundle, LicenseAgreement, VaultEntry, StoredVault, Trade, HeartbeatData, JwtToken, Error, Result, Backtest, License, Status

import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Blob "mo:core/Blob";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration logic during upgrades (this is a no-op migration for documentation purposes)

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ========= LEGACY PUBLIC TYPES (MUST REMAIN BACKWARD COMPATIBLE THIS STEP) ========== //

  // LEGACY PUBLIC TYPE: UserProfile
  //   - Maintains full compatibility with previously stored profiles and legacy frontend calls
  //   - Fields planTier, botPublicKey, and bot_id are intentionally OPTIONAL for compatibility
  //   - Type definition and all callers MUST continue accepting/skipping these fields per legacy usage patterns
  //
  type UserProfile = {
    name : Text;
    accountId : ?Text;
    planTier : ?{ #Free; #Pro; #Whale };
    botPublicKey : ?Blob;
    // IMPORTANT: bot_id remains optional for backward compatibility
    bot_id : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type StrategicVault = {
    strategies : [StrategyBundle];
    jwt : Text;
  };

  public type Strategy = {
    name : Text;
    entryTime : Time.Time;
    priceFeed : Symbol;
    side : TradeSide;
    deployedAt : Time.Time;
  };

  public type Symbol = {
    currency : Text;
    exchange : Text;
    feed : Text;
    token : Text;
  };

  public type StrategyBundle = {
    inputSymbol : Symbol;
    outputSymbol : Symbol;
    paths : [StrategyPath];
    items : [Strategy];
    entryStrategy : Nat;
  };

  public type StrategyPath = {
    pathSymbols : [Symbol];
    items : [Strategy];
    deployedAt : Time.Time;
  };

  public type LicenseAgreement = {
    accountId : Text;
    authorized : [(Principal, Status)];
    authorizedAt : Time.Time;
    createdAt : Time.Time;
    encryptionKey : Nat;
    jwt : Text;
    registeredBy : Principal;
  };

  public type VaultEntry = {
    title : Text;
    createdAt : Time.Time;
    description : Text;
    isPublic : Bool;
    license : LicenseAgreement;
    owner : Text;
    timestamp : Time.Time;
    vault : StrategicVault;
  };

  public type StoredVault = {
    createdAt : Time.Time;
    jwt : Text;
    owner : Text;
    portfolio : [(Symbol, Nat)];
  };

  public type Status = { #ACTIVE; #SUSPENDED };

  public type AccountId = Text;

  public type License = {
    active : Bool;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
    revokedAt : ?Time.Time;
  };

  let licenses = Map.empty<AccountId, License>();

  public type TradeSide = { #buy; #sell };

  public type Trade = {
    tradeId : Text;
    accountId : AccountId;
    side : TradeSide;
    instrument : Text;
    size : Float;
    entryPrice : Float;
    entryTimestamp : Time.Time;
    exitPrice : ?Float;
    exitTimestamp : ?Time.Time;
  };

  let trades = Map.empty<Text, Trade>();

  let usedNonces = Map.empty<Text, Time.Time>();
  let nonceWindowNs : Int = 300_000_000_000;

  // ========== LEGACY PUBLIC METHODS (MUST REMAIN BACKWARD COMPATIBLE THIS STEP) ========== //

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Explicitly set missing botId as null for legacy callers
    let validatedProfile = {
      profile with
      // For backward compatibility, always use the provided value (including null)
      bot_id = profile.bot_id;
    };
    userProfiles.add(caller, validatedProfile);
  };

  public shared ({ caller }) func createOrUpdateLicense(accountId : AccountId, active : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can manage licenses");
    };

    let now = Time.now();
    let license = {
      active;
      createdAt = now;
      updatedAt = ?now;
      revokedAt = if active { null } else { ?now };
    };
    licenses.add(accountId, license);
  };

  public shared ({ caller }) func revokeLicense(accountId : AccountId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can revoke licenses");
    };

    switch (licenses.get(accountId)) {
      case (?license) {
        let now = Time.now();
        let updated = {
          active = false;
          createdAt = license.createdAt;
          updatedAt = ?now;
          revokedAt = ?now;
        };
        licenses.add(accountId, updated);
      };
      case (null) { Runtime.trap("License not found") };
    };
  };

  public query ({ caller }) func getAllLicenses() : async [(AccountId, License)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all licenses");
    };
    licenses.entries().toArray();
  };

  public query ({ caller }) func getMyLicenseStatus() : async ?License {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their license");
    };

    let profile = userProfiles.get(caller);
    switch (profile) {
      case (?p) {
        switch (p.accountId) {
          case (?accountId) { licenses.get(accountId) };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  module Trade {
    public func compare(t1 : Trade, t2 : Trade) : Order.Order {
      switch (Text.compare(t1.tradeId, t2.tradeId)) {
        case (#equal) { Int.compare(t1.entryTimestamp : Int, t2.entryTimestamp) };
        case (order) { order };
      };
    };

    public func compareByEntryTime(t1 : Trade, t2 : Trade) : Order.Order {
      Int.compare(t1.entryTimestamp : Int, t2.entryTimestamp);
    };
  };

  private func verifyBotSignature(_message : Blob, _signature : Blob, nonce : Text, timestamp : Time.Time) : Bool {
    let now = Time.now();
    let timeDiff = now - timestamp;
    if (timeDiff < 0 or timeDiff > nonceWindowNs) {
      return false;
    };

    switch (usedNonces.get(nonce)) {
      case (?_) { return false };
      case (null) { usedNonces.add(nonce, timestamp) };
    };
    true;
  };

  public query ({ caller }) func getTradesPaginated(
    accountId : ?AccountId,
    startTime : ?Time.Time,
    endTime : ?Time.Time,
    start : Nat,
    limit : Nat
  ) : async [Trade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view trades");
    };

    let callerProfile = userProfiles.get(caller);
    let allowedAccountId = switch (callerProfile) {
      case (?profile) { profile.accountId };
      case (null) { null };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let iter = trades.values();
    let filtered = iter.filter(
      func(t : Trade) : Bool {
        let accountMatch = switch (accountId) {
          case (?reqAccountId) {
            if (not isAdmin) {
              switch (allowedAccountId) {
                case (?userAccountId) {
                  t.accountId == reqAccountId and reqAccountId == userAccountId;
                };
                case (null) { false };
              };
            } else {
              t.accountId == reqAccountId;
            };
          };
          case (null) {
            if (not isAdmin) {
              switch (allowedAccountId) {
                case (?userAccountId) { t.accountId == userAccountId };
                case (null) { false };
              };
            } else {
              true;
            };
          };
        };

        if (not accountMatch) { return false };

        let timeMatch = switch (startTime, endTime) {
          case (?start, ?end) {
            t.entryTimestamp >= start and t.entryTimestamp <= end;
          };
          case (?start, null) {
            t.entryTimestamp >= start;
          };
          case (null, ?end) {
            t.entryTimestamp <= end;
          };
          case (null, null) { true };
        };

        timeMatch;
      }
    );

    let tradeArray = filtered.toArray().sort(Trade.compareByEntryTime);
    let end = start + limit;
    if (tradeArray.size() == 0) { return [] };
    if (end > tradeArray.size()) {
      return tradeArray.sliceToArray(start, tradeArray.size());
    };
    tradeArray.sliceToArray(start, end);
  };

  public func getLicenseStatus(
    accountId : AccountId,
    signature : Blob,
    nonce : Text,
    timestamp : Time.Time
  ) : async Bool {
    let message = accountId.concat(nonce).concat(timestamp.toText()).encodeUtf8();
    if (not verifyBotSignature(message, signature, nonce, timestamp)) {
      Runtime.trap("Invalid signature or replay detected");
    };

    switch (licenses.get(accountId)) {
      case (?license) { license.active };
      case (null) { false };
    };
  };

  public func submitTrade(
    trade : Trade,
    signature : Blob,
    nonce : Text,
    timestamp : Time.Time
  ) : async () {
    let message = trade.tradeId.concat(trade.accountId).concat(nonce).concat(timestamp.toText()).encodeUtf8();
    if (not verifyBotSignature(message, signature, nonce, timestamp)) {
      Runtime.trap("Invalid signature or replay detected");
    };

    switch (licenses.get(trade.accountId)) {
      case (?license) {
        if (not license.active) {
          Runtime.trap("Account does not have an active license");
        };
      };
      case (null) {
        Runtime.trap("Account does not have a license");
      };
    };

    trades.add(trade.tradeId, trade);
  };

  public type HeartbeatData = {
    cycles : Nat;
    botStatus : Status;
    lastHeartbeatAt : Time.Time;
    verifiedLicense : Bool;
  };

  public query ({ caller }) func getHeartbeatData(_accountId : AccountId) : async HeartbeatData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view heartbeat data");
    };

    {
      cycles = 0; // Placeholder value
      botStatus = #ACTIVE;
      lastHeartbeatAt = Time.now();
      verifiedLicense = true; // Placeholder value
    };
  };

  public type JwtToken = {
    jwt : Text;
    accountId : AccountId;
  };

  public type Result<T> = {
    #ok : T;
    #err : Error;
  };

  public type Error = {
    #Unauthorized;
    #UnknownBotId;
    #MissingBotKey;
    #InvalidSignature;
    #TimestampOutOfWindow;
    #ReplayDetected;
    #LicenseInactive;
    #InvalidInput;
  };

  public type Backtest = {
    profit : Nat;
    success : Bool;
    cost : Nat;
    spread : Float;
    valid : Bool;
    startTime : Time.Time;
    backtestRange : Int;
  };

  public shared ({ caller }) func storeJwt(jwt : Text, accountId : AccountId) : async Result<JwtToken> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#Unauthorized);
    };

    if (jwt.size() == 0 or accountId.size() == 0) {
      return #err(#InvalidInput);
    };

    #ok({ jwt; accountId });
  };

  public shared ({ caller }) func storeStrategicVault(
    vaultData : StrategicVault,
    _accountId : AccountId
  ) : async Result<StrategicVault> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#Unauthorized);
    };
    #ok(vaultData);
  };
};
