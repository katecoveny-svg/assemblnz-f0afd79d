#!/bin/bash
set -euo pipefail
companion_source="$(cd "$(dirname "$0")" && pwd)"
companion_output="${1:?Pass an output directory}"
mkdir -p "$companion_output/DO.app/Contents/MacOS" "$companion_output/DO.app/Contents/Resources" "$companion_output/module-cache"
companion_root="$(cd "$companion_source/../../.." && pwd)"
companion_iconset="$companion_output/DO.iconset"
mkdir -p "$companion_iconset"
for companion_size in 16 32 128 256 512; do
  /usr/bin/sips -z "$companion_size" "$companion_size" "$companion_root/public/do/icons/do-512.png" --out "$companion_iconset/icon_${companion_size}x${companion_size}.png" >/dev/null
  companion_double=$((companion_size * 2))
  /usr/bin/sips -z "$companion_double" "$companion_double" "$companion_root/public/do/icons/do-512.png" --out "$companion_iconset/icon_${companion_size}x${companion_size}@2x.png" >/dev/null
done
/usr/bin/iconutil -c icns "$companion_iconset" -o "$companion_output/DO.app/Contents/Resources/DO.icns"
cp "$companion_root/public/do/icons/do-192.png" "$companion_output/DO.app/Contents/Resources/DO-menu.png"
cp "$companion_root/public/do/icons/do-512.png" "$companion_output/DO.app/Contents/Resources/DO-floating.png"
xcrun swiftc -target "$(uname -m)-apple-macos13.0" -swift-version 5 -module-cache-path "$companion_output/module-cache" -framework Cocoa -framework SwiftUI -framework WebKit -framework ApplicationServices -framework ServiceManagement "$companion_source/DOCompanion.swift" -o "$companion_output/DO.app/Contents/MacOS/DO"
cat > "$companion_output/DO.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleExecutable</key><string>DO</string><key>CFBundleIdentifier</key><string>nz.co.assembl.do.companion</string><key>CFBundleName</key><string>DO</string><key>CFBundleVersion</key><string>0.3.0</string><key>CFBundleShortVersionString</key><string>0.3.0</string><key>CFBundleIconFile</key><string>DO</string><key>CFBundlePackageType</key><string>APPL</string><key>LSUIElement</key><true/><key>NSHighResolutionCapable</key><true/><key>NSAccessibilityUsageDescription</key><string>DO reads selected text and inserts reviewed text only when you choose these actions.</string></dict></plist>
PLIST
# Remove Finder decoration only from our generated bundle. Keep quarantine and other security metadata intact.
/usr/bin/xattr -rd com.apple.FinderInfo "$companion_output/DO.app" 2>/dev/null || true
/usr/bin/xattr -rd com.apple.ResourceFork "$companion_output/DO.app" 2>/dev/null || true
codesign --force --sign - "$companion_output/DO.app"
