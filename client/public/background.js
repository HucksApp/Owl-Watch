/**
 * @fileoverview Background script for the Owl Watch Chrome extension.
 * This script manages tab watching functionality, including starting and stopping
 * the watch process, checking tab activity, and closing inactive tabs based on user settings.
 */

// Store interval ID globally to clear it when needed
let watchInterval = null;

/**
 * Listen for messages for session start and stop watcher tracking.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startWatch") {
    const { gapTime, watchMode, urls, excludeUrls } = request.settings;
    console.log("Starting tab watch with settings:", request.settings);
    chrome.alarms.clear("watchAlarm");
    startWatch({ gapTime, watchMode, urls, excludeUrls });
    chrome.storage.local.set({
      watchActive: true,
      watchSettings: { gapTime, watchMode, urls, excludeUrls },
    });
    sendResponse({ status: "watch_started" });
  } else if (request.action === "stopWatch") {
    chrome.alarms.clear("watchAlarm");
    chrome.storage.local.set({ watchActive: false });
    sendResponse({ status: "watch_stopped" });
  }
});

/**
 * Start the watch process by checking tabs and setting up an alarm.
 *
 * @param {Object} settings - The settings for watching tabs.
 * @param {string} settings.gapTime - The time gap for checks.
 */
const startWatch = (settings) => {
  const { gapTime } = settings;
  checkTabs(settings);
  chrome.alarms.create("watchAlarm", {
    delayInMinutes: parseGapTimeToMinutes(gapTime),
    periodInMinutes: parseGapTimeToMinutes(gapTime),
  });
};

/**
 * Listener for alarms to trigger tab checks.
 *
 * @param {Object} alarm - The alarm object.
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "watchAlarm") {
    chrome.storage.local.get("watchSettings", (data) => {
      if (data.watchSettings) {
        checkTabs(data.watchSettings);
      }
    });
  }
});

/**
 * Check and manage open tabs, including updating sessions and closing inactive tabs.
 *
 * @param {Object} settings - The settings for checking tabs.
 */
const checkTabs = (settings) => {
  const { gapTime } = settings;

  chrome.tabs.query({}, (tabs) => {
    chrome.storage.local.get(
      ["owl_watch_session", "tabManagerSession"],
      (result) => {
        const cachedOwlSession = result.owl_watch_session || { tabs: [] };
        const cachedTabManagerSession = result.tabManagerSession || {
          tabs: [],
        };
        const currentTabs = tabs.map((tab) => {
          const owlCachedTab = cachedOwlSession.tabs.find(
            (cachedTab) => cachedTab.url === tab.url
          );
          const tabManagerCachedTab = cachedTabManagerSession.tabs.find(
            (cachedTab) => cachedTab.url === tab.url
          );

          const lastAccessed =
            owlCachedTab && tabManagerCachedTab
              ? new Date(owlCachedTab.lastAccessed) >
                new Date(tabManagerCachedTab.lastAccessed)
                ? owlCachedTab.lastAccessed
                : tabManagerCachedTab.lastAccessed
              : owlCachedTab || tabManagerCachedTab
              ? owlCachedTab
                ? owlCachedTab.lastAccessed
                : tabManagerCachedTab.lastAccessed
              : new Date().toISOString();

          return {
            id: tab.id,
            url: tab.url,
            lastAccessed: lastAccessed,
          };
        });

        // Remove duplicate tabs by URL
        const uniqueTabs = removeDuplicateTabs(currentTabs);

        const tabsToClose = getTabsToClose(
          uniqueTabs,
          cachedOwlSession,
          gapTime,
          settings.watchMode,
          settings.urls,
          settings.excludeUrls
        );

        closeTabs(tabsToClose);

        // Update both sessions with the current unique tabs and their last accessed times
        const newOwlSession = {
          tabs: uniqueTabs,
          watchStarted: new Date().toISOString(),
          nextWatch: addTimeToCurrentDate(gapTime),
        };

        const newTabManagerSession = {
          tabs: uniqueTabs.map((tab) => ({
            id: tab.id,
            url: tab.url,
            lastAccessed: tab.lastAccessed,
          })),
          watchStarted: new Date().toISOString(),
          nextWatch: addTimeToCurrentDate(gapTime),
        };

        chrome.storage.local.set({
          owl_watch_session: newOwlSession,
          tabManagerSession: newTabManagerSession,
        });
      }
    );
  });
};

