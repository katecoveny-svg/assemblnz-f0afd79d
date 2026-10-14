# DO native Android · development source

No compiled, signed or distributed Android app is established. These folders are source foundations, not a complete Gradle project or Play Store build.

- `DoIme/`: offline, explicit paste → exact-text review → insertion helper, with a fixed public web-DO handoff and keyboard picker. No network permission or automatic context capture; ordinary typing needs another keyboard. See its README for safeguards and required device tests.
- `DoNeedsYouWidget/`: separate historical home-widget scaffold, not connected to real work status. Its placeholder counts must not be presented as a live agent or notification service.

Android overlays would require a separately built native capability and user-granted permission. A DO webpage/PWA cannot float over other apps. No overlay permission is requested here.
