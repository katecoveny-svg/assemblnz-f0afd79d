#!/bin/bash
set -euo pipefail
companion_source="$(cd "$(dirname "$0")" && pwd)"
companion_output="${1:?Pass an output directory}"
mkdir -p "$companion_output/DO.app/Contents/MacOS" "$companion_output/DO.app/Contents/Resources" "$companion_output/module-cache"
xcrun swiftc -swift-version 5 -module-cache-path "$companion_output/module-cache" -framework Cocoa -framework SwiftUI -framework WebKit -framework ApplicationServices "$companion_source/DOCompanion.swift" -o "$companion_output/DO.app/Contents/MacOS/DO"
cat > "$companion_output/DO.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleExecutable</key><string>DO</string><key>CFBundleIdentifier</key><string>nz.co.assembl.do.companion</string><key>CFBundleName</key><string>DO</string><key>CFBundleVersion</key><string>0.1.0</string><key>CFBundlePackageType</key><string>APPL</string><key>LSUIElement</key><true/><key>NSHighResolutionCapable</key><true/><key>NSAccessibilityUsageDescription</key><string>DO reads selected text and inserts reviewed text only when you choose these actions.</string></dict></plist>
PLIST
codesign --force --sign - "$companion_output/DO.app"
