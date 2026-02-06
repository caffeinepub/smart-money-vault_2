# Phase 1: Backend Implementation Checklist

This document provides a granular, step-by-step checklist for implementing the Vault Canister backend logic. Each item is independently testable and maps to the requirements in the implementation plan.

---

## 🎯 Overview

**Goal**: Build a production-ready Motoko backend canister with SaaS & Security features including:
- User profile management with subscription tiers
- Bot authentication via Ed25519 signatures
- Audit logging for trade events
- Admin dashboard data aggregation

**Approach**: Incremental, atomic changes with backward compatibility preserved at each step.

---

## ✅ Checklist

### **Section 1: Documentation & Backward Compatibility**

#### REQ-68: Create Implementation Checklist Document
- [ ] **1.1** Create `PHASE1_BACKEND_IMPLEMENTATION_CHECKLIST.md` in repository root
- [ ] **1.2** Verify checklist maps 1:1 to requirements REQ-69 through REQ-89
- [ ] **1.3** Ensure each item is independently testable
- [ ] **1.4** Add acceptance criteria for each major section

#### REQ-69: Document Existing Public APIs
- [ ] **1.5** Add comment block in `backend/main.mo` listing all frontend-facing APIs
- [ ] **1.6** Document `getCallerUserProfile()` signature and behavior
- [ ] **1.7** Document `getUserProfile(user: Principal)` signature and behavior
- [ ] **1.8** Document `saveCallerUserProfile(profile: UserProfile)` signature and behavior
- [ ] **1.9** Document `getMyLicenseStatus()` signature and behavior
- [ ] **1.10** Document `getTradesPaginated(...)` signature and behavior
- [ ] **1.11** Add note: "These APIs must maintain backward-compatible Candid shapes"
- [ ] **1.12** Verify canister compiles after adding documentation

---

### **Section 2: Type System Foundation**

#### REQ-70: Extend UserProfile Type
- [ ] **2.1** Add `planTier` field to UserProfile as optional variant `?{ #Free; #Pro; #Whale }`
- [ ] **2.2** Add `botId` field to UserProfile as optional `?Text`
- [ ] **2.3** Add `botPublicKey` field to UserProfile as optional `?Blob`
- [ ] **2.4** Verify existing `name : Text` field remains unchanged
- [ ] **2.5** Verify existing `accountId : ?Text` field remains unchanged
- [ ] **2.6** Update migration logic to handle old profiles (set new fields to null)
- [ ] **2.7** Test canister compiles successfully
- [ ] **2.8** Test existing `saveCallerUserProfile` still works with old profile shape
- [ ] **2.9** Test existing `getCallerUserProfile` returns extended profile

#### REQ-71: Define Bot API Result Types
- [ ] **2.10** Define `Status` variant type: `{ #ACTIVE; #SUSPENDED }`
- [ ] **2.11** Define `Error` variant type with cases:
  - [ ] **2.11.a** `#Unauthorized`
  - [ ] **2.11.b** `#UnknownBotId`
  - [ ] **2.11.c** `#MissingBotKey`
  - [ ] **2.11.d** `#InvalidSignature`
  - [ ] **2.11.e** `#TimestampOutOfWindow`
  - [ ] **2.11.f** `#ReplayDetected`
  - [ ] **2.11.g** `#LicenseInactive`
  - [ ] **2.11.h** `#InvalidInput`
- [ ] **2.12** Define generic `Result<T>` type: `{ #ok : T; #err : Error }`
- [ ] **2.13** Verify canister compiles with new types
- [ ] **2.14** Add comment: "Use Result types instead of traps for expected failures"

#### REQ-72: Define Trade Data Structures
- [ ] **2.15** Define `TradeSide` variant: `{ #buy; #sell }`
- [ ] **2.16** Define `TradeData` record with fields:
  - [ ] **2.16.a** `symbol : Text`
  - [ ] **2.16.b** `price : Float`
  - [ ] **2.16.c** `side : TradeSide`
  - [ ] **2.16.d** `timestamp : Time.Time`
  - [ ] **2.16.e** `pnl : Float`
  - [ ] **2.16.f** `proofHash : Blob`
- [ ] **2.17** Define `AuditTradeEvent` record with fields:
  - [ ] **2.17.a** `bot_id : Text`
  - [ ] **2.17.b** `owner : Principal`
  - [ ] **2.17.c** `tradeData : TradeData`
  - [ ] **2.17.d** `timestamp : Time.Time` (event creation time)
