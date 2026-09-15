'use strict';
// The worker only configures the browser panel. It never reads pages or starts tasks.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
