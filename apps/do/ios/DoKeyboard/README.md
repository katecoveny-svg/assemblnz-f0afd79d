# DO Keyboard: offline development foundation

This is source, not an installed keyboard or a tested App Store build. UIKit cannot be compiled in this Linux environment.

The existing scaffold has been replaced with ordinary letter/number input, shift, space, delete, return and next-keyboard controls. **DO · review text** explicitly reads the selection or limited nearby field text and shows up to 2,000 characters. **Insert reviewed text** inserts only after a second tap. This may replace a selection or duplicate nearby text at the cursor: review before inserting. Moving the selection, editing or leaving clears the review.

No clipboard access, private host-bundle lookup, microphone, API call, telemetry or storage. Full Access is disabled and unnecessary. This is an offline context-review foundation, not model-backed rewriting or an execution agent.

## Device build

Create an iOS application target in Xcode and a Custom Keyboard Extension target. Add these Swift files and Info.plist to the extension, set the principal class, sign both targets with your development team and run on an authorised iPhone. Add DO in Settings → General → Keyboard → Keyboards. Test Globe switching, secure-field fallback, selections, cursor movement, insertion and rotation in several apps. App Store/TestFlight distribution needs signing, a useful containing app, privacy disclosures and review; none has been completed here.

## Next boundary

Add a native companion with scoped authentication and revocation before connecting cloud preparation. Do not impersonate a browser by changing Origin headers or put provider secrets in the extension. Show exact context and task, require per-request permission, validate success/error responses and retain a separate explicit insertion step. Provider responses cannot send messages. Keep all normal typing available without Full Access. Do not attempt to launch other apps from a keyboard action.

Primary constraints: https://developer.apple.com/app-store/review/guidelines/#extensions and https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/CustomKeyboard.html
