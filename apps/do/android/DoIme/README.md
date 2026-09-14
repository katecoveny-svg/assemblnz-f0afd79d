# DO IME (Android) — compiling-ready stub

Kotlin **Input Method Editor** scaffold for assembl DO. Not Play Store–ready; Linux CI cannot build this. Open in Android Studio.

## What it does (intended)

- ✦ key + template strip: **Watch / Brief / Slop-check / Mitre brief**
- On ✦: send selection/clipboard + optional host package name to DO compile API
- Default API base from `BuildConfig` / `do_api_base` string resource

## Open in Android Studio

1. File → New → Import Module (or New Project) → point at `apps/do/android/DoIme`
2. Sync Gradle (stub `build.gradle.kts` included)
3. Run on emulator/device
4. Settings → System → Languages & input → On-screen keyboard → Manage keyboards → enable **DO**
5. When prompted about network / collecting text: explain Full Access equivalent honestly

## Trust warning

> DO keyboard needs permission to use the network so it can send the text you choose to your DO API. It does not silently upload keystrokes. Disable the keyboard anytime in Settings.

## Configure API base

`res/values/config.xml` → `do_api_base` (default `http://10.0.2.2:3000` for emulator → host localhost).

```
POST {apiBase}/api/do/message
{ "surface": "keyboard", "brief": "…", "selection": "…", "hostBundleId": "com.example.host" }
```

## Template strip ids

Same as iOS — see `DoKeyboardService.kt`.

## Related

- iOS: `apps/do/ios/DoKeyboard/`
- Home widget: `apps/do/android/DoNeedsYouWidget/`
- Web preview: `/do`