- [ ] **2.18** Verify canister compiles with trade types
- [ ] **2.19** Add comment explaining difference between `tradeData.timestamp` (trade execution) and event `timestamp` (log creation)

---

### **Section 3: Data Storage & Indexing**

#### REQ-73: Create User Registry
- [ ] **3.1** Verify `userProfiles` map exists: `Map.Map<Principal, UserProfile>`
- [ ] **3.2** Mark `userProfiles` as stable variable
- [ ] **3.3** Add comment: "Primary registry mapping Principal to extended UserProfile"
- [ ] **3.4** Verify existing profile APIs use this registry
- [ ] **3.5** Test `getCallerUserProfile` reads from registry
- [ ] **3.6** Test `saveCallerUserProfile` writes to registry
- [ ] **3.7** Verify backward compatibility with existing frontend

#### REQ-74: Create Bot ID Index
- [ ] **3.8** Create `botIdIndex` stable map: `Map.Map<Text, Principal>`
- [ ] **3.9** Add comment: "Secondary index: bot_id -> owner Principal"
- [ ] **3.10** Document consistency rule: "When profile.botId changes, update this index"
- [ ] **3.11** Create helper function `lookupBotOwner(bot_id: Text) : ?Principal`
- [ ] **3.12** Verify canister compiles with index
- [ ] **3.13** Test index remains empty initially (no breaking changes)

#### REQ-75: Implement Bot ID Lookup Helper
- [ ] **3.14** Create function `getBotOwner(bot_id: Text) : Result<Principal, Error>`
- [ ] **3.15** Implement logic: query `botIdIndex` for bot_id
- [ ] **3.16** Return `#err(#UnknownBotId)` if not found
- [ ] **3.17** Return `#ok(principal)` if found
- [ ] **3.18** Add unit test comment showing expected behavior
- [ ] **3.19** Verify function compiles and is callable

#### REQ-76: Implement Profile Update with Index Maintenance
- [ ] **3.20** Create admin function `updateUserProfile(user: Principal, profile: UserProfile) : async ()`
- [ ] **3.21** Add caller authorization check: only admin can call
- [ ] **3.22** Implement logic to fetch old profile
- [ ] **3.23** If old profile has botId, remove from `botIdIndex`
- [ ] **3.24** If new profile has botId, add to `botIdIndex`
- [ ] **3.25** Update `userProfiles` map with new profile
- [ ] **3.26** Verify non-admin callers get authorization error
- [ ] **3.27** Test admin can update any user's profile
- [ ] **3.28** Test botId index stays consistent after updates

#### REQ-77: Update saveCallerUserProfile for Index Consistency
- [ ] **3.29** Modify `saveCallerUserProfile` to maintain botId index
- [ ] **3.30** Fetch caller's existing profile
- [ ] **3.31** If old botId exists, remove from index
- [ ] **3.32** If new botId exists, add to index
- [ ] **3.33** Save updated profile to registry
- [ ] **3.34** Test existing frontend calls still work
- [ ] **3.35** Test botId changes update index correctly
- [ ] **3.36** Verify backward compatibility (profiles without botId work)

---

### **Section 4: Signature Verification & Replay Protection**

#### REQ-78: Document Signature Encoding Specification
- [ ] **4.1** Add comment block titled "Bot API Signature Specification"
- [ ] **4.2** Document `validate_bot` encoding:
  - [ ] **4.2.a** Input fields: `bot_id`, `timestamp`, `nonce`
  - [ ] **4.2.b** Encoding: `bot_id || timestamp.toText() || nonce` as UTF-8 bytes
  - [ ] **4.2.c** Signature algorithm: Ed25519
- [ ] **4.3** Document `log_trade` encoding:
  - [ ] **4.3.a** Input fields: `bot_id`, `TradeData`, `nonce`, `timestamp`
  - [ ] **4.3.b** Encoding: `bot_id || symbol || price.toText() || side || tradeTimestamp.toText() || pnl.toText() || proofHash || nonce || timestamp.toText()` as UTF-8 bytes
  - [ ] **4.3.c** Signature algorithm: Ed25519
- [ ] **4.4** Add Python pseudocode example for client-side signing
- [ ] **4.5** Verify documentation is precise enough for off-chain implementation

