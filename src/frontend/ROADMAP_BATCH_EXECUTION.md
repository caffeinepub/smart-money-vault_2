# Smart Money Vault - Roadmap Batch & Step Execution Plan

**Phases 3–8 Implementation Checklist**

This document provides a detailed, step-by-step execution plan for implementing roadmap Phases 3–8 of the Smart Money Vault project. Each phase is broken down into explicit batches with independently testable steps written as imperative statements.

---

## Important Constraints

**Immutable Frontend Paths** (DO NOT MODIFY):
- `frontend/src/hooks/useInternetIdentity.ts`
- `frontend/src/hooks/useActor.ts`
- `frontend/src/main.tsx`
- `frontend/src/components/ui/*` (entire directory)

**Backend Architecture**:
- Single-actor architecture (all Motoko logic in `backend/main.mo`)
- Only additive backend changes allowed
- Preserve legacy public API surface

---

## Roadmap Item Mapping

This plan implements the following roadmap items from `project_state.json`:

- **AR-3**: Phase 3 - Connect Wizard
- **AR-4**: Phase 3 - Settings Page
- **AR-5**: Phase 3 - Key Generation (Ed25519)
- **AR-6**: Phase 3 - Public Key Registration
- **AR-7**: Phase 3 - SaaS Subscription Tiers
- **AR-8**: Phase 4 - Vault Backend Trading Engine
- **AR-9**: Phase 5 - Command Center UI
- **AR-10**: Phase 6 - Bot-Side Enhancements
- **AR-11**: Phase 7 - Multi-Bot, Multi-User Architecture
- **AR-12**: Phase 8 - Institutional Hardening

---

## Phase 3: Connect Wizard (AR-3 through AR-7)

**Goal**: Enable users to connect their trading bots to the vault through a guided wizard, manage settings, and select subscription tiers.

### Batch 3.1: Settings Page Foundation

- [ ] Create `frontend/src/screens/SettingsScreen.tsx` with tabbed interface
- [ ] Add "Settings" navigation link to `DashboardHeader.tsx`
- [ ] Implement tab navigation between "Connect Bot" and "Subscription" panels
- [ ] Apply glassmorphism styling consistent with Cupertino Quant design system
- [ ] Verify Settings screen is accessible from authenticated dashboard
- [ ] Test tab switching behavior without page reload

### Batch 3.2: Connect Bot Panel - Status Display

- [ ] Create `frontend/src/components/settings/ConnectBotPanel.tsx`
- [ ] Display current bot connection status (connected/not connected)
- [ ] Show linked public key (first 8 and last 8 characters) when available
- [ ] Display configured bot URL when available
- [ ] Add "Connect Bot" button that opens wizard modal
- [ ] Fetch bot profile data using `getBotProfile()` backend method
- [ ] Create `useGetBotProfile` React Query hook in `useQueries.ts`
- [ ] Handle loading and error states for bot profile fetch
- [ ] Test display with no bot profile (null state)
- [ ] Test display with complete bot profile

### Batch 3.3: Ed25519 Key Generation (Client-Side)

- [ ] Install `@noble/ed25519` library for key generation (verify in package.json)
- [ ] Create `frontend/src/utils/crypto.ts` utility module
- [ ] Implement `generateEd25519KeyPair()` function returning { privateKey, publicKey }
- [ ] Ensure private key is Uint8Array (32 bytes)
- [ ] Ensure public key is Uint8Array (32 bytes)
- [ ] Add function to convert Uint8Array to hex string for display
- [ ] Add function to convert hex string back to Uint8Array
- [ ] Test key generation produces valid Ed25519 keypairs
- [ ] Verify keys are cryptographically secure (use crypto.getRandomValues)
- [ ] Document that private keys are never sent to backend

### Batch 3.4: Connect Bot Wizard Modal - Step 1 (Generate Keys)

- [ ] Create `frontend/src/components/settings/ConnectBotWizardModal.tsx`
- [ ] Implement multi-step modal with step indicator (1/4, 2/4, etc.)
- [ ] Add Step 1: "Generate Keys" with explanation text
- [ ] Add "Generate Keypair" button
- [ ] Store generated keypair in component state (not persisted)
- [ ] Display success message after generation
- [ ] Add "Next" button (disabled until keys generated)
- [ ] Add "Cancel" button to close modal
- [ ] Test modal opens from ConnectBotPanel
- [ ] Test key generation within modal

### Batch 3.5: Connect Bot Wizard Modal - Step 2 (Reveal Private Key)

- [ ] Add Step 2: "Save Your Private Key" with security warning
- [ ] Display private key in monospace font (hex format)
- [ ] Add "Copy to Clipboard" button with success feedback
- [ ] Add checkbox: "I have saved my private key securely"
- [ ] Disable "Next" button until checkbox is checked
- [ ] Add warning text: "This key will not be shown again"
- [ ] Test clipboard copy functionality
- [ ] Test checkbox validation
- [ ] Verify private key is displayed correctly

### Batch 3.6: Connect Bot Wizard Modal - Step 3 (Link Public Key)

