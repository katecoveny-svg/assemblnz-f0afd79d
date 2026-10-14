'use strict';
// Use the action event that grants activeTab, then open the panel in that window.
// Merely displaying a persistent side panel must not stand in for a tab grant.
importScripts('browser-task-worker.js');
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
chrome.action.onClicked.addListener(tab => {
  if (!Number.isInteger(tab.id) || !Number.isInteger(tab.windowId)) return;
  // Keep this call synchronous with Chrome's user gesture (no preceding await).
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
});
