document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadSection = document.getElementById('uploadSection');
    const status = document.getElementById('status');
    const stats = document.getElementById('stats');
    const testBtn = document.getElementById('testBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // Load existing stats
    loadStats();
    
    // File input handler
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    uploadSection.addEventListener('dragover', handleDragOver);
    uploadSection.addEventListener('drop', handleDrop);
    uploadSection.addEventListener('dragleave', handleDragLeave);
    
    // Button handlers
    testBtn.addEventListener('click', testRandomSelection);
    clearBtn.addEventListener('click', clearSubredditList);
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            processFile(file);
        }
    }
    
    function handleDragOver(event) {
        event.preventDefault();
        uploadSection.classList.add('dragover');
    }
    
    function handleDragLeave(event) {
        event.preventDefault();
        uploadSection.classList.remove('dragover');
    }
    
    function handleDrop(event) {
        event.preventDefault();
        uploadSection.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }
    
    function processFile(file) {
        if (!file.name.endsWith('.txt')) {
            showStatus('Please select a .txt file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            validateAndStoreSubreddits(content);
        };
        reader.readAsText(file);
    }
    
    function validateAndStoreSubreddits(content) {
        const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        if (lines.length === 0) {
            showStatus('File is empty or contains no valid subreddits', 'error');
            return;
        }
        
        // Validate subreddit names
        const validSubreddits = [];
        const invalidLines = [];
        
        lines.forEach((line, index) => {
            // Remove /r/ prefix if present
            let subreddit = line.replace(/^\/r\//, '');
            
            // Basic validation: alphanumeric + underscores, 1-21 chars
            if (/^[a-zA-Z0-9_]{1,21}$/.test(subreddit)) {
                validSubreddits.push(subreddit);
            } else {
                invalidLines.push(`Line ${index + 1}: "${line}"`);
            }
        });
        
        if (validSubreddits.length === 0) {
            showStatus('No valid subreddit names found', 'error');
            return;
        }
        
        // Store the subreddits (Firefox/Chrome compatible)
        const browser = window.browser || window.chrome;
        browser.storage.local.set({
            subreddits: validSubreddits,
            lastUpdated: Date.now()
        }, function() {
            let message = `Successfully loaded ${validSubreddits.length} subreddits`;
            if (invalidLines.length > 0) {
                message += `. ${invalidLines.length} invalid entries skipped.`;
            }
            showStatus(message, 'success');
            updateStats(validSubreddits.length, invalidLines.length);
            testBtn.disabled = false;
        });
    }
    
    function showStatus(message, type) {
        status.innerHTML = `<div class="status ${type}">${message}</div>`;
        setTimeout(() => {
            status.innerHTML = '';
        }, 5000);
    }
    
    function updateStats(valid, invalid) {
        let statsText = `${valid} valid subreddits loaded`;
        if (invalid > 0) {
            statsText += `, ${invalid} invalid entries skipped`;
        }
        stats.textContent = statsText;
    }
    
    function loadStats() {
        const browser = window.browser || window.chrome;
        browser.storage.local.get(['subreddits', 'lastUpdated'], function(result) {
            if (result.subreddits && result.subreddits.length > 0) {
                const count = result.subreddits.length;
                const date = new Date(result.lastUpdated).toLocaleDateString();
                stats.textContent = `${count} subreddits loaded (${date})`;
                testBtn.disabled = false;
            } else {
                stats.textContent = 'No subreddit list loaded';
                testBtn.disabled = true;
            }
        });
    }
    
    function testRandomSelection() {
        const browser = window.browser || window.chrome;
        browser.storage.local.get(['subreddits'], function(result) {
            if (result.subreddits && result.subreddits.length > 0) {
                const randomSubreddit = result.subreddits[Math.floor(Math.random() * result.subreddits.length)];
                showStatus(`Random selection: r/${randomSubreddit}`, 'info');
            } else {
                showStatus('No subreddit list loaded', 'error');
            }
        });
    }
    
    function clearSubredditList() {
        const browser = window.browser || window.chrome;
        browser.storage.local.remove(['subreddits', 'lastUpdated'], function() {
            showStatus('Subreddit list cleared', 'info');
            stats.textContent = 'No subreddit list loaded';
            testBtn.disabled = true;
        });
    }
});