#### REQ-79: Implement Signature Verification Helper
- [ ] **4.6** Create helper function `verifySignature(message: Blob, signature: Blob, publicKey: Blob) : Bool`
- [ ] **4.7** Add comment: "TODO: Replace with actual Ed25519 verification (ic-crypto or equivalent)"
- [ ] **4.8** Implement placeholder logic (returns true for now)
- [ ] **4.9** Add comment: "Production: Use Ed25519.verify(publicKey, message, signature)"
- [ ] **4.10** Create wrapper `verifyBotSignature(bot_id: Text, message: Blob, signature: Blob) : Result<(), Error>`
- [ ] **4.11** Implement logic: lookup bot owner via `getBotOwner`
- [ ] **4.12** Return `#err(#UnknownBotId)` if bot not found
- [ ] **4.13** Fetch user profile and extract `botPublicKey`
- [ ] **4.14** Return `#err(#MissingBotKey)` if key is null
- [ ] **4.15** Call `verifySignature` with message, signature, and key
- [ ] **4.16** Return `#err(#InvalidSignature)` if verification fails
- [ ] **4.17** Return `#ok(())` if verification succeeds
- [ ] **4.18** Verify function compiles

#### REQ-80: Implement Replay Protection
- [ ] **4.19** Create stable map `usedNonces : Map.Map<Text, Time.Time>`
- [ ] **4.20** Add comment: "Replay protection: stores nonce -> first-seen timestamp"
- [ ] **4.21** Define constant `TIMESTAMP_WINDOW_NS : Int = 60_000_000_000` (60 seconds)
- [ ] **4.22** Create helper `checkReplayProtection(nonce: Text, timestamp: Time.Time) : Result<(), Error>`
- [ ] **4.23** Implement logic: get current time via `Time.now()`
- [ ] **4.24** Calculate `timeDiff = currentTime - timestamp`
- [ ] **4.25** Return `#err(#TimestampOutOfWindow)` if `timeDiff < 0` or `timeDiff > TIMESTAMP_WINDOW_NS`
- [ ] **4.26** Check if nonce exists in `usedNonces`
- [ ] **4.27** Return `#err(#ReplayDetected)` if nonce already used
- [ ] **4.28** Add nonce to `usedNonces` with current timestamp
- [ ] **4.29** Return `#ok(())`
- [ ] **4.30** Add comment: "TODO: Implement nonce cleanup for old entries (>5 min)"
- [ ] **4.31** Verify replay protection persists across upgrades (stable variable)
- [ ] **4.32** Test same nonce cannot be reused

---

### **Section 5: Bot Gatekeeper API**

#### REQ-81: Implement validate_bot Function
- [ ] **5.1** Create public function `validate_bot(bot_id: Text, signature: Blob, nonce: Text, timestamp: Time.Time) : async Result<Status, Error>`
- [ ] **5.2** Add comment: "Bot API: License validation with signature verification"
- [ ] **5.3** Construct message bytes per specification (REQ-78)
- [ ] **5.4** Call `checkReplayProtection(nonce, timestamp)`
- [ ] **5.5** Return error if replay check fails
- [ ] **5.6** Call `verifyBotSignature(bot_id, message, signature)`
- [ ] **5.7** Return error if signature verification fails
- [ ] **5.8** Check subscription status (mock: always return `#ACTIVE` for now)
- [ ] **5.9** Add comment: "TODO: Replace with real subscription check"
- [ ] **5.10** Return `#ok(#ACTIVE)` on success
- [ ] **5.11** Verify function compiles
- [ ] **5.12** Test unknown bot_id returns `#err(#UnknownBotId)`
- [ ] **5.13** Test invalid timestamp returns `#err(#TimestampOutOfWindow)`
- [ ] **5.14** Test replay attempt returns `#err(#ReplayDetected)`
- [ ] **5.15** Test valid request returns `#ok(#ACTIVE)`

---

### **Section 6: Audit Log Storage**

#### REQ-82: Create Audit Log Storage
- [ ] **6.1** Create stable variable `audit_logs : Buffer.Buffer<AuditTradeEvent>`
- [ ] **6.2** Initialize buffer in actor initialization
- [ ] **6.3** Add comment: "Append-only audit log for all trade events"
- [ ] **6.4** Verify buffer persists across upgrades
- [ ] **6.5** Add comment: "No public API for mutation; append via log_trade only"
- [ ] **6.6** Test canister compiles with audit log storage

#### REQ-83: Implement Audit Log Query API
- [ ] **6.7** Create query function `getAuditLogs(start: Nat, limit: Nat, bot_id: ?Text, startTime: ?Time.Time, endTime: ?Time.Time) : async [AuditTradeEvent]`
- [ ] **6.8** Add authorization check: only admin or bot owner can query
- [ ] **6.9** Implement pagination: slice buffer from `start` to `start + limit`
- [ ] **6.10** Implement bot_id filter if provided
- [ ] **6.11** Implement time range filter if provided
- [ ] **6.12** Enforce max limit (e.g., 100 events per query)
- [ ] **6.13** Return filtered and paginated events
- [ ] **6.14** Test pagination works correctly
- [ ] **6.15** Test filters work correctly
- [ ] **6.16** Test unauthorized callers get error

