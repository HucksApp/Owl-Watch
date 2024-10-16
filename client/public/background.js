
// Store interval ID globally to clear it when needed
let watchInterval = null;


// Listen for messages to start or stop watching tabs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startWatch') {
      const { gapTime, watchMode, urls, excludeUrls } = request.settings;
      console.log('Starting tab watch with settings:', request.settings);

      // Stop any existing alarms
      chrome.alarms.clear('watchAlarm');

      startWatch({ gapTime, watchMode, urls, excludeUrls });

      // Save watch state and settings
      chrome.storage.local.set({ 
          watchActive: true,
          watchSettings: { gapTime, watchMode, urls, excludeUrls } // Save settings
      });
      
      sendResponse({ status: 'watch_started' });
  } else if (request.action === 'stopWatch') {
      // Clear the alarm if stopping the watch
      chrome.alarms.clear('watchAlarm');
      chrome.storage.local.set({ watchActive: false }); // Save watch state
      sendResponse({ status: 'watch_stopped' });
  }
});

// Start the watch process
const startWatch = (settings) => {
    const { gapTime } = settings;

    // Run the check immediately, then create an alarm for repeated checks
    checkTabs(settings);

    // Schedule an alarm to run `checkTabs` at intervals based on `gapTime`
    chrome.alarms.create('watchAlarm', {
        delayInMinutes: parseGapTimeToMinutes(gapTime),
        periodInMinutes: parseGapTimeToMinutes(gapTime)
    });
};

// Listener for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'watchAlarm') {
        chrome.storage.local.get('watchSettings', (data) => {
            if (data.watchSettings) {
                checkTabs(data.watchSettings);  // Run the `checkTabs` function using the saved settings
            }
        });
    }
});


// Check and manage tabs
const checkTabs = (settings) => {
  const { gapTime } = settings;

  chrome.tabs.query({}, (tabs) => {
    // Load cached session data for both sessions
    chrome.storage.local.get(['owl_watch_session', 'tabManagerSession'], (result) => {
      const cachedOwlSession = result.owl_watch_session || { tabs: [] };
      const cachedTabManagerSession = result.tabManagerSession || { tabs: [] };

      // Get the current tabs, using the cached last accessed time if available from both sessions
      const currentTabs = tabs.map(tab => {
        const owlCachedTab = cachedOwlSession.tabs.find(cachedTab => cachedTab.url === tab.url);
        const tabManagerCachedTab = cachedTabManagerSession.tabs.find(cachedTab => cachedTab.url === tab.url);

        // Determine which session cache has the most recent last accessed time
        const lastAccessed = owlCachedTab && tabManagerCachedTab 
          ? new Date(owlCachedTab.lastAccessed) > new Date(tabManagerCachedTab.lastAccessed) 
            ? owlCachedTab.lastAccessed 
            : tabManagerCachedTab.lastAccessed 
          : (owlCachedTab || tabManagerCachedTab) 
            ? (owlCachedTab ? owlCachedTab.lastAccessed : tabManagerCachedTab.lastAccessed)
            : new Date().toISOString();  // Default to current time if not cached

        return {
          id: tab.id,
          url: tab.url,
          lastAccessed: lastAccessed  // Use the determined last accessed time
        };
      });

      // Remove duplicate tabs by URL
      const uniqueTabs = removeDuplicateTabs(currentTabs);

      // Get the tabs to close based on the settings and gap time
      const tabsToClose = getTabsToClose(uniqueTabs, cachedOwlSession, gapTime, settings.watchMode, settings.urls, settings.excludeUrls);

      // Close tabs that need to be closed
      closeTabs(tabsToClose);

      // Update both sessions with the current unique tabs and their last accessed times
      const newOwlSession = {
        tabs: uniqueTabs,
        watchStarted: new Date().toISOString(),
        nextWatch: addTimeToCurrentDate(gapTime),
      };

      const newTabManagerSession = {
        tabs: uniqueTabs.map(tab => ({
          id: tab.id,
          url: tab.url,
          lastAccessed: tab.lastAccessed  // Copy last accessed from unique tabs
        })),
        watchStarted: new Date().toISOString(),
        nextWatch: addTimeToCurrentDate(gapTime),
      };

      chrome.storage.local.set({
        'owl_watch_session': newOwlSession,
        'tabManagerSession': newTabManagerSession
      });
    });
  });
};



