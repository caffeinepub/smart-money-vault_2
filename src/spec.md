# Specification

## Summary
**Goal:** Fix `getHeartbeatData` cycles reporting so it compiles without using an unavailable cycles balance API.

**Planned changes:**
- Update `backend/main.mo` `getHeartbeatData` to try retrieving the canister cycles balance via `ExperimentalCycles.balance()`.
- If `ExperimentalCycles.balance()` is not available in this Motoko version, set `cycles` to `0` and add the exact comment `// TODO: Replace with actual cycle balance API when available.` near the fallback.
- Keep all other `getHeartbeatData` logic, return shape/fields, types, access control, and behavior unchanged.

**User-visible outcome:** No UI changes; the backend compiles in the target environment and `getHeartbeatData` continues to return the same data shape with `cycles` obtained via the allowed approach (or `0` with the specified TODO comment when unavailable).
