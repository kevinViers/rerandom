// Content script to handle r/random redirects
(function() {
    'use strict';
    
    // Check if we're on a r/random URL
    if (window.location.pathname.startsWith('/r/random')) {
        // Get subreddit list from storage and redirect
        chrome.storage.local.get(['subreddits'], function(result) {
            if (result.subreddits && result.subreddits.length > 0) {
                const randomIndex = Math.floor(Math.random() * result.subreddits.length);
                const randomSubreddit = result.subreddits[randomIndex];
                
                // Build the redirect URL, preserving the current domain and any additional path/query params
                const currentUrl = new URL(window.location.href);
                const newPath = `/r/${randomSubreddit}${currentUrl.pathname.replace('/r/random', '')}`;
                const redirectUrl = `${currentUrl.origin}${newPath}${currentUrl.search}${currentUrl.hash}`;
                
                // Redirect to the random subreddit
                window.location.replace(redirectUrl);
            } else {
                // No subreddit list loaded - show a helpful message
                document.body.innerHTML = `
                    <div style="
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        text-align: center;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border: 1px solid #dee2e6;
                    ">
                        <h2 style="color: #ff4500; margin-bottom: 20px;">ReRandom</h2>
                        <p style="font-size: 16px; margin-bottom: 15px;">
                            Noob forgot to upload .txt lol
                        </p>
                        <button onclick="window.history.back()" style="
                            background: #ff4500;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 4px;
                            font-size: 14px;
                            cursor: pointer;
                        ">
                            Go Back
                        </button>
                    </div>
                `;
            }
        });
    }
})();