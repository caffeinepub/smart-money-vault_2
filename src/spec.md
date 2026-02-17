# Specification

## Summary
**Goal:** Fix Ed25519 keypair generation in the Connect Bot Wizard so it produces a valid keypair and keeps the existing wizard flow unchanged.

**Planned changes:**
- Update `frontend/src/components/settings/ConnectBotWizardModal.tsx` to replace `handleGenerateKeypair` with a real Ed25519 keypair generation flow that prefers TweetNaCl (`import nacl from 'tweetnacl'`), falls back to `@noble/ed25519` if needed, and finally to Web Crypto API Ed25519 if dependencies cannot be used.
- Ensure the wizard stores the generated `publicKey` as a `Uint8Array(32)` for backend linking, and displays/stores the private key as a hex string derived from the generated secret/private key material (TweetNaCl `secretKey` preferred).
- If TweetNaCl is not present, add `tweetnacl` as the minimal required frontend dependency so the import compiles and runs (no unrelated dependency changes).

**User-visible outcome:** Clicking “Generate Bot Identity” reliably generates and shows a valid Ed25519 private key (hex) and links the matching public key through the existing wizard steps without any UI/flow changes.
