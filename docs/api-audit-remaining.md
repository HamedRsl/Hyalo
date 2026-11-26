# Remaining API audit scope

The [API ledger](api-audit-status.json) tracks all **329 original inventory records**. The [continuation report](api-audit-continuation.md) documents the peer comparison and how to rerun the browser checks.

## Status totals

- resolved: **313**
- partial: **7**
- open: **0**
- different-role: **9**

A `resolved` row records a verified public contract. A `partial` row identifies a capability or verification step still outstanding. An `open` row can include existing code that still needs acceptance evidence. The ledger lists the evidence and remaining work for each item.

Automated verification and the physical-device checks are documented in the [verification guide](verification.md).

## Open and partial work by family

### carousel

- **API-041 (partial)**: Vertical keyboard navigation, native scroll and snap geometry pass in three browser engines. Physical touch and momentum remain unverified.

### dates

- **API-078 (partial)**: The touch dialog centers in a narrow LTR or RTL viewport and responds to taps in all three browser engines. Physical iOS and Android keyboard, viewport and touch ergonomics remain unverified.
- **API-079 (partial)**: Desktop and narrow viewport layout verified across three engines, with cross-month range selection covered by unit tests. Physical-device geometry remains unverified.
- **API-085 (partial)**: Browser checks cover controller attachment, focus on the active date, detachment, and focus return. Screen-reader announcement acceptance remains unverified.

### masked-input

- **API-148 (partial)**: Browser checks cover backward, forward and selected-range deletion with custom tokens. Unit coverage includes supplementary characters and composition events. Physical IME acceptance remains unverified.

### popover

- **API-202 (partial)**: Alternate tooltip origins and explicit positioning are implemented. Synthetic touch verifies opt-in activation. Physical touch-device acceptance remains open.

### select

- **API-239 (partial)**: The custom controller is tested. Native `open()` calls `showPicker()` when available and preserves native focus if the request is declined. Platform picker behavior under trusted gestures remains unverified.

## Different-role IDs (not completion of missing APIs)

API-024, API-028, API-126, API-131, API-146, API-158, API-228, API-295, API-312.

## Gate

Run `node tools/check-api-audit.mjs` and `node tools/check-prose.mjs`. The ledger gate checks exact original ID/family coverage, schema, evidence paths, substantive test-file evidence for resolved rows and remaining work for unresolved rows. Neither gate executes component tests or certifies physical/browser acceptance.
