// src/background.ts

// No more triple-slash directive needed! tsconfig.json is handling it.
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});