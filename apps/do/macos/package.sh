#!/bin/bash
set -euo pipefail
companion_source="$(cd "$(dirname "$0")" && pwd)"
companion_output="${1:?Pass an output directory}"
mkdir -p "$companion_output"
companion_output="$(cd "$companion_output" && pwd)"
# Build outside synced Documents folders: file providers can add FinderInfo
# after signing and invalidate an otherwise valid app bundle.
companion_work="$(mktemp -d "${TMPDIR:-/tmp}/do-package.XXXXXX")"
companion_stage="$companion_work/installer"
mkdir -p "$companion_stage"
# Only remove the temporary directory this invocation created.
trap 'rm -rf "$companion_work"' EXIT
bash "$companion_source/build.sh" "$companion_work/build"
ditto "$companion_work/build/DO.app" "$companion_stage/DO.app"
codesign --verify --deep --strict "$companion_stage/DO.app"
ln -s /Applications "$companion_stage/Applications"
cat > "$companion_stage/Read me.txt" <<'README'
DO for Mac — development preview

Drag DO.app into Applications, then open it from Applications.
DO appears in the menu bar and as a draggable floating D.
Click the floating D to open your workspace.
Use the DO menu to show/hide it and optionally start DO at login.

This development build is ad-hoc signed, not notarised by Apple.
It is not a public-distribution release. Do not disable macOS security
protections to open it. A public installer requires Developer ID signing
and Apple notarisation.

Selected-text access is optional and requires your Accessibility permission.
Dragging DO does not capture or share your screen. Context and insertion
remain explicit actions. This app does not install the browser extension.
README
hdiutil create -volname "DO development" -srcfolder "$companion_stage" -ov -format UDZO "$companion_output/DO-development.dmg"
codesign --verify --deep --strict "$companion_stage/DO.app"
hdiutil verify "$companion_output/DO-development.dmg"
