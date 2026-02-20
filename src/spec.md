# Specification

## Summary
**Goal:** Fix 5 critical security blockers and additional high-priority issues to prepare Smart Money Vault for mainnet deployment.

**Planned changes:**
- Implement stable storage for all backend state maps to prevent data loss during canister upgrades
- Add full Ed25519 signature verification in verifyBotSignature() and check_uplink() functions
- Encrypt Stripe secret key instead of storing as plaintext
- Convert Stripe checkout from one-time payment to subscription mode with webhook support
- Replace unsafe Ed25519 key generation fallback in ConnectBotWizardModal with tweetnacl or noble-ed25519
- Implement cleanup timer for usedNonces map to prevent unbounded growth
- Remove duplicate profile update functions (keep one implementation)
- Replace assert statement in storeAnalyticsEvent with if/return pattern
- Implement actual storage logic in storeJwt() and storeStrategicVault()
- Fix getHeartbeatData() to use accountId parameter instead of caller
- Remove unused 3D dependencies to reduce bundle size by ~500KB
- Resolve build tool inconsistency between package.json and icp.yaml

**User-visible outcome:** Users can trust that their data persists across upgrades, bot signatures are cryptographically verified, subscriptions work correctly with recurring billing, and the application is secure for mainnet deployment.
