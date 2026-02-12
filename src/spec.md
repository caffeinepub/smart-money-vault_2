# Specification

## Summary
**Goal:** Add backend subscription tier storage and APIs (public read + admin-managed create/update/toggle) to support frontend tier listing and lookup.

**Planned changes:**
- Define a new public `SubscriptionTier` type in `backend/main.mo` with optional limits (`?Nat` where `null` means unlimited).
- Persist tiers in stable storage keyed by `id`, with an in-memory lookup map for efficient access, while preserving all legacy public APIs/types.
- Seed default tiers on initialization only when no tiers exist (`free`, `pro`, `whale`) with the specified limits and pricing.
- Add public query APIs for the frontend: `list_tiers()` and `get_tier(id : Text)` returning the existing `Result` variant style (`#ok` / `#err`).
- Add admin-only update APIs (AccessControl.isAdmin) as shared update calls: `create_tier`, `update_tier` (partial patch semantics), and `toggle_tier_active`, including duplicate-id rejection for `create_tier`.

**User-visible outcome:** The frontend can fetch all subscription tiers and fetch a tier by id, and admins can create and manage tiers (update fields and enable/disable tiers) via backend APIs.
