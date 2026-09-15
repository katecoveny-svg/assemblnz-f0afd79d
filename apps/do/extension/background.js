'use strict';
// The worker only configures the browser panel. It never reads pages or starts tasks.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
// A click on the explicitly installed page companion can reopen the panel.
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message?.type !== 'do:open-panel' || sender.id !== chrome.runtime.id || !sender.tab?.id) return false;
  chrome.sidePanel.open({tabId:sender.tab.id}).then(()=>reply({ok:true})).catch(()=>reply({ok:false}));
  return true;
});
