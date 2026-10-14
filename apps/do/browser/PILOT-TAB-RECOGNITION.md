# Pilot selected-tab recognition candidate

The installed ab5e8ac pilot opened its native Chrome side panel with the exact local fictional cart selected, but inspection reported an unsupported tab and kept Connect disabled. The Personal DO window was detected. No connection, product read, cart edit, receipt or cancellation was verified.

The current candidate opens the side panel synchronously from `chrome.action.onClicked`, using the existing `activeTab` permission. It disables the automatic side-panel toggle. A missing selected-tab URL now gives a specific instruction to select the fictional cart and click the toolbar icon again. A genuinely different URL remains rejected by the exact allowlist.

Chrome documents the action invocation as an activeTab gesture and permits sidePanel.open from that gesture. Missing URL access is a diagnosis hypothesis consistent with the visible failure, not a measured native root cause. The VM regression explicitly models redacted URL access until a native action; it cannot prove Chrome's grant behavior. References: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab and https://developer.chrome.com/docs/extensions/reference/api/sidePanel.

Validation: 89 focused browser/action/download tests passed, including three pilot gesture/strict URL tests; scoped ESLint passed. Both generated 1.9 archives match this candidate source. No manifest, permission, retailer gate or authority checks changed.

Release gate: independent review, then reload the reviewed candidate and repeat the native fixture sequence. The installed ab5e8ac directory is unchanged. Native end-to-end success remains unclaimed. Reverting the three JavaScript source changes and regenerating both archives reverses this candidate.
