# Specification

## Summary
**Goal:** Fix Connect Bot Wizard Ed25519 keypair generation to use `@noble/ed25519` (with a safe fallback) while keeping the wizard flow and UI behavior unchanged.

**Planned changes:**
- Update `frontend/src/components/settings/ConnectBotWizardModal.tsx` `handleGenerateKeypair` to generate Ed25519 keys via `@noble/ed25519` (`ed.utils.randomPrivateKey()` and `await ed.getPublicKeyAsync(privateKey)`), avoiding Web Crypto Ed25519 generation on the normal path.
- Display/copy the private key as a hex string for `BOT_PRIVATE_KEY`, while keeping the public key as a `Uint8Array` passed through the existing `linkMutation.mutateAsync(keypair.publicKey)` flow.
- Add a fallback path when `@noble/ed25519` is unavailable: generate a 32-byte random seed, produce a placeholder derived public key, and include the exact comment `// TODO: Replace with real Ed25519 derivation in production.`
- Preserve all existing wizard steps, blur/copy behavior, warning text, close/clear behavior, and existing mutation/link/save flows.

**User-visible outcome:** In the Connect Bot Wizard, users can generate and copy a `BOT_PRIVATE_KEY` and successfully link the derived public key without errors, with the same step-by-step experience as before.
