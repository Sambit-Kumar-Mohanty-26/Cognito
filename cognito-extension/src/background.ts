console.log('Cognito background service worker is active.');

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

interface ClippedContentPayload {
  menuItemId: string;
  selectionText?: string;
  srcUrl?: string;
  sourcePageUrl: string;
  sourcePageTitle: string;
}

// Map to store active ports to side panels, keyed by the original content tabId.
const sidePanelPorts = new Map<number, chrome.runtime.Port>();
// Map to store pending clipped content, keyed by the original content tabId.
const pendingContentForSidePanel = new Map<number, ClippedContentPayload>();

chrome.runtime.onInstalled.addListener(() => {
  // Create context menus directly so they are always registered when the service worker starts
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

chrome.runtime.onConnect.addListener((port) => {
  console.log("Background: Side panel connected. Port name:", port.name);

  // When the side panel connects, its name should be the originalContentTabId
  const originalContentTabId = parseInt(port.name, 10);

  if (isNaN(originalContentTabId)) {
    console.error("Background: Connected port name is not a valid originalContentTabId:", port.name);
    return;
  }

  sidePanelPorts.set(originalContentTabId, port); // Store with number key

  // Immediately send the originalContentTabId to the side panel to establish its context
  port.postMessage({ type: 'SET_SIDE_PANEL_CONTEXT_TAB_ID', originalTabId: originalContentTabId });
  console.log("Background: Sent SET_SIDE_PANEL_CONTEXT_TAB_ID to side panel for tab:", originalContentTabId);

  // The side panel will send a SIDE_PANEL_READY message once it has processed this.
  port.onMessage.addListener((message) => {
    console.log("Background: Received message from side panel:", message.type, "for tab:", originalContentTabId);
    if (message.type === 'SIDE_PANEL_READY' && message.originalTabId) {
      const receivedOriginalTabId: number = message.originalTabId;
      console.log("Background: Received SIDE_PANEL_READY from side panel for tab:", receivedOriginalTabId);

      console.log("Background: Checking pending content for tab:", receivedOriginalTabId, ". Has content:", pendingContentForSidePanel.has(receivedOriginalTabId));
      // Check if there's any pending content for this originalContentTabId
      if (pendingContentForSidePanel.has(receivedOriginalTabId)) {
        const payload = pendingContentForSidePanel.get(receivedOriginalTabId);
        if (payload) {
          console.log("Background: Sending pending clipped content to side panel via port for tab:", receivedOriginalTabId);
          port.postMessage({ type: 'INITIALIZE_SIDE_PANEL_WITH_CONTENT', originalTabId: receivedOriginalTabId, payload: payload });
          pendingContentForSidePanel.delete(receivedOriginalTabId); // Clear pending content after sending
        }
      } else {
        console.log("Background: No pending content found for tab:", receivedOriginalTabId);
      }
    }
  });

  port.onDisconnect.addListener(() => {
    const disconnectedTabId = parseInt(port.name, 10);
    if (!isNaN(disconnectedTabId)) {
      console.log("Background: Side panel disconnected for tab:", disconnectedTabId);
      sidePanelPorts.delete(disconnectedTabId); // Clean up the port on disconnect
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) {
    console.error("Cannot send message: tab ID is missing.");
    return;
  }
  
  const originalContentTabId: number = tab.id as number;

  const payload: ClippedContentPayload = {
    menuItemId: String(info.menuItemId),
    selectionText: info.selectionText,
    srcUrl: info.srcUrl,
    sourcePageUrl: tab.url || '',
    sourcePageTitle: tab.title || '',
  };

  console.log("Background: Queuing content for tab:", originalContentTabId, "Payload:", payload);
  pendingContentForSidePanel.set(originalContentTabId, payload); // Store pending content with number key

  try {
    await chrome.sidePanel.open({
      tabId: originalContentTabId,
    });
    console.log("Background: Side panel commanded to open for tab:", originalContentTabId);

    // Inject the interceptor script into the opened side panel immediately
    await chrome.scripting.executeScript({
      target: { tabId: originalContentTabId },
      files: ['assets/languageModelInterceptor-D0AoDfnn.js'], // Updated to compiled JS file
      world: 'MAIN',
    });
    console.log(`Background: Injected LanguageModel interceptor into tab ${originalContentTabId}.`);

    // The side panel will connect via chrome.runtime.connect, its name will be the originalContentTabId.
    // The background will then send SET_SIDE_PANEL_CONTEXT_TAB_ID, and the side panel will send SIDE_PANEL_READY.

  } catch (error) {
    console.error("Background: Failed to command side panel to open for tab:", originalContentTabId, ":", error);
  }

  console.log('Background: Clipped content queued, waiting for side panel to connect and identify for tab:', originalContentTabId);
});