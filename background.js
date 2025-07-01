// Background script for the Reddit Random extension
// This handles any background tasks and ensures the extension stays active

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        console.log('ReRandom is alive!');
        
        // Set default storage if needed
        chrome.storage.local.get(['subreddits'], function(result) {
            if (!result.subreddits) {
                chrome.storage.local.set({
                    subreddits: [],
                    lastUpdated: null
                });
            }
        });
    }
});

// Optional: Add context menu item for quick access
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "openRandomSubreddit",
        title: "Go to Random Subreddit",
        contexts: ["page"],
        documentUrlPatterns: ["*://reddit.com/*", "*://www.reddit.com/*"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "openRandomSubreddit") {
        chrome.storage.local.get(['subreddits'], function(result) {
            if (result.subreddits && result.subreddits.length > 0) {
                const randomIndex = Math.floor(Math.random() * result.subreddits.length);
                const randomSubreddit = result.subreddits[randomIndex];
                const url = `https://www.reddit.com/r/${randomSubreddit}`;
                
                chrome.tabs.update(tab.id, { url: url });
            } else {
                // Open the extension popup to let user upload list
                chrome.action.openPopup();
            }
        });
    }
});