---

### **Section 7: Trade Logging API**

#### REQ-84: Implement log_trade Function
- [ ] **7.1** Create public function `log_trade(bot_id: Text, trade_data: TradeData, signature: Blob, nonce: Text, timestamp: Time.Time) : async Result<(), Error>`
- [ ] **7.2** Add comment: "Bot API: Submit trade event with signature verification"
- [ ] **7.3** Construct message bytes per specification (REQ-78)
- [ ] **7.4** Call `checkReplayProtection(nonce, timestamp)`
- [ ] **7.5** Return error if replay check fails
- [ ] **7.6** Call `verifyBotSignature(bot_id, message, signature)`
- [ ] **7.7** Return error if signature verification fails
- [ ] **7.8** Lookup bot owner via `getBotOwner(bot_id)`
- [ ] **7.9** Return error if bot not found
- [ ] **7.10** Create `AuditTradeEvent` with bot_id, owner, trade_data, and current timestamp
- [ ] **7.11** Append event to `audit_logs` buffer
- [ ] **7.12** Return `#ok(())`
- [ ] **7.13** Verify function compiles
- [ ] **7.14** Test unknown bot_id returns error
- [ ] **7.15** Test invalid signature returns error
- [ ] **7.16** Test replay attempt returns error
- [ ] **7.17** Test valid trade is logged and queryable via `getAuditLogs`

---

### **Section 8: Admin Dashboard Data**

#### REQ-85: Implement get_stats Function
- [ ] **8.1** Create query function `get_stats(user_principal: Principal) : async Result<StatsResponse, Error>`
- [ ] **8.2** Define `StatsResponse` type with fields:
  - [ ] **8.2.a** `totalPnL : Float`
  - [ ] **8.2.b** `winRate : Float`
  - [ ] **8.2.c** `subscriptionStatus : Status`
  - [ ] **8.2.d** `totalTrades : Nat`
- [ ] **8.3** Add authorization check: caller must be admin or querying self
- [ ] **8.4** Return `#err(#Unauthorized)` if unauthorized
- [ ] **8.5** Filter `audit_logs` for events where `owner == user_principal`
- [ ] **8.6** Calculate `totalPnL` by summing `event.tradeData.pnl`
- [ ] **8.7** Calculate `totalTrades` as count of filtered events
- [ ] **8.8** Calculate `winRate`:
  - [ ] **8.8.a** Count trades where `pnl > 0`
  - [ ] **8.8.b** Divide by `totalTrades`
  - [ ] **8.8.c** Handle zero-trade case (return 0.0)
- [ ] **8.9** Set `subscriptionStatus` to `#ACTIVE` (mocked)
- [ ] **8.10** Return `#ok(statsResponse)`
- [ ] **8.11** Test non-admin cannot query other users
- [ ] **8.12** Test admin can query any user
- [ ] **8.13** Test stats calculations are correct
- [ ] **8.14** Test zero-trade case returns valid response

---

### **Section 9: Upgrade Safety**

#### REQ-86: Implement Upgrade Hooks
- [ ] **9.1** Verify `system preupgrade` hook exists
- [ ] **9.2** Verify `system postupgrade` hook exists
- [ ] **9.3** Test all stable variables are preserved:
  - [ ] **9.3.a** `userProfiles`
  - [ ] **9.3.b** `botIdIndex`
  - [ ] **9.3.c** `audit_logs`
  - [ ] **9.3.d** `usedNonces`
  - [ ] **9.3.e** `licenses`
  - [ ] **9.3.f** `trades`
- [ ] **9.4** Perform test upgrade and verify data integrity
- [ ] **9.5** Verify frontend APIs still work after upgrade
- [ ] **9.6** Verify bot APIs still work after upgrade

---

### **Section 10: Legacy API Compatibility**

#### REQ-87: Preserve Frontend-Facing APIs
- [ ] **10.1** Verify `getCallerUserProfile` signature unchanged
- [ ] **10.2** Verify `getUserProfile` signature unchanged
- [ ] **10.3** Verify `saveCallerUserProfile` signature unchanged
- [ ] **10.4** Verify `getMyLicenseStatus` signature unchanged
- [ ] **10.5** Verify `getTradesPaginated` signature unchanged
- [ ] **10.6** Test existing frontend code works without changes
- [ ] **10.7** Verify Candid interface is backward compatible