- [ ] Add Step 3: "Link Public Key to Vault"
- [ ] Display public key in monospace font (hex format)
- [ ] Add "Register Public Key" button
- [ ] Create `useLinkBotPublicKey` mutation hook in `useQueries.ts`
- [ ] Call `registerBotPublicKey(publicKey: Uint8Array)` backend method
- [ ] Show loading spinner during registration
- [ ] Display success toast on successful registration
- [ ] Display error toast on failure with retry option
- [ ] Invalidate bot profile cache after successful registration
- [ ] Enable "Next" button after successful registration
- [ ] Test registration with valid public key
- [ ] Test error handling for registration failures

### Batch 3.7: Connect Bot Wizard Modal - Step 4 (Configure Bot URL)

- [ ] Add Step 4: "Configure Bot URL"
- [ ] Add text input for HTTPS URL
- [ ] Validate URL starts with "https://" (client-side)
- [ ] Add "Save URL" button
- [ ] Create `useSetBotUrl` mutation hook in `useQueries.ts`
- [ ] Call `setBotUrl(url: string)` backend method
- [ ] Show loading spinner during save
- [ ] Display success toast on successful save
- [ ] Display error toast on failure with retry option
- [ ] Invalidate bot profile cache after successful save
- [ ] Enable "Finish" button after successful save
- [ ] Test URL validation (reject non-HTTPS URLs)
- [ ] Test successful URL save
- [ ] Test error handling for save failures

### Batch 3.8: Connect Bot Wizard Modal - Step 5 (Completion)

- [ ] Add Step 5: "Setup Complete" success screen
- [ ] Display summary of configured bot (public key + URL)
- [ ] Add "Done" button to close modal
- [ ] Clear in-memory private key from state on completion
- [ ] Refresh ConnectBotPanel to show new connection status
- [ ] Test complete wizard flow from start to finish
- [ ] Verify private key is cleared from memory
- [ ] Verify bot profile is updated in UI

### Batch 3.9: Subscription Panel - Tier Display

- [ ] Create `frontend/src/components/settings/SubscriptionPanel.tsx`
- [ ] Display three subscription tiers: Paper Hand (Free), Diamond Hand ($50/mo), Whale ($500/mo)
- [ ] Use card layout with glassmorphism styling
- [ ] List features for each tier (placeholder content)
- [ ] Highlight current user's tier (if available from profile)
- [ ] Add "Select Plan" buttons (non-functional for now)
- [ ] Apply emerald accent color to recommended tier
- [ ] Test tier cards display correctly
- [ ] Test responsive layout on mobile
- [ ] Verify styling matches Cupertino Quant design system

### Batch 3.10: Subscription Panel - Tier Selection (Future Payment Integration)

- [ ] Add visual indicator for currently selected tier
- [ ] Add "Current Plan" badge to active tier
- [ ] Add "Upgrade" / "Downgrade" button states
- [ ] Document that payment integration is out of scope for Phase 3
- [ ] Add placeholder toast: "Payment integration coming soon"
- [ ] Test tier selection UI (without backend integration)
- [ ] Verify current tier is highlighted correctly

---

## Phase 4: Vault Backend Trading Engine (AR-8)

**Goal**: Implement robust backend trading engine with signature verification, uplink control, activity logging, and cycle monitoring.

### Batch 4.1: BotProfile Model Enhancement

- [ ] Verify `BotProfile` type includes all required fields in `backend/main.mo`
- [ ] Confirm `publicKey: ?Blob` field exists
- [ ] Confirm `botUrl: ?Text` field exists
- [ ] Confirm `lastHeartbeat: Time.Time` field exists
- [ ] Confirm `cyclesWarning: Bool` field exists
- [ ] Confirm `uplinkStatus: Bool` field exists
- [ ] Add `botProfiles` stable storage map (Principal → BotProfile)
- [ ] Test BotProfile creation with all fields
- [ ] Test BotProfile retrieval by principal
- [ ] Verify BotProfile persists across canister upgrades

### Batch 4.2: Signature Verification - Message Format

- [ ] Document canonical signing format in backend comments
- [ ] Define message format: `accountId + nonce + timestamp`
- [ ] Implement `verifyBotSignature()` helper function
- [ ] Accept message, signature, nonce, and timestamp parameters
- [ ] Verify timestamp is within acceptable window (5 minutes)
- [ ] Check nonce has not been used before (replay protection)
- [ ] Store used nonces in `usedNonces` map with timestamp
- [ ] Return boolean indicating signature validity
- [ ] Test signature verification with valid inputs
- [ ] Test rejection of expired timestamps
- [ ] Test rejection of replayed nonces

### Batch 4.3: Signature Verification - Ed25519 Validation

- [ ] Import Ed25519 verification library in Motoko (if available)
- [ ] Implement Ed25519 signature verification in `verifyBotSignature()`
- [ ] Retrieve bot's public key from BotProfile
- [ ] Verify signature against message using public key
- [ ] Return false if public key is not registered
- [ ] Return false if signature is invalid
- [ ] Test with valid Ed25519 signatures
- [ ] Test with invalid signatures
- [ ] Test with missing public key
- [ ] Document signature verification algorithm

### Batch 4.4: check_uplink Method - Bot ID Lookup

- [ ] Implement `check_uplink(bot_id: Text, signature: Blob)` method
- [ ] Look up user principal by bot_id in UserProfile.bot_id field
- [ ] Return error if bot_id is not found
- [ ] Retrieve BotProfile for found principal
- [ ] Return error if BotProfile does not exist
- [ ] Return error if public key is not registered
- [ ] Test bot_id lookup with valid bot_id
- [ ] Test error handling for unknown bot_id
- [ ] Test error handling for missing BotProfile