// Remove duplicate tabs by URL
const removeDuplicateTabs = (tabs) => {
    const seenUrls = new Set();
    const uniqueTabs = [];

    tabs.forEach(tab => {
        if (!seenUrls.has(tab.url)) {
            seenUrls.add(tab.url);
            uniqueTabs.push(tab);
        } else {
            console.log('Removing duplicate tab:', tab.url);  // Debugging
            chrome.tabs.remove(tab.id);  // Close the duplicate tab
        }
    });

    return uniqueTabs;
};

// Update lastAccessed when a tab is activated
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      // Get both sessions (tabManagerSession and owl_watch_session)
      chrome.storage.local.get(['owl_watch_session', 'tabManagerSession'], (result) => {
        const tabManagerSession = result.tabManagerSession || { tabs: [] };
        const owlWatchSession = result.owl_watch_session || { tabs: [] };
        const currentTime = new Date().toISOString();  // Use ISO format

        // Update tabManagerSession
        const tabManagerTab = tabManagerSession.tabs.find(t => t.id === tab.id);
        if (tabManagerTab) {
          tabManagerTab.lastAccessed = currentTime;  // Update last accessed in tabManagerSession
        } else {
          tabManagerSession.tabs.push({ id: tab.id, url: tab.url, lastAccessed: currentTime });
        }

        // Update owl_watch_session
        const owlTab = owlWatchSession.tabs.find(t => t.id === tab.id);
        if (owlTab) {
          owlTab.lastAccessed = currentTime;  // Update last accessed in owl_watch_session
        } else {
          owlWatchSession.tabs.push({ id: tab.id, url: tab.url, lastAccessed: currentTime });
        }

        // Save both sessions
        chrome.storage.local.set({ 
          owl_watch_session: owlWatchSession,
          tabManagerSession: tabManagerSession 
        });
      });
    }
  });
});


// Get tabs that need to be closed
const getTabsToClose = (currentTabs, cachedSession, gapTime, watchMode, urls, excludeUrls) => {
    if (!cachedSession || !cachedSession.tabs) return [];

    const timeNow = new Date(); // Get current time for comparisons

    return currentTabs.filter(tab => {
        const cachedTab = cachedSession.tabs.find(cachedTab => cachedTab.url === tab.url);

        // If no cached tab is found, skip this tab
        if (!cachedTab) {
            console.warn(`No cached tab found for URL: ${tab.url}`);
            return false;
        }

        if (tab.active) {
          console.log(`Skipping active tab: ${tab.url}`);
          return false;
      }

        // Check if the last accessed date is valid
        const lastAccessedDate = new Date(cachedTab.lastAccessed);
        if (isNaN(lastAccessedDate.getTime())) {
            console.error(`Invalid last accessed date for tab: ${cachedTab.url}`, cachedTab.lastAccessed);
            return false;  // Skip invalid dates
        }

        const hasExpired = (timeNow - lastAccessedDate) > parseGapTimeToMilliseconds(gapTime);

        console.log(`Checking tab: ${tab.url}, Last accessed: ${lastAccessedDate.toISOString()}, Has expired: ${hasExpired}`);
        
        // Logic for closing tabs based on watchMode
        if (watchMode === 'all' && hasExpired) {
            return true;  // Close if expired in 'all' mode
        }

        if (watchMode === 'urls' && urls.some(url => tab.url.includes(url.trim())) && hasExpired) {
            return true;  // Close if expired and URL matches
        }

        if (watchMode === 'exclude' && !excludeUrls.some(url => tab.url.includes(url.trim())) && hasExpired) {
            return true;  // Close if expired and not in the excluded list
        }

        return false;  // Default case, do not close the tab
    });
};

// Close tabs
const closeTabs = (tabsToClose) => {
    tabsToClose.forEach(tab => {
        console.log('Closing tab:', tab.url);  // Debugging
        chrome.tabs.remove(tab.id);
    });
};

// Parse the gap time into minutes for alarms
const parseGapTimeToMinutes = (gapTime) => {
  const timeMultiplier = {
      m: 1,  
      h: 60,
      d: 24 * 60,
  };
  const unit = gapTime.slice(-1);
  const amount = parseInt(gapTime.slice(0, -1), 10);
  const minutes = amount * timeMultiplier[unit];
  
  console.log(`Parsed gap time "${gapTime}" to ${minutes} minutes`); // Debugging
  return minutes;
};

