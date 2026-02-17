import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Char "mo:core/Char";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let signalFetchResults = Map.empty<Principal, SignalFetchResult>();

  public type UserProfile = {
    name : Text;
    accountId : ?Text;
    planTier : ?{ #Free; #Pro; #Whale };
    botPublicKey : ?Blob;
    bot_id : ?Text;
    timezone : ?Text;
    notificationsEnabled : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let botIdIndex = Map.empty<Text, Principal>();

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

    // Store the prior profile before overwriting
    let priorProfile = userProfiles.get(caller);

    // Save the new profile
    userProfiles.add(caller, profile);

    // Remove old mapping if the bot_id has changed
    switch (priorProfile) {
      case (?oldProfile) {
        switch (oldProfile.bot_id) {
          case (?oldBotId) {
            if (profile.bot_id != oldProfile.bot_id) {
              botIdIndex.remove(oldBotId);
            };
          };
          case (null) {};
        };
      };
      case (null) {};
    };

    // Add new mapping if a bot_id exists
    switch (profile.bot_id) {
      case (?botId) {
        botIdIndex.add(botId, caller);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func update_profile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    // Store the prior profile before overwriting
    let priorProfile = userProfiles.get(caller);

    // Save the new profile
    userProfiles.add(caller, profile);

    // Remove old mapping if the bot_id has changed
    switch (priorProfile) {
      case (?oldProfile) {
        switch (oldProfile.bot_id) {
          case (?oldBotId) {
            if (profile.bot_id != oldProfile.bot_id) {
              botIdIndex.remove(oldBotId);
            };
          };
          case (null) {};
        };
      };
      case (null) {};
    };

    // Add new mapping if a bot_id exists
    switch (profile.bot_id) {
      case (?botId) {
        botIdIndex.add(botId, caller);
      };
      case (null) {};
    };
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
    cyclesWarning : ?Text;
  };

  public query ({ caller }) func getHeartbeatData(_accountId : AccountId) : async HeartbeatData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view heartbeat data");
    };

    // Start with system defaults
    let cycles = 0; // TODO: Replace with actual cycle balance API when available.
    var botStatus : Status = #SUSPENDED;
    var lastHeartbeatAt : Time.Time = 0;
    var verifiedLicense : Bool = false;

    // Check for bot profile (from state, not hardcoded)
    switch (botProfiles.get(caller)) {
      case (?botProfile) {
        if (botProfile.uplinkStatus) {
          botStatus := #ACTIVE;
        };
        lastHeartbeatAt := botProfile.lastHeartbeat;

        switch (userProfiles.get(caller)) {
          case (?userProfile) {
            switch (userProfile.accountId) {
              case (?ai) {
                switch (licenses.get(ai)) {
                  case (?license) {
                    verifiedLicense := license.active;
                  };
                  case (null) { verifiedLicense := false };
                };
              };
              case (null) { verifiedLicense := false };
            };
          };
          case (null) { verifiedLicense := false };
        };
      };
      case (null) {
        botStatus := #SUSPENDED;
        lastHeartbeatAt := 0;
        verifiedLicense := false;
      };
    };

    var cyclesWarning : ?Text = null;
    if (cycles < 500_000_000_000) {
      cyclesWarning := ?("Low cycles: " # cycles.toText());
    };

    {
      cycles;
      lastHeartbeatAt;
      botStatus;
      verifiedLicense;
      cyclesWarning;
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

  public type BotProfile = {
    publicKey : ?Blob;
    botUrl : ?Text;
    lastHeartbeat : Time.Time;
    cyclesWarning : Bool;
    uplinkStatus : Bool;
  };

  let botProfiles = Map.empty<Principal, BotProfile>();

  public type Signal = {
    signalId : Text;
    price : Float;
    quantity : Nat;
    timestamp : Time.Time;
    direction : { #buy; #sell };
  };

  public type SignalFetchResult = {
    #ok : { statusCode : Nat; body : Text; timestamp : Int };
    #err : BotError;
  };

  public type BotError = {
    #FetchFailed : Text;
    #InvalidUrl : Text;
  };

  public type AuditEntry = {
    timestamp : Time.Time;
    action : Text;
    details : Text;
    principal : Principal;
  };

  let auditLog = Map.empty<Principal, [AuditEntry]>();
  let maxAuditEntries : Nat = 1000;

  public type UplinkStatus = {
    #EXECUTE;
    #STANDBY;
  };

  public query ({ caller }) func getBotProfile() : async ?BotProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bot profiles");
    };
    botProfiles.get(caller);
  };

  public shared ({ caller }) func registerBotPublicKey(publicKey : Blob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register bot keys");
    };

    let existingProfile = botProfiles.get(caller);
    let newProfile = switch (existingProfile) {
      case (?profile) {
        {
          publicKey = ?publicKey;
          botUrl = profile.botUrl;
          lastHeartbeat = profile.lastHeartbeat;
          cyclesWarning = profile.cyclesWarning;
          uplinkStatus = profile.uplinkStatus;
        };
      };
      case (null) {
        {
          publicKey = ?publicKey;
          botUrl = null;
          lastHeartbeat = Time.now();
          cyclesWarning = false;
          uplinkStatus = true;
        };
      };
    };
    botProfiles.add(caller, newProfile);
    addAuditEntry(caller, "REGISTER_BOT_KEY", "Bot public key registered");
  };

  public shared ({ caller }) func setBotUrl(url : Text) : async Result<Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#Unauthorized);
    };

    if (not url.startsWith(#text("https://"))) {
      return #err(#InvalidInput);
    };

    let existingProfile = botProfiles.get(caller);
    let newProfile = switch (existingProfile) {
      case (?profile) {
        {
          publicKey = profile.publicKey;
          botUrl = ?url;
          lastHeartbeat = profile.lastHeartbeat;
          cyclesWarning = profile.cyclesWarning;
          uplinkStatus = profile.uplinkStatus;
        };
      };
      case (null) {
        {
          publicKey = null;
          botUrl = ?url;
          lastHeartbeat = Time.now();
          cyclesWarning = false;
          uplinkStatus = true;
        };
      };
    };
    botProfiles.add(caller, newProfile);
    addAuditEntry(caller, "SET_BOT_URL", "Bot URL updated to: " # url);
    #ok("Bot URL updated successfully");
  };

  public shared ({ caller }) func toggle_uplink(state : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle uplink");
    };

    let existingProfile = botProfiles.get(caller);
    let newProfile = switch (existingProfile) {
      case (?profile) {
        {
          publicKey = profile.publicKey;
          botUrl = profile.botUrl;
          lastHeartbeat = profile.lastHeartbeat;
          cyclesWarning = profile.cyclesWarning;
          uplinkStatus = state;
        };
      };
      case (null) {
        {
          publicKey = null;
          botUrl = null;
          lastHeartbeat = Time.now();
          cyclesWarning = false;
          uplinkStatus = state;
        };
      };
    };
    botProfiles.add(caller, newProfile);
    let statusText = if (state) { "EXECUTE" } else { "STANDBY" };
    addAuditEntry(caller, "TOGGLE_UPLINK", "Uplink status changed to: " # statusText);
  };

  public func check_uplink(bot_id : Text, signature : Blob) : async UplinkStatus {
    let userPrincipal = switch (botIdIndex.get(bot_id)) {
      case (?principal) { principal };
      case (null) {
        Runtime.trap("Unknown bot ID: no user registered with this bot_id");
      };
    };

    let botProfile = switch (botProfiles.get(userPrincipal)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("No bot profile found for this bot ID") };
    };

    switch (botProfile.publicKey) {
      case (null) {
        Runtime.trap("Bot public key not registered. Complete the Connect Bot wizard first.");
      };
      case (?_) {};
    };

    if (signature.size() == 0) {
      Runtime.trap("Missing signature: signature blob cannot be empty. The Python bot must sign requests with its private key.");
    };

    // TODO Phase 2: Implement full Ed25519 signature verification

    if (botProfile.uplinkStatus) {
      #EXECUTE;
    } else {
      #STANDBY;
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchSignals() : async SignalFetchResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#FetchFailed("Unauthorized: Only authenticated users can fetch signals"));
    };

    switch (botProfiles.get(caller)) {
      case (?profile) {
        switch (profile.botUrl) {
          case (?url) {
            if (not url.startsWith(#text("https://"))) {
              return #err(#InvalidUrl("URL must start with https://"));
            };

            let response = await OutCall.httpGetRequest(url, [], transform);

            let updatedProfile = {
              publicKey = profile.publicKey;
              botUrl = profile.botUrl;
              lastHeartbeat = Time.now();
              cyclesWarning = profile.cyclesWarning;
              uplinkStatus = profile.uplinkStatus;
            };
            botProfiles.add(caller, updatedProfile);

            let snippetLength = if (response.size() <= 100) { response.size() } else { 100 };
            let bodyChars = response.toArray().sliceToArray(0, snippetLength);
            let bodySnippet = Text.fromArray(bodyChars);

            addAuditEntry(caller, "FETCH_SIGNALS", "Signals fetched: " # bodySnippet);

            #ok({
              statusCode = 200;
              body = response;
              timestamp = Time.now();
            });
          };
          case (null) { #err(#FetchFailed("No bot URL configured")) };
        };
      };
      case (null) { #err(#FetchFailed("No bot profile found")) };
    };
  };

  public query ({ caller }) func getAuditLog(limit : Nat) : async [AuditEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view audit logs");
    };

    switch (auditLog.get(caller)) {
      case (?entries) {
        let actualLimit = if (limit > entries.size()) { entries.size() } else { limit };
        entries.sliceToArray(0, actualLimit);
      };
      case (null) { [] };
    };
  };

  private func addAuditEntry(principal : Principal, action : Text, details : Text) {
    let entry : AuditEntry = {
      timestamp = Time.now();
      action;
      details;
      principal;
    };

    let existingEntries = switch (auditLog.get(principal)) {
      case (?entries) { entries };
      case (null) { [] };
    };

    let newEntries = if (existingEntries.size() >= maxAuditEntries) {
      let trimmed = existingEntries.sliceToArray(1, existingEntries.size());
      trimmed.concat([entry]);
    } else {
      existingEntries.concat([entry]);
    };

    auditLog.add(principal, newEntries);
  };

  public type SubscriptionTier = {
    id : Text;
    name : Text;
    maxBots : Nat;
    maxApiCalls : Nat;
    priceInCents : Nat;
    features : [Text];
    active : Bool;
  };

  let subscriptionTiers = Map.empty<Text, SubscriptionTier>();

  func initializeDefaultTiers() {
    if (subscriptionTiers.isEmpty()) {
      let defaultTiers : [(Text, SubscriptionTier)] = [
        (
          "free",
          {
            id = "free";
            name = "Paper Hand";
            maxBots = 1;
            maxApiCalls = 1000;
            priceInCents = 0;
            features = [
              "Read-only dashboard",
              "Delayed market data",
              "Basic analytics",
              "Community support",
            ];
            active = true;
          },
        ),
        (
          "pro",
          {
            id = "pro";
            name = "Diamond Hand";
            maxBots = 5;
            maxApiCalls = 50000;
            priceInCents = 5000;
            features = [
              "Real-time trading",
              "Live market data",
              "Advanced analytics",
              "Priority support"
            ];
            active = true;
          },
        ),
        (
          "whale",
          {
            id = "whale";
            name = "Whale";
            maxBots = 999999;
            maxApiCalls = 999999;
            priceInCents = 50000;
            features = [
              "Priority execution",
              "Dedicated support",
              "Custom strategies",
              "API access",
            ];
            active = true;
          },
        ),
      ];

      for ((id, tier) in defaultTiers.values()) {
        subscriptionTiers.add(id, tier);
      };
    };
  };

  initializeDefaultTiers();

  public query func list_tiers() : async Result<[SubscriptionTier]> {
    #ok(subscriptionTiers.values().toArray());
  };

  public query func get_tier(id : Text) : async Result<SubscriptionTier> {
    if (id.size() == 0) {
      return #err(#InvalidInput);
    };

    switch (subscriptionTiers.get(id)) {
      case (?tier) { #ok(tier) };
      case (null) { #err(#InvalidInput) };
    };
  };

  public shared ({ caller }) func create_tier(
    tier : SubscriptionTier
  ) : async Result<SubscriptionTier> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err(#Unauthorized);
    };
    if (tier.id.size() == 0) {
      return #err(#InvalidInput);
    };
    subscriptionTiers.add(tier.id, tier);
    #ok(tier);
  };

  public shared ({ caller }) func update_tier(
    id : Text,
    updated : SubscriptionTier
  ) : async Result<Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err(#Unauthorized);
    };
    if (id.size() == 0) {
      return #err(#InvalidInput);
    };
    switch (subscriptionTiers.get(id)) {
      case (?_) {
        subscriptionTiers.add(id, updated);
        #ok("Updated successfully");
      };
      case (null) { #err(#InvalidInput) };
    };
  };

  public shared ({ caller }) func toggle_tier_active(
    id : Text,
    active : Bool
  ) : async Result<Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err(#Unauthorized);
    };
    if (id.size() == 0) {
      return #err(#InvalidInput);
    };
    switch (subscriptionTiers.get(id)) {
      case (?tier) {
        let updated = {
          tier with active;
        };
        subscriptionTiers.add(id, updated);
        #ok("Tier status updated");
      };
      case (null) { #err(#InvalidInput) };
    };
  };

  //-------------------- Stripe integration ----------------------

  public type ShoppingItem = Stripe.ShoppingItem;
  public type StripeSessionStatus = Stripe.StripeSessionStatus;
  public type StripeConfiguration = Stripe.StripeConfiguration;

  var stripeConfig : ?StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };
};
