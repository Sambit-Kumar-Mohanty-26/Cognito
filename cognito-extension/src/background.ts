console.log('Cognito background service worker is active.');
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-selection-to-cognito',
    title: 'Save Selection to Cognito',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'save-image-to-cognito',
    title: 'Save Image to Cognito',
    contexts: ['image'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.runtime.sendMessage({
    type: 'SAVE_CLIPPED_CONTENT',
    payload: {
      menuItemId: info.menuItemId,
      selectionText: info.selectionText,
      srcUrl: info.srcUrl,
      sourcePageUrl: tab?.url || '',
      sourcePageTitle: tab?.title || '',
    },
  });
});