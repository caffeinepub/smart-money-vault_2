# Specification

## Summary
**Goal:** Replace `backend/access-control.mo` with an updated version that ensures the hardcoded owner principal always receives admin access, bypassing role map lookups and token requirements.

**Planned changes:**
- Replace the contents of `backend/access-control.mo` with the provided code exactly as given
- `getUserRole` now returns `#admin` immediately for `OWNER_PRINCIPAL` before checking the userRoles map
- `hasPermission` now returns `true` immediately for `OWNER_PRINCIPAL` before any other role checks
- `isAdmin` continues to short-circuit for `OWNER_PRINCIPAL`
- Hardcoded owner principal is set to `gyojt-gsv7l-g3oqx-3m7xb-w7cmh-nck6r-so6sn-fc7jp-ymofr-fgq6n-eae`
- Redeploy the backend after the file replacement

**User-visible outcome:** The owner principal automatically receives admin access upon login without needing to register or provide an admin token.
