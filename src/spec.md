# Specification

## Summary
**Goal:** Replace the Settings “Profile” tab placeholder with a working, canister-backed Profile Settings form that loads and saves user profile settings with optimistic updates.

**Planned changes:**
- Implement a Profile Settings form in `SettingsRouteScreen.tsx` (Profile tab only) showing: read-only Principal ID, editable Display name, Timezone selector, notification preference toggles, and a Save button with disabled-while-saving behavior.
- Add React Query query to load the caller’s current profile settings from the canister and prefill the form (with sensible defaults when values are missing).
- Add React Query mutation to save profile settings via a canister `update_profile` method, using optimistic cache updates and rollback on error, and invalidate/refetch on success.
- Add/ensure a Motoko `update_profile` shared method in `backend/main.mo` that persists display name, timezone, and notification preferences for the authenticated caller, and update the Candid interface so the frontend can call it.

**User-visible outcome:** In the Settings page’s Profile tab, users can view their Principal ID, edit profile details (display name, timezone, notification preferences), and save changes that persist across reloads, with fast optimistic UI updates.
