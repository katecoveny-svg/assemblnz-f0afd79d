'use strict';
// Separate reviewed pilot package: no content scripts, stored grant or broad tabs permission.
importScripts('browser-task-worker.js');
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
