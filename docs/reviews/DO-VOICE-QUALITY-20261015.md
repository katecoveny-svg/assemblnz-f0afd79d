# Voice quality follow-up — 15 October 2026

Based on released main b9bbdc7b8, including public Parliament evidence. No provider/model, prompt, voice, permission, allowance or lease activation change.

The pre-call UI now advises headphones and pausing other assistants: browser echo cancellation may not remove another app’s speech. This directly addresses contamination reported during Kate’s earlier listening test; it is guidance, not an acoustic fix or guarantee.

Component fixtures verify requested echo cancellation/noise suppression with video disabled; exact selected speech configuration and instructions survive bounded same-token resumption; a different issued voice is rejected before opening the provider socket, capture is stopped, and the lease is revoked. Existing all-voice configuration, token owner/profile boundary and lease tests remain intact.

Focused checks: 44 tests across seven files passed; scoped ESLint passed. No full build or browser launch was run to avoid competing with release coordinator CPU work. Coordinator must run its normal final integration gates. Fixtures use no microphone, real provider or allowance.

## Remaining acoustic acceptance

No approved NZ voice exists. Kate’s previous mid-call NZ/American drift remains a failed acoustic test; Qwen/Studio voices are not an approved replacement. With one assistant active, headphones, explicit microphone consent and the phone page visible/unlocked, Kate should speak for about one minute: an ordinary greeting, a short list with numbers, an Auckland place name, then a different topic and summary. Confirm natural subtle NZ delivery stays consistent throughout, no self-response to speaker output, interruption/mute/End work, and no drift after a tool result if a relevant consented source lookup is tested. Do not include personal information. This real test requires Kate’s action and consumes an existing call reservation; none was run here.

Longer leases remain default-off. Their offline lifecycle tests do not prove provider one-use-token resumption compatibility. No silent reconnect into another paid window, quota reset or budget increase is included. Settings remain server-validated per owner and next-call only. Production shipping belongs to the single release coordinator.