/**
 * Remove duplicate tabs by URL and close the duplicates.
 *
 * @param {Array} tabs - The array of tabs to process.
 * @returns {Array} uniqueTabs - The array of unique tabs.
 */
const removeDuplicateTabs = (tabs) => {
  const seenUrls = new Set();
  const uniqueTabs = [];

  tabs.forEach((tab) => {
    if (!seenUrls.has(tab.url)) {
      seenUrls.add(tab.url);
      uniqueTabs.push(tab);
    } else {
      console.log("Removing duplicate tab:", tab.url);
      chrome.tabs.remove(tab.id);
    }
  });

  return uniqueTabs;
};

/**
 * Listen activation (new tabs) event to Update lastAccessed on cached data
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      chrome.storage.local.get(
        ["owl_watch_session", "tabManagerSession"],
        (result) => {
          const tabManagerSession = result.tabManagerSession || { tabs: [] };
          const owlWatchSession = result.owl_watch_session || { tabs: [] };
          const currentTime = new Date().toISOString();

          // Update tabManagerSession
          const tabManagerTab = tabManagerSession.tabs.find(
            (t) => t.id === tab.id
          );
          if (tabManagerTab) {
            tabManagerTab.lastAccessed = currentTime;
          } else {
            tabManagerSession.tabs.push({
              id: tab.id,
              url: tab.url,
              lastAccessed: currentTime,
            });
          }
          // Update owl_watch_session
          const owlTab = owlWatchSession.tabs.find((t) => t.id === tab.id);
          if (owlTab) {
            owlTab.lastAccessed = currentTime;
          } else {
            owlWatchSession.tabs.push({
              id: tab.id,
              url: tab.url,
              lastAccessed: currentTime,
            });
          }

          // Save both sessions
          chrome.storage.local.set({
            owl_watch_session: owlWatchSession,
            tabManagerSession: tabManagerSession,
          });
        }
      );
    }
  });
});

/**
 * Get tabs that need to be closed based on settings.
 *
 * @param {Array} currentTabs - The current tabs to check against.
 * @param {Object} cachedSession - The cached session data.
 * @param {string} gapTime - The time gap for closing inactive tabs.
 * @param {string} watchMode - The mode for watching tabs (all, urls, exclude).
 * @param {Array} urls - The list of URLs to include.
 * @param {Array} excludeUrls - The list of URLs to exclude.
 * @returns {Array} tabsToClose - The tabs that need to be closed.
 */
const getTabsToClose = (
  currentTabs,
  cachedSession,
  gapTime,
  watchMode,
  urls,
  excludeUrls
) => {
  if (!cachedSession || !cachedSession.tabs) return [];

  const timeNow = new Date();

  return currentTabs.filter((tab) => {
    const cachedTab = cachedSession.tabs.find(
      (cachedTab) => cachedTab.url === tab.url
    );

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
      console.error(
        `Invalid last accessed date for tab: ${cachedTab.url}`,
        cachedTab.lastAccessed
      );
      return false;
    }
    const hasExpired =
      timeNow - lastAccessedDate > parseGapTimeToMilliseconds(gapTime);

    if (watchMode === "all" && hasExpired) {
      return true; // Close if expired in 'all' mode
    }

    if (
      watchMode === "urls" &&
      urls.some((url) => tab.url.includes(url.trim())) &&
      hasExpired
    ) {
      return true; // Close if expired and URL matches
    }

    if (
      watchMode === "exclude" &&
      !excludeUrls.some((url) => tab.url.includes(url.trim())) &&
      hasExpired
    ) {
      return true; // Close if expired and not in the excluded list
    }

    return false; // Default case, do not close the tab
  });
};

