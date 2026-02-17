# Specification

## Summary
**Goal:** Retry the backend deploy by replacing placeholder heartbeat data with real canister-state-derived values, hardening `fetchSignals()` success-path audit logging, and fixing bot-id indexing updates in `saveCallerUserProfile`.

**Planned changes:**
- Update `getHeartbeatData(accountId)` to compute `botStatus`, `lastHeartbeatAt`, and `verifiedLicense` from existing `botProfiles`, `userProfiles`, and `licenses` state while preserving the existing method name and access control.
- Keep `cycles` limited to the current Motoko environment (use `0` when no cycle-balance API is available, with the exact TODO comment) and add `cyclesWarning` when below the threshold.
- Harden `fetchSignals()` success-path audit logging to safely include either the full response body (<= 100 chars) or the first 100 characters (> 100 chars) without any out-of-range slicing, while keeping the structured `#ok({ statusCode; body; timestamp })` response.
- Fix `saveCallerUserProfile` so `botIdIndex` removes any previous `bot_id` mapping when a caller changes or clears their `bot_id`, and correctly sets the new mapping when provided.

**User-visible outcome:** Heartbeat status/verification reflects real stored user/bot/license state, signal fetching no longer risks trapping due to audit-log snippet creation, and changing a user’s `bot_id` correctly updates lookup/index behavior.
