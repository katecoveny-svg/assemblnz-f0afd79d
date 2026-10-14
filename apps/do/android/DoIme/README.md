# DO Android draft helper · unverified development source

This is an offline input-method source foundation, not a complete typing keyboard, verified Android app or Play Store release. The repo does not include a complete Android project/Gradle wrapper. No native cloud preparation bridge is connected.

## Explicit flow

1. Copy text yourself, then tap **Paste to review**. Clipboard access occurs only at that tap; only a literal plain-text item is read. No automatic paste, URI/provider resolution or surrounding field reads.
2. Review the full scrollable draft (up to 12,000 characters), tick the exact-text review checkbox, then tap **Insert reviewed text**. This inserts the user's pasted text, not a fabricated model result. A host rejection is shown honestly.
3. Changing the input field or selection, clearing, hiding or destroying the input view clears draft and review state. Password/private fields disable draft paste and insertion.
4. **Open DO** opens the fixed public `/do/personal` URL in a browser without text, host metadata, tokens or clipboard writes. Paste there explicitly; the website has separate sign-in and provider consent. If Android blocks opening the browser, an explanation is shown.
5. **Other keyboard** opens Android's keyboard picker so ordinary typing remains available.

The IME declares no network permission and has no API client, obsolete compile request, implicit clipboard fallback, template runner, background capture, persistent draft storage or automatic external send.

## Before any distribution

Complete an Android project with compatible Gradle/Kotlin/SDK tooling; compile and test on emulators and physical devices. Verify all lifecycle clears, clipboard restrictions, private/password fields, host rejection, keyboard switching, font scaling, TalkBack, landscape and browser-opening restrictions. The input view is a development draft panel rather than a normal typing keyboard. Signing, privacy declarations, release packaging and Play Store review are not established.

A future native preparation bridge must add authenticated, owner-bound consent and exact-result review; do not restore implicit capture or treat insertion as a preparation receipt.

Primary guidance: [Android input methods](https://developer.android.com/develop/ui/views/touch-and-input/creating-input-method), [clipboard handling](https://developer.android.com/develop/ui/views/touch-and-input/copy-paste).