### Batch 4.5: check_uplink Method - Signature Verification

- [ ] Extract public key from BotProfile
- [ ] Construct verification message from bot_id
- [ ] Call `verifyBotSignature()` with message and signature
- [ ] Return error if signature verification fails
- [ ] Test signature verification in check_uplink
- [ ] Test rejection of invalid signatures
- [ ] Document expected signature format for bots

### Batch 4.6: check_uplink Method - Uplink Status Return

- [ ] Check `uplinkStatus` field in BotProfile
- [ ] Return `#EXECUTE` if uplinkStatus is true
- [ ] Return `#STANDBY` if uplinkStatus is false
- [ ] Update `lastHeartbeat` timestamp on successful check
- [ ] Test return value when uplink is enabled
- [ ] Test return value when uplink is disabled
- [ ] Verify lastHeartbeat is updated

### Batch 4.7: toggle_uplink Method Implementation

- [ ] Implement `toggle_uplink(state: Bool)` method
- [ ] Verify caller is authenticated user
- [ ] Retrieve caller's BotProfile
- [ ] Update `uplinkStatus` field to new state
- [ ] Preserve all other BotProfile fields
- [ ] Save updated BotProfile to storage
- [ ] Log action to audit log
- [ ] Test toggling uplink on
- [ ] Test toggling uplink off
- [ ] Verify audit log entry is created

### Batch 4.8: Activity Logging - Audit Entry Model

- [ ] Verify `AuditEntry` type exists with required fields
- [ ] Confirm `timestamp: Time.Time` field
- [ ] Confirm `action: Text` field
- [ ] Confirm `details: Text` field
- [ ] Confirm `principal: Principal` field
- [ ] Add `auditLog` stable storage map (Principal → [AuditEntry])
- [ ] Define maximum audit entries per user (1000)
- [ ] Test AuditEntry creation
- [ ] Test audit log storage

### Batch 4.9: Activity Logging - addAuditEntry Helper

- [ ] Implement `addAuditEntry(principal, action, details)` private function
- [ ] Create new AuditEntry with current timestamp
- [ ] Retrieve existing audit entries for principal
- [ ] Append new entry to array
- [ ] Trim array to max size if exceeded (FIFO)
- [ ] Save updated array to auditLog map
- [ ] Test adding single audit entry
- [ ] Test array trimming when max size exceeded
- [ ] Verify FIFO behavior (oldest entries removed first)

### Batch 4.10: Activity Logging - Integration Points

- [ ] Add audit log call to `registerBotPublicKey()` method
- [ ] Add audit log call to `setBotUrl()` method
- [ ] Add audit log call to `toggle_uplink()` method
- [ ] Add audit log call to `fetchSignals()` method
- [ ] Add audit log call to `submitTrade()` method
- [ ] Test audit entries are created for each action
- [ ] Verify action names are descriptive
- [ ] Verify details contain relevant information

### Batch 4.11: Activity Logging - Query Method

- [ ] Implement `getAuditLog(limit: Nat)` query method
- [ ] Verify caller is authenticated user
- [ ] Retrieve audit entries for caller
- [ ] Return most recent entries up to limit
- [ ] Return empty array if no entries exist
- [ ] Test query with various limit values
- [ ] Test query with no audit entries
- [ ] Verify only caller's entries are returned

### Batch 4.12: Heartbeat Monitoring - Cycle Balance

- [ ] Import cycle balance query function in Motoko
- [ ] Update `getHeartbeatData()` to return actual cycle balance
- [ ] Define cycle warning threshold (e.g., 1 trillion cycles)
- [ ] Set `cyclesWarning` flag in BotProfile when below threshold
- [ ] Test cycle balance retrieval
- [ ] Test warning flag when cycles are low
- [ ] Document recommended cycle top-up amount

### Batch 4.13: Heartbeat Monitoring - Last Heartbeat Tracking

- [ ] Update `lastHeartbeat` timestamp in `check_uplink()`
- [ ] Update `lastHeartbeat` timestamp in `fetchSignals()`
- [ ] Return `lastHeartbeat` in `getHeartbeatData()` query
- [ ] Calculate time since last heartbeat
- [ ] Test heartbeat timestamp updates
- [ ] Verify timestamp is returned correctly

### Batch 4.14: HTTPS Outcall - fetchSignals Implementation

- [ ] Verify `fetchSignals()` method exists in backend
- [ ] Retrieve caller's BotProfile
- [ ] Extract botUrl from profile
- [ ] Validate URL starts with "https://"
- [ ] Return error if URL is invalid or missing
- [ ] Test error handling for missing URL
- [ ] Test error handling for invalid URL

### Batch 4.15: HTTPS Outcall - HTTP Request Execution

- [ ] Import HTTPS outcall library (`http-outcalls/outcall`)
- [ ] Construct HTTP GET request to botUrl
- [ ] Set appropriate headers (User-Agent, Accept)
- [ ] Set timeout (e.g., 10 seconds)
- [ ] Execute outcall using `httpGetRequest()`
- [ ] Test successful HTTP request
- [ ] Test timeout handling
- [ ] Test network error handling

### Batch 4.16: HTTPS Outcall - Response Parsing

