# DO portable downloads

Static mirrors of the packages also served by `/api/do/download`:

- `assembl-do-extension-1.5.0.zip` — Chrome / Edge Load unpacked
- `DO-mac-companion.zip` — Mac companion source (build on macOS; also aliased as `assembl-do-macos-1.5.0.zip`)

Prefer `/api/do/download?format=extension` or `/api/do/download?format=mac` for the newest traced package from the running app (`macos` and `mac-companion` are accepted aliases).

Refresh these files when bumping the extension version:

```bash
node scripts/package-do-downloads.mjs
```
