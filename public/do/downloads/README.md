# DO portable downloads

Static mirrors of the packages also served by `/api/do/download`:

- `assembl-do-extension-1.5.0.zip` — Chrome / Edge Load unpacked
- `assembl-do-macos-1.5.0.zip` — Mac companion source (build on macOS)

Prefer `/api/do/download?format=extension|macos` for the newest traced package from the running app.
Refresh these files when bumping the extension version (see `app/api/do/download/route.ts`).