#### REQ-88: Handle Legacy Bot API Transition
- [ ] **10.8** Identify legacy bot endpoints (if any)
- [ ] **10.9** Document migration path from legacy to new bot APIs
- [ ] **10.10** Add deprecation warnings to legacy endpoints
- [ ] **10.11** Ensure legacy endpoints don't use global `botPublicKey` model
- [ ] **10.12** Test both legacy and new bot APIs work during transition

---

### **Section 11: Error Handling & Production Readiness**

#### REQ-89: Replace Traps with Result Types
- [ ] **11.1** Audit all bot-facing functions for `Runtime.trap` calls
- [ ] **11.2** Replace expected failure traps with `#err(...)` returns
- [ ] **11.3** Keep traps only for unexpected/critical failures
- [ ] **11.4** Verify `validate_bot` returns errors, not traps
- [ ] **11.5** Verify `log_trade` returns errors, not traps
- [ ] **11.6** Test error responses are machine-readable
- [ ] **11.7** Document error codes for bot client implementation

#### Final Verification
- [ ] **11.8** Run full canister compilation
- [ ] **11.9** Deploy to local replica
- [ ] **11.10** Test all frontend features work
- [ ] **11.11** Test all bot APIs work with mock signatures
- [ ] **11.12** Verify no regressions in existing functionality
- [ ] **11.13** Document any remaining TODOs for Phase 2

---

## 📊 Progress Tracking

**Total Items**: 189 atomic checkboxes  
**Completed**: 0  
**In Progress**: 0  
**Blocked**: 0  

---

## 🔗 Mapping to Requirements

| Requirement | Checklist Items | Status |
|-------------|-----------------|--------|
| REQ-68 | 1.1 - 1.4 | ⬜ Not Started |
| REQ-69 | 1.5 - 1.12 | ⬜ Not Started |
| REQ-70 | 2.1 - 2.9 | ⬜ Not Started |
| REQ-71 | 2.10 - 2.14 | ⬜ Not Started |
| REQ-72 | 2.15 - 2.19 | ⬜ Not Started |
| REQ-73 | 3.1 - 3.7 | ⬜ Not Started |
| REQ-74 | 3.8 - 3.13 | ⬜ Not Started |
| REQ-75 | 3.14 - 3.19 | ⬜ Not Started |
| REQ-76 | 3.20 - 3.28 | ⬜ Not Started |
| REQ-77 | 3.29 - 3.36 | ⬜ Not Started |
| REQ-78 | 4.1 - 4.5 | ⬜ Not Started |
| REQ-79 | 4.6 - 4.18 | ⬜ Not Started |
| REQ-80 | 4.19 - 4.32 | ⬜ Not Started |
| REQ-81 | 5.1 - 5.15 | ⬜ Not Started |
| REQ-82 | 6.1 - 6.6 | ⬜ Not Started |
| REQ-83 | 6.7 - 6.16 | ⬜ Not Started |
| REQ-84 | 7.1 - 7.17 | ⬜ Not Started |
| REQ-85 | 8.1 - 8.14 | ⬜ Not Started |
| REQ-86 | 9.1 - 9.6 | ⬜ Not Started |
| REQ-87 | 10.1 - 10.7 | ⬜ Not Started |
| REQ-88 | 10.8 - 10.12 | ⬜ Not Started |
| REQ-89 | 11.1 - 11.13 | ⬜ Not Started |

---

## 🧪 Testing Strategy

Each checklist item should be verified with:

1. **Compilation Test**: Canister compiles without errors
2. **Unit Test**: Individual function behaves as expected
3. **Integration Test**: Function works with related components
4. **Regression Test**: Existing functionality still works
5. **Upgrade Test**: State persists across canister upgrades

---

## 📝 Notes

- **Atomic Steps**: Each checkbox represents a single, testable change
- **Independence**: Items can be completed in order without dependencies on future items
- **Backward Compatibility**: Every step preserves existing API contracts
- **Incremental Deployment**: Canister can be deployed after completing any section
- **Documentation First**: Type definitions and specs before implementation

---

## 🚀 Next Steps

1. Start with Section 1 (Documentation)
2. Complete each checkbox sequentially
3. Test after each section
4. Deploy incrementally to staging environment
5. Gather feedback before moving to next section

---

**Last Updated**: February 5, 2026  
**Version**: 1.0  
**Status**: Ready for Implementation
