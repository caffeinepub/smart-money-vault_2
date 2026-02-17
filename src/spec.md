# Specification

## Summary
**Goal:** Return a structured HTTP-response payload from `fetchSignals` and update frontend types/handling to match the new Candid shape.

**Planned changes:**
- Update `backend/main.mo` public type `SignalFetchResult` so `#ok` returns `{ statusCode : Nat; body : Text; timestamp : Int }` and `#err` remains `BotError` (unchanged variants).
- Update `backend/main.mo` `fetchSignals` success path to return `#ok({ statusCode = 200; body = response; timestamp = Time.now() })` without attempting to parse JSON into `Signal` records.
- Preserve all existing `fetchSignals` error behavior and messages, and keep the successful-call heartbeat update (`BotProfile.lastHeartbeat = Time.now()`) as currently implemented.
- Add an audit log entry on successful `fetchSignals` calls including `Signals fetched: ` plus the first 100 characters of the response body (or the full body if <= 100 chars).
- Update frontend generated/backend interface types and `frontend/src/hooks/useFetchSignalsTest.ts` to handle the new structured success payload and update the success toast message to reference the structured result (e.g., status code and/or body length), in English.

**User-visible outcome:** The frontend connectivity test can call `fetchSignals` and show a success toast based on the returned HTTP status/body info, while backend behavior and errors remain the same except that successful calls now return the raw HTTP response payload (with timestamp) and create a success audit entry.
