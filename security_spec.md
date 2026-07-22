# SOTA VPN Operator Shield — Security Specification

## 1. Data Invariants
1. **Log Immutability**: Logs of network and security events can only be written during creation. Any attempt to update, alter, or delete logs must be rejected by the security layer.
2. **User Isolation**: Users may only access and write settings or logs located precisely within their own user-spaced directory (`/users/{userId}`). Access to neighboring operator profiles is mathematically restricted.
3. **Strict Schema Key Counting**: Document creations must contain exactly the allowed set of properties. Any shadow fields or ghost variables in payloads must trigger immediate permission rejection.
4. **Valid ID Enforcement**: Generated log IDs must adhere to standard alphanumerics and be strictly size-limited to prevent ID injection attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent targeted injection, spoofing, and privilege-escalation vectors that our security policies mathematically block:

### Payload 1: The Identity Spoof (Log)
Attempts to write a connection log under Operator A's collection but sets the field `userId` to Operator B's UID.
```json
{
  "userId": "operator_b_uid",
  "event": "connection_start",
  "details": "Tunnel created",
  "timestamp": "2026-07-14T17:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 2: Ghost Field Inject (Log)
Attempts to write a log containing unauthorized administrative privileges.
```json
{
  "userId": "operator_a_uid",
  "event": "connection_start",
  "details": "Tunnel created",
  "timestamp": "2026-07-14T17:00:00Z",
  "isAdmin": true
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 3: Event Enum Bypass (Log)
Attempts to log an unapproved or forged security action.
```json
{
  "userId": "operator_a_uid",
  "event": "force_unlimited_bandwidth",
  "details": "DPI bypass triggered",
  "timestamp": "2026-07-14T17:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 4: Log Deletion Attack (Log)
Attempts to delete a historical connection log to hide evidence of a security threat.
*Expected Result:* `PERMISSION_DENIED`

### Payload 5: Log Modification / Alteration (Log)
Attempts to alter log details after creation to hide routing errors.
```json
{
  "details": "Successfully resolved"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 6: Size-Exhaustion Denial of Wallet (Log)
Attempts to write an excessively long string to `details` (over 1024 characters).
```json
{
  "userId": "operator_a_uid",
  "event": "error",
  "details": "A".repeat(1025),
  "timestamp": "2026-07-14T17:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 7: Neighbor Settings Hijack (Settings)
Attempts to modify Operator B's global settings document.
```json
{
  "userId": "operator_a_uid",
  "protocol": "WireGuard-Obfs (SOTA)",
  "isDpiBypassEnabled": true,
  "updatedAt": "2026-07-14T17:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 8: Settings Missing Key Injection (Settings)
Attempts to write settings missing required structure, seeking to induce an application crash.
```json
{
  "userId": "operator_a_uid",
  "protocol": "Hysteria 2",
  "updatedAt": "2026-07-14T17:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 9: Protocol Value Poisoning (Settings)
Attempts to set `protocol` to an excessively long name to crash parsers.
```json
{
  "userId": "operator_a_uid",
  "protocol": "A".repeat(101),
  "isDpiBypassEnabled": true,
  "isPacketMorphingEnabled": true,
  "isTimingObfuscationEnabled": true,
  "isAlpnSpoofingEnabled": true,
  "isChaffingEnabled": false,
  "isMultiPathSimEnabled": true,
  "isYoutubeOptimizerEnabled": true,
  "updatedAt": "2026-07-14T17:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 10: Settings Type Spoofing (Settings)
Attempts to pass a non-boolean string to `isDpiBypassEnabled`.
```json
{
  "userId": "operator_a_uid",
  "protocol": "WireGuard",
  "isDpiBypassEnabled": "yes_it_is_enabled",
  "isPacketMorphingEnabled": true,
  "isTimingObfuscationEnabled": true,
  "isAlpnSpoofingEnabled": true,
  "isChaffingEnabled": false,
  "isMultiPathSimEnabled": true,
  "isYoutubeOptimizerEnabled": true,
  "updatedAt": "2026-07-14T17:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 11: Immutable User ID Hijack (Settings)
Attempts to transfer settings ownership by modifying `userId` on update.
```json
{
  "userId": "operator_b_uid"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 12: Injection String ID Poisoning (Settings)
Attempts to use a document ID containing massive sizes or path injection characters.
```json
Path: /users/operator_a_uid/logs/some_extremely_long_or_injected_id_with_backslashes_etc
```
*Expected Result:* `PERMISSION_DENIED`

---

## 3. The Security Test Runner Mock Specification
The rules can be fully simulated or unit tested via `@firebase/rules-unit-testing` package. A test execution script maps as follows:
```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'primal-inverter-15xj8',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    }
  });
});

test('operator_a_uid cannot write log to operator_b_uid', async () => {
  const aliceDb = testEnv.authenticatedContext('operator_a_uid').firestore();
  await assertFails(
    aliceDb.doc('users/operator_b_uid/logs/log_1').set({
      userId: 'operator_b_uid',
      event: 'connection_start',
      details: 'test',
      timestamp: new Date().toISOString()
    })
  );
});
```
