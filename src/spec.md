# Specification

## Summary
**Goal:** Improve backward-compatibility documentation and ensure `UserProfile` construction remains compatible with legacy callers, without changing the public API surface.

**Planned changes:**
- Update the `PUBLIC ACTOR API & TYPES (BACKWARD COMPATIBILITY: LEGACY INVENTORY)` comment block in `backend/main.mo` to enumerate all currently exposed public canister methods and key public types, explicitly marking them as must remain backward compatible (documentation-only).
- Make the comment immediately above `type UserProfile = { ... }` explicitly state that `planTier`, `botPublicKey`, and `bot_id` are intentionally optional for backward compatibility, and remove/adjust any nearby contradictory wording implying they are required.
- Verify and minimally adjust any `UserProfile` record literals/constructors so they explicitly set `bot_id = null` when a bot id is not provided.

**User-visible outcome:** No UI/behavior changes; the backend’s legacy API and `UserProfile` optional-field expectations are documented consistently, and profile construction remains compatible for callers that omit `bot_id`.