- [ ] Parse HTTP response body as JSON
- [ ] Extract signal array from response
- [ ] Validate signal structure (signalId, price, quantity, timestamp, direction)
- [ ] Return parsed signals in `SignalFetchResult.ok`
- [ ] Return error if parsing fails
- [ ] Test with valid JSON response
- [ ] Test with invalid JSON response
- [ ] Test with empty response

### Batch 4.17: HTTPS Outcall - Security Hardening

- [ ] Implement fail-closed error handling (reject on error)
- [ ] Validate response status code (200 OK)
- [ ] Reject responses with non-200 status
- [ ] Validate response content-type is JSON
- [ ] Limit response body size (e.g., 1 MB)
- [ ] Test rejection of non-200 responses
- [ ] Test rejection of oversized responses
- [ ] Document security considerations

### Batch 4.18: HTTPS Outcall - Transform Function

- [ ] Implement `transform()` query method for outcall
- [ ] Strip sensitive headers from response
- [ ] Normalize response format
- [ ] Return transformed response
- [ ] Test transform function with various responses
- [ ] Verify sensitive headers are removed

---

## Phase 5: Command Center UI (AR-9)

**Goal**: Build comprehensive command center dashboard with uplink controller, live pulse terminal, performance telemetry, and audit ledger.

### Batch 5.1: Dashboard Screen Layout

- [ ] Verify `DashboardScreen.tsx` exists with bento-grid layout
- [ ] Confirm four main panels: Uplink Controller, Live Pulse, Performance Telemetry, Audit Ledger
- [ ] Apply responsive grid layout (2x2 on desktop, stacked on mobile)
- [ ] Ensure glassmorphism styling is consistent
- [ ] Test layout on various screen sizes
- [ ] Verify all panels are visible and accessible

### Batch 5.2: Uplink Controller - Toggle Switch Component

- [ ] Verify `UplinkControllerCard.tsx` exists
- [ ] Implement large tactile toggle switch using shadcn Switch component
- [ ] Add emerald glow animation for active state
- [ ] Add dimmed gray styling for standby state
- [ ] Add pulsing ring indicator when active
- [ ] Display current status text (EXECUTE / STANDBY)
- [ ] Test toggle switch interaction
- [ ] Verify animations are smooth

### Batch 5.3: Uplink Controller - State Management

- [ ] Create `useToggleUplink` mutation hook in `useQueries.ts`
- [ ] Call `toggle_uplink(state: Bool)` backend method
- [ ] Show loading state during toggle operation
- [ ] Disable switch during loading
- [ ] Display success toast on successful toggle
- [ ] Display error toast on failure
- [ ] Invalidate bot profile cache after toggle
- [ ] Test toggle on → off
- [ ] Test toggle off → on
- [ ] Test error handling

### Batch 5.4: Uplink Controller - Real-Time Status Display

- [ ] Fetch bot profile using `useGetBotProfile` hook
- [ ] Display current uplink status from profile
- [ ] Update UI immediately after toggle
- [ ] Show loading spinner while fetching status
- [ ] Handle case where bot profile doesn't exist
- [ ] Test status display accuracy
- [ ] Verify real-time updates

### Batch 5.5: Live Pulse Terminal - Log Display Component

- [ ] Verify `LivePulseTerminal.tsx` exists
- [ ] Display logs in monospace font (JetBrains Mono)
- [ ] Show timestamp, action, and details for each log entry
- [ ] Apply terminal-style styling (dark background, green text)
- [ ] Limit display to most recent 20 entries
- [ ] Add auto-scroll to bottom on new entries
- [ ] Test log display with various entry counts
- [ ] Verify monospace font is applied

### Batch 5.6: Live Pulse Terminal - Data Fetching

- [ ] Create `useGetAuditLog` query hook in `useQueries.ts`
- [ ] Call `getAuditLog(limit: Nat)` backend method
- [ ] Set limit to 20 entries
- [ ] Enable auto-refresh every 5 seconds
- [ ] Show loading state on initial fetch
- [ ] Handle empty log state gracefully
- [ ] Test auto-refresh behavior
- [ ] Verify correct number of entries displayed

### Batch 5.7: Live Pulse Terminal - Connectivity Test Button

- [ ] Add "Test Connection" button to terminal panel
- [ ] Create `useFetchSignalsTest` mutation hook in `useQueries.ts`
- [ ] Call `fetchSignals()` backend method on button click
- [ ] Show loading spinner during test
- [ ] Display success toast with response summary
- [ ] Display error toast with error details
- [ ] Handle `SignalFetchResult` discriminated union correctly
- [ ] Test successful connectivity test
- [ ] Test failed connectivity test
- [ ] Verify error messages are user-friendly

### Batch 5.8: Live Pulse Terminal - Heartbeat Indicator

- [ ] Display "Last Heartbeat" timestamp at top of terminal
- [ ] Fetch heartbeat data using `useGetHeartbeatData` hook
- [ ] Format timestamp as relative time (e.g., "2 minutes ago")
- [ ] Show pulsing indicator when heartbeat is recent (< 60 seconds)
- [ ] Show warning indicator when heartbeat is stale (> 5 minutes)
- [ ] Test heartbeat display with various timestamps
- [ ] Verify pulsing animation

### Batch 5.9: Performance Telemetry - Equity Curve Chart

