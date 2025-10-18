import { addCard } from './db';
import type { ResearchCard } from './types';

console.log("Cognito Service Worker Loaded.");
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-cognito",
    title: "Save to Cognito Notebook",
    contexts: ["selection", "image", "link"]
  });
});

chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === "add-to-cognito" && tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getClippedData,
      args: [info]
    });
  }
});

function getClippedData(info: chrome.contextMenus.OnClickData) {
  let clipData = {
    type: 'text', 
    content: "",
    sourceUrl: info.pageUrl || window.location.href
  };

  if (info.selectionText) {
    clipData.type = 'text';
    clipData.content = info.selectionText;
  } else if (info.mediaType === "image") {
    clipData.type = 'image';
    clipData.content = info.srcUrl || "";
  } else if (info.linkUrl) {
    clipData.type = 'link'; 
    clipData.content = info.linkUrl;
  }

  chrome.runtime.sendMessage({
    type: "CLIP_DATA_FROM_PAGE",
    payload: clipData
  });
}

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender) => {
  if (message.type === "CLIP_DATA_FROM_PAGE") {
    console.log("Data received from page:", message.payload);

    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }

    const newCard: Omit<ResearchCard, 'id'> = {
      type: message.payload.type,
      content: message.payload.content,
      sourceUrl: message.payload.sourceUrl,
      createdAt: Date.now(),
      
      summary: '',
      tags: []
    };

    addCard(newCard)
      .then(() => {
        console.log("Successfully saved card to database!");
      })
      .catch(err => {
        console.error("Error saving card:", err);
      });
  }
});

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});