// Parse the gap time into milliseconds
const parseGapTimeToMilliseconds = (gapTime) => {
  const timeMultiplier = {
      m: 60 * 1000,  
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
  };
  const unit = gapTime.slice(-1);
  const amount = parseInt(gapTime.slice(0, -1), 10);
  const milliseconds = amount * timeMultiplier[unit];
  
  console.log(`Parsed gap time "${gapTime}" to ${milliseconds} milliseconds`); // Debugging
  return milliseconds;
};

// Add time to the current date based on gap time
const addTimeToCurrentDate = (gapTime) => {
  return new Date(Date.now() + parseGapTimeToMilliseconds(gapTime)).toISOString(); // Store as ISO string
};


// Retrieve session for debugging purposes
chrome.storage.local.get(['owl_watch_session'], (result) => {
    console.log('Retrieved session from storage:', result);
});



chrome.runtime.onInstalled.addListener(() => {
    console.log("Owl Watch extension installed.");
  });


  // Update existing code with tab access tracking

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active && tab.url !== 'about:blank') {
      console.log("Tab updated: ", tab);
  
      // Get both sessions (tabManagerSession and owl_watch_session)
      chrome.storage.local.get(["tabManagerSession", "owl_watch_session"], (result) => {
        const tabManagerSession = result.tabManagerSession || { tabs: [] };
        const owlWatchSession = result.owl_watch_session || { tabs: [] };
        const currentTime = new Date().toISOString();
  
        // Update tabManagerSession
        const tabIndex = tabManagerSession.tabs.findIndex((t) => t.id === tabId);
        if (tabIndex !== -1) {
          tabManagerSession.tabs[tabIndex].lastAccessed = currentTime; // Update last accessed time if the tab exists
        } else {
          tabManagerSession.tabs.push({ id: tabId, url: tab.url, lastAccessed: currentTime }); // Add tab if not found
        }
  
        // Update owl_watch_session
        const owlTabIndex = owlWatchSession.tabs.findIndex((t) => t.id === tabId);
        if (owlTabIndex !== -1) {
          owlWatchSession.tabs[owlTabIndex].lastAccessed = currentTime; // Update last accessed time in owl session
        } else {
          owlWatchSession.tabs.push({ id: tabId, url: tab.url, lastAccessed: currentTime }); // Add tab to owl session if not found
        }
  
        // Save the updated sessions back to storage
        chrome.storage.local.set({ 
          tabManagerSession: tabManagerSession, 
          owl_watch_session: owlWatchSession 
        });
      });
    }
  });
  

// Enhance the message listener to handle more commands for tab management
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "getTabs") {
    // Get all current tabs, not just active ones
    chrome.tabs.query({}, (tabs) => {
      chrome.storage.local.get(["tabManagerSession"], (result) => {
        const session = result.tabManagerSession || { tabs: [] };

        // Enrich the tab data with last accessed time
        const enrichedTabs = tabs.map((tab) => {
          const cachedTab = session.tabs.find((t) => t.id === tab.id);
          return {
            ...tab,
            lastAccessed: cachedTab ? cachedTab.lastAccessed : "Unknown",
          };
        });

        // Send enriched tab data back to the frontend
        sendResponse(enrichedTabs);
      });
    });
    return true;  // Keeps the message channel open for async response

  } else if (request.message === "closeTab") {
    // Close a specific tab by tabId
    const { tabId } = request;
    chrome.tabs.remove(tabId, () => {
      console.log(`Tab ${tabId} closed`);
      sendResponse({ status: "Tab closed" });
    });
    return true;  // Keeps the channel open for async response

  } else if (request.message === "closeNonActiveTabs") {
    // Close all non-active tabs
    chrome.tabs.query({}, (tabs) => {
      const nonActiveTabs = tabs.filter((tab) => !tab.active);
      nonActiveTabs.forEach((tab) => {
        chrome.tabs.remove(tab.id, () => {
          console.log(`Closed non-active tab: ${tab.url}`);
        });
      });
      sendResponse({ status: "Non-active tabs closed" });
    });
    return true;  // Keeps the channel open for async response

  } else if (request.message === "closeAllTabs") {
    // Close all open tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.remove(tab.id, () => {
          console.log(`Closed tab: ${tab.url}`);
        });
      });
      sendResponse({ status: "All tabs closed" });
    });
    return true;  // Keeps the channel open for async response
  }
});






chrome.runtime.onInstalled.addListener(() => {
  console.log("Service worker started.");

  // Test if chrome.alarms API is available
  chrome.alarms.create('testAlarm', { delayInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'testAlarm') {
      console.log('Test alarm triggered');
    }
  });
});