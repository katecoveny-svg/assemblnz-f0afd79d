# DO Mac companion — local development build

A native floating purple DO with the hosted workspace, bill research and school admin. The orb can be dragged over desktop apps. The toolbar offers explicit selection capture from the previously active app and a review-first paste action.

This is an unsigned/local development companion, not a notarised public Mac release. It is not an autonomous computer-use agent. It does not record screens, browse accounts silently, click arbitrary controls or send messages. Keyboard paste requires your explicit action and macOS Accessibility permission. Secure text fields are refused.

Build with the included `build.sh` on macOS with Xcode Command Line Tools. Output goes to the path supplied as its argument. Do not disable Gatekeeper or other macOS security controls. Distribution to other Macs requires Developer ID signing/notarisation.

Open DO, choose the app you want to work in, select text, then return to DO and choose Use selected text. Capture stays in the local review box until you choose Add to DO. Use Review clipboard to inspect a copied result; Paste reviewed text inserts it into the chosen app's current editable field. It never presses Return or Send. Review the destination yourself.

Accessibility permission is requested only through the labelled Enable app interaction button. Each capture and paste checks permission and target application again. No selected text or clipboard content is automatically read on launch.