/**
 * Close an array of tabs.
 *
 * @param {Array} tabsToClose - The tabs to close.
 */
const closeTabs = (tabsToClose) => {
  tabsToClose.forEach((tab) => {
    console.log("Closing tab:", tab.url);
    chrome.tabs.remove(tab.id);
  });
};

/**
 * Parse the gap time string into minutes.
 *
 * @param {string} gapTime - The gap time string (e.g., '1 min', '5 min').
 * @returns {number} The gap time in minutes.
 */
const parseGapTimeToMinutes = (gapTime) => {
  const timeMultiplier = {
    m: 1,
    h: 60,
    d: 24 * 60,
  };
  const unit = gapTime.slice(-1);
  const amount = parseInt(gapTime.slice(0, -1), 10);
  const minutes = amount * timeMultiplier[unit];
  return minutes;
};

/**
 * Parse the gap time string into milliseconds.
 *
 * @param {string} gapTime - The gap time string (e.g., '1 min', '5 min').
 * @returns {number} The gap time in milliseconds.
 */
const parseGapTimeToMilliseconds = (gapTime) => {
  const timeMultiplier = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const unit = gapTime.slice(-1);
  const amount = parseInt(gapTime.slice(0, -1), 10);
  const milliseconds = amount * timeMultiplier[unit];
  return milliseconds;
};

/**
 * Add time to the current date.
 *
 * @param {string} gapTime - The time gap to add.
 * @returns {Date} A new Date object with the added time.
 */
const addTimeToCurrentDate = (gapTime) => {
  return new Date(
    Date.now() + parseGapTimeToMilliseconds(gapTime)
  ).toISOString();
};

/**
 * Listen for updated event(reload or reuse old tab) to update the cashed
 * session and tab data
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.active &&
    tab.url !== "about:blank"
  ) {
    console.log("Tab updated: ", tab);

    // Get both sessions (tabManagerSession and owl_watch_session)
    chrome.storage.local.get(
      ["tabManagerSession", "owl_watch_session"],
      (result) => {
        const tabManagerSession = result.tabManagerSession || { tabs: [] };
        const owlWatchSession = result.owl_watch_session || { tabs: [] };
        const currentTime = new Date().toISOString();

        // Update tabManagerSession
        const tabIndex = tabManagerSession.tabs.findIndex(
          (t) => t.id === tabId
        );
        if (tabIndex !== -1) {
          tabManagerSession.tabs[tabIndex].lastAccessed = currentTime;
        } else {
          tabManagerSession.tabs.push({
            id: tabId,
            url: tab.url,
            lastAccessed: currentTime,
          });
        }

        // Update owl_watch_session
        const owlTabIndex = owlWatchSession.tabs.findIndex(
          (t) => t.id === tabId
        );
        if (owlTabIndex !== -1) {
          owlWatchSession.tabs[owlTabIndex].lastAccessed = currentTime;
        } else {
          owlWatchSession.tabs.push({
            id: tabId,
            url: tab.url,
            lastAccessed: currentTime,
          });
        }

        chrome.storage.local.set({
          tabManagerSession: tabManagerSession,
          owl_watch_session: owlWatchSession,
        });
      }
    );
  }
});

/**
 * Listen for message event for Tab Manager
 */
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

        sendResponse(enrichedTabs);
      });
    });
    return true;
  } else if (request.message === "closeTab") {
    // Close a specific tab by tabId
    const { tabId } = request;
    chrome.tabs.remove(tabId, () => {
      console.log(`Tab ${tabId} closed`);
      sendResponse({ status: "Tab closed" });
    });
    return true;
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
    return true;
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
    return true;
  }
});

/**
 * BACKGROUND DEBUGERS
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Service worker started.");

  // Test if chrome.alarms API is available
  chrome.alarms.create("testAlarm", { delayInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "testAlarm") {
      console.log("Test alarm triggered");
    }
  });
});

// Retrieve session
chrome.storage.local.get(["owl_watch_session"], (result) => {
  console.log("Retrieved session from storage:", result);
});

// Extension Installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Owl Watch extension installed.");
});
