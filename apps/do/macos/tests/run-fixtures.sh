#!/bin/bash
set -euo pipefail
fixture_root="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$fixture_root"
mkdir -p output/widget-fixture
python3 - <<'PY'
from pathlib import Path
source=Path('apps/do/macos/DOCompanion.swift').read_text()
marker='let application = NSApplication.shared'
assert source.count(marker)==1, 'Review changed native entry before generating test executable.'
tests=Path('apps/do/macos/tests/WidgetCaptureTests.swift').read_text()
Path('output/widget-fixture/main.swift').write_text(source[:source.index(marker)]+tests)
PY
xcrun swiftc -D DO_WIDGET_FIXTURE -target arm64-apple-macos13.0 -swift-version 5 \
  -module-cache-path output/widget-fixture/module-cache \
  -framework Cocoa -framework SwiftUI -framework WebKit -framework ApplicationServices -framework ServiceManagement \
  output/widget-fixture/main.swift apps/do/macos/CompanionMedia.swift apps/do/macos/NativeReviewBridge.swift -o output/widget-fixture/widget-fixture
output/widget-fixture/widget-fixture
