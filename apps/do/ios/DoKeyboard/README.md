# DO keyboard

Part of the `DO` XcodeGen project one directory up. Development source; no installed App Store keyboard is established.

Load draft reads the app's explicitly reviewed, time-limited shared draft. A second tap inserts it. Before insertion the keyboard checks that the record still exists, has the same identity and has not expired. The full preview scrolls. No automatic insertion, sending, network call or clipboard read.

Review field explicitly captures the selection or limited nearby text (up to 2,000 characters). Inserting it can replace a selection or duplicate context at the cursor. Read it first. Field changes, selection changes and leaving the keyboard clear the in-memory preview.

The keyboard does not write shared storage and keeps RequestsOpenAccess false. Read-only App Group behaviour must be checked on a signed physical iPhone. Ordinary typing and Globe switching do not depend on the shared draft. See ../README.md for signing and limitations.
