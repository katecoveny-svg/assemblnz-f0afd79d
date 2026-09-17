#!/bin/bash
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Build DO on macOS with Xcode Command Line Tools. No app was built." >&2
  exit 1
fi
companion_source="$(cd "$(dirname "$0")" && pwd)"
companion_output="${1:?Pass an output directory}"
companion_arch="${DO_MAC_ARCH:-$(uname -m)}"
case "$companion_arch" in arm64|x86_64) ;; *) echo "Unsupported Mac architecture" >&2; exit 1 ;; esac
# Download ZIPs carry resources beside the source. Repo builds use canonical assets.
companion_icons="$companion_source/resources"
if [[ ! -f "$companion_icons/do-512.png" || ! -f "$companion_icons/do-192.png" ]]; then
  companion_icons="$companion_source/../../../public/do/icons"
fi
if [[ ! -f "$companion_icons/do-512.png" || ! -f "$companion_icons/do-192.png" ]]; then
  echo "DO icon resources are missing. Use the complete source download or repository checkout." >&2
  exit 1
fi
mkdir -p "$companion_output/DO.app/Contents/MacOS" "$companion_output/DO.app/Contents/Resources" "$companion_output/module-cache"
companion_iconset="$companion_output/DO.iconset"
mkdir -p "$companion_iconset"
for companion_size in 16 32 128 256 512; do
  /usr/bin/sips -z "$companion_size" "$companion_size" "$companion_icons/do-512.png" --out "$companion_iconset/icon_${companion_size}x${companion_size}.png" >/dev/null
  companion_double=$((companion_size * 2))
  /usr/bin/sips -z "$companion_double" "$companion_double" "$companion_icons/do-512.png" --out "$companion_iconset/icon_${companion_size}x${companion_size}@2x.png" >/dev/null
done
/usr/bin/iconutil -c icns "$companion_iconset" -o "$companion_output/DO.app/Contents/Resources/DO.icns"
cp "$companion_icons/do-192.png" "$companion_output/DO.app/Contents/Resources/DO-menu.png"
cp "$companion_icons/do-512.png" "$companion_output/DO.app/Contents/Resources/DO-floating.png"
cp "$companion_source/DOCompanion.swift" "$companion_output/main.swift"
xcrun swiftc -target "$companion_arch-apple-macos13.0" -swift-version 5 -module-cache-path "$companion_output/module-cache" -framework Cocoa -framework SwiftUI -framework WebKit -framework ApplicationServices -framework ServiceManagement "$companion_output/main.swift" "$companion_source/CompanionMedia.swift" -o "$companion_output/DO.app/Contents/MacOS/DO"
cat > "$companion_output/DO.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleExecutable</key><string>DO</string><key>CFBundleIdentifier</key><string>nz.co.assembl.do.companion</string><key>CFBundleName</key><string>DO</string><key>CFBundleVersion</key><string>0.4.0</string><key>CFBundleShortVersionString</key><string>0.4.0</string><key>CFBundleIconFile</key><string>DO</string><key>CFBundlePackageType</key><string>APPL</string><key>LSUIElement</key><true/><key>NSHighResolutionCapable</key><true/><key>NSMicrophoneUsageDescription</key><string>DO uses the microphone only when you choose a voice session or meeting recording. Stop ends capture.</string><key>NSAccessibilityUsageDescription</key><string>DO reads selected text and inserts reviewed text only when you choose these actions.</string></dict></plist>
PLIST
# Never remove quarantine or disable Gatekeeper. This is a development build.
/usr/bin/xattr -rd com.apple.FinderInfo "$companion_output/DO.app" 2>/dev/null || true
/usr/bin/xattr -rd com.apple.ResourceFork "$companion_output/DO.app" 2>/dev/null || true
codesign --force --sign - "$companion_output/DO.app"
codesign --verify --strict "$companion_output/DO.app"
echo "Built $companion_output/DO.app ($companion_arch). Development/ad-hoc signed; not notarised."