- [ ] Verify `PerformanceTelemetryPanel.tsx` exists
- [ ] Use Recharts AreaChart component
- [ ] Display equity curve with emerald-to-transparent gradient fill
- [ ] Remove grid lines for minimal chrome
- [ ] Add hover tooltip showing equity value
- [ ] Format X-axis as dates
- [ ] Format Y-axis as currency
- [ ] Test chart with sample data
- [ ] Verify responsive behavior

### Batch 5.10: Performance Telemetry - Data Transformation

- [ ] Create `useGetEquityCurve` hook in `useQueries.ts`
- [ ] Fetch trades using `getTradesPaginated()` method
- [ ] Transform trades into time-series equity data
- [ ] Calculate cumulative profit/loss over time
- [ ] Handle buy and sell sides correctly using `Variant_buy_sell` enum
- [ ] Sort data points by timestamp
- [ ] Test transformation with various trade scenarios
- [ ] Verify equity calculations are accurate

### Batch 5.11: Performance Telemetry - Real-Time Updates

- [ ] Enable auto-refresh every 30 seconds
- [ ] Show loading indicator during refresh
- [ ] Preserve chart zoom/pan state during refresh
- [ ] Handle empty data state (no trades yet)
- [ ] Test auto-refresh behavior
- [ ] Verify chart updates smoothly

### Batch 5.12: Audit Ledger Panel - Table Component

- [ ] Verify `AuditLedgerPanel.tsx` exists
- [ ] Use shadcn Table component for layout
- [ ] Display columns: Timestamp, Action, Details
- [ ] Apply glassmorphic styling to table
- [ ] Add CSS-based staggered fade-in animations for rows
- [ ] Limit display to most recent 10 entries
- [ ] Test table with various entry counts
- [ ] Verify animations are smooth

### Batch 5.13: Audit Ledger Panel - Data Fetching

- [ ] Reuse `useGetAuditLog` hook with limit of 10
- [ ] Enable auto-refresh every 10 seconds
- [ ] Show loading state on initial fetch
- [ ] Handle empty log state with placeholder message
- [ ] Test auto-refresh behavior
- [ ] Verify correct number of entries displayed

### Batch 5.14: Audit Ledger Panel - Timestamp Formatting

- [ ] Format timestamps as human-readable dates
- [ ] Use relative time for recent entries (e.g., "5 minutes ago")
- [ ] Use absolute time for older entries (e.g., "Jan 15, 2026 14:30")
- [ ] Test formatting with various timestamps
- [ ] Verify timezone handling

### Batch 5.15: Audit Ledger Panel - Action Color Coding

- [ ] Apply color coding to action types
- [ ] Use emerald for positive actions (REGISTER_BOT_KEY, SET_BOT_URL)
- [ ] Use amber for neutral actions (TOGGLE_UPLINK)
- [ ] Use rose for negative actions (errors, failures)
- [ ] Test color coding with various action types
- [ ] Verify colors match design system

---

## Phase 6: Bot-Side Enhancements (AR-10)

**Goal**: Improve bot-side integration with canonical signing format, sorted JSON, timestamp handling, and unified heartbeat.

### Batch 6.1: Canonical Signing Format Documentation

- [ ] Create `docs/BOT_INTEGRATION.md` documentation file
- [ ] Document canonical message format for signatures
- [ ] Specify field order: `accountId + nonce + timestamp`
- [ ] Document Ed25519 signature algorithm
- [ ] Provide example message construction in Python
- [ ] Provide example message construction in JavaScript
- [ ] Document nonce generation requirements (UUID v4)
- [ ] Document timestamp format (nanoseconds since epoch)
- [ ] Test example code snippets for accuracy

### Batch 6.2: Sorted JSON Specification

- [ ] Document JSON key sorting requirement for deterministic signatures
- [ ] Specify alphabetical key ordering
- [ ] Provide example sorted JSON in documentation
- [ ] Document why sorting is necessary (signature consistency)
- [ ] Provide sorting implementation in Python
- [ ] Provide sorting implementation in JavaScript
- [ ] Test sorting examples

### Batch 6.3: Timestamp Handling - Nanosecond Precision

- [ ] Document timestamp precision requirement (nanoseconds)
- [ ] Provide conversion from seconds to nanoseconds
- [ ] Provide conversion from milliseconds to nanoseconds
- [ ] Document acceptable timestamp window (5 minutes)
- [ ] Provide example timestamp generation in Python
- [ ] Provide example timestamp generation in JavaScript
- [ ] Test timestamp conversions

### Batch 6.4: Timestamp Handling - Clock Skew Tolerance

- [ ] Document clock skew tolerance (±5 minutes)
- [ ] Explain why clock skew tolerance is necessary
- [ ] Recommend NTP synchronization for bot servers
- [ ] Document timestamp validation logic in backend
- [ ] Provide troubleshooting guide for timestamp errors
- [ ] Test timestamp validation with various skews

### Batch 6.5: StableHashMap Proofs - Backend Implementation

- [ ] Document use of StableHashMap for persistent storage
- [ ] List all StableHashMap instances in backend
- [ ] Document upgrade safety guarantees
- [ ] Provide example of adding new StableHashMap
- [ ] Document migration strategy for schema changes
- [ ] Test StableHashMap persistence across upgrades

### Batch 6.6: Unified Uplink Heartbeat - Bot Implementation Guide

- [ ] Document recommended heartbeat interval (60 seconds)
- [ ] Provide example heartbeat loop in Python
- [ ] Provide example heartbeat loop in JavaScript
- [ ] Document `check_uplink()` method signature
- [ ] Document expected response values (#EXECUTE, #STANDBY)
- [ ] Document error handling for heartbeat failures
- [ ] Provide complete bot example code
- [ ] Test example bot code

### Batch 6.7: Unified Uplink Heartbeat - Signature Generation

- [ ] Document signature generation for `check_uplink()` call
- [ ] Specify message format: `bot_id + timestamp`
- [ ] Provide Ed25519 signing example in Python
- [ ] Provide Ed25519 signing example in JavaScript
- [ ] Document private key storage best practices
- [ ] Test signature generation examples

### Batch 6.8: Bot Error Handling - Error Types

- [ ] Document all possible error types from backend
- [ ] Document `BotError` variants: InvalidUrl, FetchFailed
- [ ] Document `Error_` enum values
- [ ] Provide error code reference table
- [ ] Document recommended retry strategies
- [ ] Provide error handling examples

### Batch 6.9: Bot Error Handling - Retry Logic

- [ ] Document exponential backoff strategy
- [ ] Provide retry implementation in Python
- [ ] Provide retry implementation in JavaScript
- [ ] Document maximum retry attempts (3)
- [ ] Document backoff intervals (1s, 2s, 4s)
- [ ] Test retry logic examples

### Batch 6.10: Bot Integration Testing - Test Harness

- [ ] Create `scripts/test-bot.py` test harness
- [ ] Implement key generation in test harness
- [ ] Implement signature generation in test harness
- [ ] Implement `check_uplink()` call in test harness
- [ ] Implement `fetchSignals()` simulation
- [ ] Add command-line arguments for configuration
- [ ] Test harness against local replica
- [ ] Document test harness usage

---

## Phase 7: Multi-Bot, Multi-User Architecture (AR-11)

**Goal**: Enable users to manage multiple bots, implement multi-tenant permissioning, and support bot rotation and revocation.

### Batch 7.1: Multi-Bot Data Model - Backend Schema

- [ ] Design new data model supporting multiple bots per user
- [ ] Create `BotId` type alias (Text)
- [ ] Update `BotProfile` to include `botId: BotId` field
- [ ] Change storage from `Map<Principal, BotProfile>` to `Map<BotId, BotProfile>`
- [ ] Add `userBots: Map<Principal, [BotId]>` to track user's bots
- [ ] Document schema migration strategy
- [ ] Test new data model with sample data

### Batch 7.2: Multi-Bot Data Model - Migration Logic

- [ ] Implement migration function for existing single-bot profiles
- [ ] Generate unique BotId for existing profiles
- [ ] Migrate existing BotProfile to new schema
- [ ] Update userBots map with migrated bot IDs
- [ ] Test migration with existing data
- [ ] Verify data integrity after migration
- [ ] Document rollback procedure

### Batch 7.3: Multi-Bot Backend Methods - Create Bot

- [ ] Implement `createBot(name: Text)` method
- [ ] Generate unique BotId (UUID)
- [ ] Create new BotProfile with default values
- [ ] Add BotId to user's bot list
- [ ] Return BotId to caller
- [ ] Add audit log entry
- [ ] Test bot creation
- [ ] Test duplicate name handling

### Batch 7.4: Multi-Bot Backend Methods - List Bots

- [ ] Implement `listMyBots()` query method
- [ ] Retrieve caller's bot IDs from userBots map
- [ ] Fetch BotProfile for each bot ID
- [ ] Return array of (BotId, BotProfile) tuples
- [ ] Test with zero bots
- [ ] Test with multiple bots
- [ ] Verify only caller's bots are returned

### Batch 7.5: Multi-Bot Backend Methods - Get Bot

- [ ] Implement `getBot(botId: BotId)` query method
- [ ] Verify caller owns the bot
- [ ] Retrieve BotProfile for bot ID
- [ ] Return BotProfile or error
- [ ] Test with valid bot ID
- [ ] Test with invalid bot ID
- [ ] Test with bot owned by different user

### Batch 7.6: Multi-Bot Backend Methods - Update Bot

- [ ] Implement `updateBot(botId: BotId, updates: BotProfileUpdate)` method
- [ ] Verify caller owns the bot
- [ ] Apply updates to BotProfile
- [ ] Preserve unchanged fields
- [ ] Add audit log entry
- [ ] Test updating public key
- [ ] Test updating bot URL
- [ ] Test updating uplink status

### Batch 7.7: Multi-Bot Backend Methods - Delete Bot

- [ ] Implement `deleteBot(botId: BotId)` method
- [ ] Verify caller owns the bot
- [ ] Remove BotProfile from storage
- [ ] Remove BotId from user's bot list
- [ ] Add audit log entry
- [ ] Test bot deletion
- [ ] Test deletion of non-existent bot
- [ ] Verify bot cannot be accessed after deletion

### Batch 7.8: Multi-Bot Frontend - Bot List Component

- [ ] Create `frontend/src/components/settings/BotListPanel.tsx`
- [ ] Display list of user's bots in card layout
- [ ] Show bot name, status, and last heartbeat for each
- [ ] Add "Add Bot" button
- [ ] Add "Configure" button for each bot
- [ ] Add "Delete" button for each bot
- [ ] Test with zero bots
- [ ] Test with multiple bots

### Batch 7.9: Multi-Bot Frontend - Bot Creation Flow

- [ ] Create `frontend/src/components/settings/CreateBotModal.tsx`
- [ ] Add text input for bot name
- [ ] Add "Create" button
- [ ] Create `useCreateBot` mutation hook
- [ ] Call `createBot(name)` backend method
- [ ] Show success toast on creation
- [ ] Refresh bot list after creation
- [ ] Test bot creation flow
- [ ] Test validation for empty name

### Batch 7.10: Multi-Bot Frontend - Bot Configuration

- [ ] Update `ConnectBotWizardModal` to accept botId parameter
- [ ] Modify wizard to configure specific bot
- [ ] Update all backend calls to include botId
- [ ] Test wizard with specific bot
- [ ] Verify correct bot is updated

### Batch 7.11: Multi-Bot Frontend - Bot Deletion

- [ ] Create `useDeleteBot` mutation hook
- [ ] Add confirmation dialog before deletion
- [ ] Call `deleteBot(botId)` backend method
- [ ] Show success toast on deletion
- [ ] Refresh bot list after deletion
- [ ] Test bot deletion flow
- [ ] Test cancellation of deletion

### Batch 7.12: Multi-Tenant Permissioning - Ownership Verification

- [ ] Implement `verifyBotOwnership(caller: Principal, botId: BotId)` helper
- [ ] Check if botId exists in caller's bot list
- [ ] Return boolean indicating ownership
- [ ] Use helper in all bot-related methods
- [ ] Test ownership verification
- [ ] Test rejection of unauthorized access

### Batch 7.13: Multi-Tenant Permissioning - Admin Override

- [ ] Allow admins to access any bot for support purposes
- [ ] Add admin check to ownership verification
- [ ] Log admin access to audit log
- [ ] Test admin access to user bots
- [ ] Verify audit log entries for admin access

### Batch 7.14: Bot Rotation - Revoke Old Key

- [ ] Implement `revokeBot(botId: BotId)` method
- [ ] Mark bot as revoked in BotProfile
- [ ] Prevent revoked bot from calling backend methods
- [ ] Add audit log entry
- [ ] Test bot revocation
- [ ] Test rejection of calls from revoked bot

### Batch 7.15: Bot Rotation - Activate New Key

- [ ] Implement `activateBot(botId: BotId)` method
- [ ] Mark bot as active in BotProfile
- [ ] Allow active bot to call backend methods
- [ ] Add audit log entry
- [ ] Test bot activation
- [ ] Test calls from activated bot

### Batch 7.16: Bot Rotation - Frontend UI

- [ ] Add "Revoke" button to bot configuration
- [ ] Add "Activate" button to bot configuration
- [ ] Show bot status (Active / Revoked)
- [ ] Create `useRevokeBot` mutation hook
- [ ] Create `useActivateBot` mutation hook
- [ ] Test revocation flow
- [ ] Test activation flow

---

## Phase 8: Institutional Hardening (AR-12)

**Goal**: Implement production-grade monitoring, rate limiting, auto-scaling, and advanced logging for institutional deployment.

### Batch 8.1: SLA Monitoring - Uptime Tracking

- [ ] Implement uptime tracking in backend
- [ ] Record canister start time
- [ ] Calculate uptime duration
- [ ] Expose `getUptimeStats()` query method
- [ ] Return uptime percentage and duration
- [ ] Test uptime calculation
- [ ] Verify accuracy over time

### Batch 8.2: SLA Monitoring - Response Time Metrics

- [ ] Implement response time tracking for key methods
- [ ] Record start and end time for each call
- [ ] Calculate average response time
- [ ] Store metrics in rolling window (last 1000 calls)
- [ ] Expose `getResponseTimeStats()` query method
- [ ] Test response time tracking
- [ ] Verify metrics accuracy

### Batch 8.3: SLA Monitoring - Error Rate Tracking

- [ ] Implement error rate tracking
- [ ] Count successful vs failed calls
- [ ] Calculate error rate percentage
- [ ] Store metrics in rolling window
- [ ] Expose `getErrorRateStats()` query method
- [ ] Test error rate calculation
- [ ] Verify accuracy with various error scenarios

### Batch 8.4: SLA Monitoring - Dashboard Display

- [ ] Create `frontend/src/components/admin/SLAMonitoringPanel.tsx`
- [ ] Display uptime percentage with visual indicator
- [ ] Display average response time with chart
- [ ] Display error rate with trend line
- [ ] Add time range selector (1h, 24h, 7d)
- [ ] Test dashboard with sample metrics
- [ ] Verify real-time updates

### Batch 8.5: Rate Limiting - Request Counter

- [ ] Implement request counter per principal
- [ ] Track requests in sliding time window (1 minute)
- [ ] Store counters in `requestCounts: Map<Principal, [(Time, Nat)]>`
- [ ] Clean up expired entries periodically
- [ ] Test request counting
- [ ] Verify sliding window behavior

### Batch 8.6: Rate Limiting - Limit Enforcement

- [ ] Define rate limits per user tier (Free: 10/min, Pro: 100/min, Whale: 1000/min)
- [ ] Implement `checkRateLimit(caller: Principal)` helper
- [ ] Retrieve user's tier from profile
- [ ] Count requests in current window
- [ ] Return error if limit exceeded
- [ ] Test rate limit enforcement
- [ ] Test different tier limits

### Batch 8.7: Rate Limiting - Integration

- [ ] Add rate limit check to all public methods
- [ ] Return descriptive error when limit exceeded
- [ ] Add rate limit headers to responses (X-RateLimit-Remaining)
- [ ] Test rate limiting on high-frequency calls
- [ ] Verify error messages are clear

### Batch 8.8: Rate Limiting - Frontend Display

- [ ] Display rate limit status in UI
- [ ] Show remaining requests in current window
- [ ] Show time until window reset
- [ ] Add warning when approaching limit
- [ ] Test UI with various limit states
- [ ] Verify countdown timer accuracy

### Batch 8.9: Canister Auto-Scaling - Cycle Monitoring

- [ ] Implement cycle balance monitoring
- [ ] Define critical threshold (100B cycles)
- [ ] Define warning threshold (1T cycles)
- [ ] Check balance on every heartbeat
- [ ] Log warnings when thresholds crossed
- [ ] Test threshold detection
- [ ] Verify logging

### Batch 8.10: Canister Auto-Scaling - Alert System

- [ ] Implement alert system for low cycles
- [ ] Send alert when critical threshold reached
- [ ] Store alerts in `alerts: [Alert]` array
- [ ] Expose `getAlerts()` query method
- [ ] Test alert generation
- [ ] Verify alert persistence

### Batch 8.11: Canister Auto-Scaling - Frontend Alerts

- [ ] Display cycle alerts in admin dashboard
- [ ] Show alert severity (warning, critical)
- [ ] Add "Top Up Cycles" button with instructions
- [ ] Show current cycle balance
- [ ] Test alert display
- [ ] Verify top-up instructions are clear

### Batch 8.12: Canister Auto-Scaling - Documentation

- [ ] Document auto-scaling strategy
- [ ] Document cycle top-up procedures
- [ ] Document monitoring best practices
- [ ] Provide cycle calculation examples
- [ ] Document emergency procedures
- [ ] Test documentation clarity

### Batch 8.13: Advanced Logging - Structured Log Format

- [ ] Implement structured logging format (JSON)
- [ ] Include timestamp, level, message, context fields
- [ ] Define log levels (DEBUG, INFO, WARN, ERROR)
- [ ] Implement `log(level, message, context)` helper
- [ ] Test structured log generation
- [ ] Verify JSON format

### Batch 8.14: Advanced Logging - Log Storage

- [ ] Implement circular buffer for logs
- [ ] Define maximum log entries (10,000)
- [ ] Store logs in `logs: [LogEntry]` array
- [ ] Implement FIFO eviction when full
- [ ] Test log storage
- [ ] Verify buffer behavior

### Batch 8.15: Advanced Logging - Log Query API

- [ ] Implement `getLogs(level, startTime, endTime, limit)` query method
- [ ] Filter logs by level
- [ ] Filter logs by time range
- [ ] Return paginated results
- [ ] Test log querying with various filters
- [ ] Verify pagination

### Batch 8.16: Advanced Logging - Frontend Log Viewer

- [ ] Create `frontend/src/components/admin/LogViewerPanel.tsx`
- [ ] Display logs in table format
- [ ] Add filters for level and time range
- [ ] Add search functionality
- [ ] Add export to CSV button
- [ ] Test log viewer with sample logs
- [ ] Verify filtering and search

### Batch 8.17: Anomaly Detection - Baseline Metrics

- [ ] Collect baseline metrics for normal operation
- [ ] Track average request rate
- [ ] Track average response time
- [ ] Track average error rate
- [ ] Store baselines in `baselines: Metrics` record
- [ ] Test baseline calculation
- [ ] Verify accuracy

### Batch 8.18: Anomaly Detection - Deviation Detection

- [ ] Implement deviation detection algorithm
- [ ] Calculate standard deviation from baseline
- [ ] Define anomaly threshold (3 standard deviations)
- [ ] Detect anomalies in real-time
- [ ] Log anomalies with details
- [ ] Test anomaly detection
- [ ] Verify false positive rate

### Batch 8.19: Anomaly Detection - Alert Generation

- [ ] Generate alerts for detected anomalies
- [ ] Include anomaly type and severity
- [ ] Store alerts in alert system
- [ ] Expose alerts via `getAlerts()` method
- [ ] Test alert generation for anomalies
- [ ] Verify alert details

### Batch 8.20: Anomaly Detection - Frontend Display

- [ ] Display anomaly alerts in admin dashboard
- [ ] Show anomaly type and timestamp
- [ ] Add "Investigate" button linking to logs
- [ ] Show anomaly trend chart
- [ ] Test anomaly display
- [ ] Verify investigation workflow

---

## Completion Criteria

Each phase is considered complete when:
1. All batch steps are checked off
2. All tests pass
3. Code review is completed
4. Documentation is updated
5. User acceptance testing is successful

## Notes

- This plan assumes sequential execution of phases, but batches within a phase can be parallelized where dependencies allow
- Each step should be independently testable and verifiable
- All user-facing text in the implementation should be in English
- Immutable frontend paths must not be modified throughout all phases
- Backend changes must maintain backward compatibility with legacy API surface

---

**Document Version**: 1.0  
**Last Updated**: February 11, 2026  
**Status**: Ready for execution
