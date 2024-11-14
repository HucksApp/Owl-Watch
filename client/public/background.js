/**
 * @fileoverview Background script for the Owl Watch Chrome extension.
 * This script manages tab watching functionality, including starting and stopping
 * the watch process, checking tab activity, and closing inactive tabs based on user settings.
 */

let watchInterval = null; //Global  Value for  Watch Interval
let autoGroupingEnabled = false; // Global  Value for Auto Grouping

/**
 * Listen for messages for session start and stop watcher tracking.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startWatch") {
    const { gapTime, watchMode, urls, excludeUrls } = request.settings;
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
  } else if (request.type === "Toggle_Auto_Grouping") {
    autoGroupingEnabled = request.enabled; // Toggle autoGroupingEnabled based on message

    if (autoGroupingEnabled) {
      // Add the tab update listener when enabled
      chrome.tabs.onUpdated.addListener(handleTabGrouping);
    } else {
      // Remove the tab update listener when disabled
      chrome.tabs.onUpdated.removeListener(handleTabGrouping);
    }
    sendResponse({ status: "success", autoGroupingEnabled });
  } else if (request.action === "moveGroupToNewWindow") {
    moveGroupToNewWindow(request.groupId);
    sendResponse({ status: "done" });
  } else if (request.action === "openNewTabInGroup") {
    openNewTabInGroup(request.groupId);
    sendResponse({ status: "done" });
  } else if (request.action === "refreshGroupCache") {
    CreateOrUpdateGroupCache();
    sendResponse({ status: "cache_refreshed" });
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
    chrome.storage.local.get("owl_watch_session", (result) => {
      const cachedOwlSession = result.owl_watch_session || { tabs: [] };
      const currentTabs = tabs.map((tab) => {
        const owlCachedTab = cachedOwlSession.tabs.find(
          (cachedTab) => cachedTab.url === tab.url
        );

        const lastAccessed = owlCachedTab
          ? owlCachedTab.lastAccessed
          : new Date().toISOString();
        return {
          id: tab.id,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
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

      // Update owl_watch_session with the current unique tabs and their last accessed times
      const newOwlSession = {
        tabs: uniqueTabs,
        watchStarted: new Date().toISOString(),
        nextWatch: addTimeToCurrentDate(gapTime),
      };

      chrome.storage.local.set({
        owl_watch_session: newOwlSession,
      });
    });
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
    if (isRestrictedUrl(tab.url)) {
      return; // Exit if the URL is restricted
    }
    if (tab && tab.url) {
      chrome.storage.local.get("owl_watch_session", (result) => {
        const owlWatchSession = result.owl_watch_session || { tabs: [] };

        if (!Array.isArray(owlWatchSession.tabs)) {
          owlWatchSession.tabs = [];
        }

        const currentTime = new Date().toISOString();

        // Update owl_watch_session
        const owlTab = owlWatchSession.tabs.find((t) => t.id === tab.id);
        if (owlTab) {
          owlTab.lastAccessed = currentTime;
        } else {
          owlWatchSession.tabs.push({
            id: tab.id,
            url: tab.url,
            favIconUrl: tab.favIconUrl,
            lastAccessed: currentTime,
          });
        }

        chrome.storage.local.set({
          owl_watch_session: owlWatchSession,
        });
      });
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
      return false;
    }

    if (tab.active) {
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
  return parseGapTimeToMinutes(gapTime) * 60 * 1000;
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
 * Listen for updated event (reload or reuse old tab) to update the cached
 * session and tab data in owl_watch_session.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isRestrictedUrl(tab.url)) {
    console.warn("Access denied to restricted URL: 33333", tab.url);
    return; // Exit if the URL is restricted
  }
  if (
    changeInfo.status === "complete" &&
    tab.active &&
    tab.url !== "about:blank"
  ) {
    // Get the owl_watch_session
    chrome.storage.local.get("owl_watch_session", (result) => {
      const owlWatchSession = result.owl_watch_session || { tabs: [] };
      const currentTime = new Date().toISOString();

      // Update owl_watch_session
      const owlTabIndex = owlWatchSession.tabs.findIndex((t) => t.id === tabId);
      if (owlTabIndex !== -1) {
        // If the tab is found, update its lastAccessed
        owlWatchSession.tabs[owlTabIndex].lastAccessed = currentTime;
      } else {
        // If the tab is not found, add it to the session
        owlWatchSession.tabs.push({
          id: tabId,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          lastAccessed: currentTime,
        });
      }

      // Save the updated owl_watch_session
      chrome.storage.local.set({ owl_watch_session: owlWatchSession });
    });
  }
});

// Initialize lazy loading settings
const initializeLazyLoadSettings = () => {
  chrome.storage.local.get("owl_lazyload", (result) => {
    if (typeof result.owl_lazyload === "undefined") {
      chrome.storage.local.set({
        owl_lazyload: { enabled: false, matchUrls: [], excludeUrls: [] },
      });
    }
  });
};

// Function to inject lazy load script
const injectLazyLoadingScripts = (tabId) => {
  chrome.scripting.executeScript({
    target: { tabId },
    function: applyLazyLoading, // Function that implements lazy loading
  });
};

const isRestrictedUrl = (url) => {
  return url.startsWith("chrome://") || url.startsWith("about:");
};

// This function will be injected into the page to lazy load elements
const applyLazyLoading = () => {
  const images = document.querySelectorAll("img");
  const iframes = document.querySelectorAll("iframe");

  if ("loading" in HTMLImageElement.prototype) {
    images.forEach((img) => (img.loading = "lazy"));
    iframes.forEach((iframe) => (iframe.loading = "lazy"));
    return; // Exit if native lazy loading is supported
  }

  // Add lazy loading attribute and IntersectionObserver logic
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyElement = entry.target;
          if (lazyElement) {
            if (lazyElement.dataset.src) {
              lazyElement.src = lazyElement.dataset.src;
              lazyElement.onerror = () => {
                console.error(`Error loading ${lazyElement.dataset.src}`);
                // Optional: add a fallback image or error handling
              };
              observer.unobserve(lazyElement);
            }
          }
        }
      });
    },
    {
      root: null, // Use the viewport as the container
      rootMargin: "0px",
      threshold: 0.1, // Trigger when 10% of the element is visible
    }
  );

  images.forEach((img) => {
    if (!img.dataset.src) {
      img.dataset.src = img.src;
      img.src = ""; // Remove the source to defer loading
      img.loading = "lazy";
      observer.observe(img);
    }
  });

  iframes.forEach((iframe) => {
    if (!iframe.dataset.src) {
      iframe.dataset.src = iframe.src;
      iframe.src = ""; // Remove the source to defer loading
      iframe.loading = "lazy";
      observer.observe(iframe);
    }
  });
};

// Helper function to check if lazy loading should be applied to the tab
const shouldLazyLoadTab = (tabUrl, lazyMode, matchUrls, excludeUrls) => {
  if (lazyMode === "all") return true;
  if (lazyMode === "urls") return matchUrls.includes(tabUrl);
  if (lazyMode === "exclude") return !excludeUrls.includes(tabUrl);
  return false;
};

// Inject lazy loading script when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isRestrictedUrl(tab.url)) {
    console.warn("Access denied to restricted URL: ", tab.url);
    return; // Exit if the URL is restricted
  }

  chrome.storage.local.get("owl_lazyload", (result) => {
    const lazyLoadSettings = result.owl_lazyload || {
      enabled: false,
      settings: {},
    };
    const { enabled, settings } = lazyLoadSettings;
    const { lazyMode, matchUrls = [], excludeUrls = [] } = settings || {};

    if (enabled && changeInfo.status === "complete") {
      if (shouldLazyLoadTab(tab.url, lazyMode, matchUrls, excludeUrls)) {
        injectLazyLoadingScripts(tabId);
      }
    }
  });
});

// Inject lazy loading script for newly opened tabs
chrome.tabs.onCreated.addListener((tab) => {
  // Check if the URL is restricted
  if (isRestrictedUrl(tab.url)) {
    console.warn("Access denied to restricted URL: 00000", tab.url);
    return; // Exit if the URL is restricted
  }

  chrome.storage.local.get("owl_lazyload", (result) => {
    const lazyLoadSettings = result.owl_lazyload || {
      enabled: false,
      settings: {},
    };
    const { enabled, settings } = lazyLoadSettings;
    const { lazyMode, matchUrls = [], excludeUrls = [] } = settings || {};

    if (enabled) {
      if (shouldLazyLoadTab(tab.url, lazyMode, matchUrls, excludeUrls)) {
        injectLazyLoadingScripts(tab.id);
      }
    }
  });
});

// Initialize lazy load settings on extension installation
chrome.runtime.onInstalled.addListener(initializeLazyLoadSettings);

// Function to handle tab grouping or ungrouping when a tab is updated
const handleTabGrouping = (tabId, changeInfo, tab) => {
  if (autoGroupingEnabled && changeInfo.status === "complete" && tab.url) {
    chrome.storage.local.get("owl_watch_session", (result) => {
      let session = result.owl_watch_session || { groups: [] };

      if (!Array.isArray(session.groups)) {
        console.error("No groups found in the session:", session);
        return;
      }

      // Retrieve existing Chrome tab groups to sync with the owl_watch_session
      chrome.tabGroups.query({}, (chromeGroups) => {
        const chromeGroupIds = chromeGroups.map((group) => group.id);

        // Filter out groups from owl_watch_session that no longer exist in Chrome
        session.groups = session.groups.filter((sessionGroup) => {
          return chromeGroupIds.includes(sessionGroup.id);
        });

        // Update chrome.storage.local with the cleaned session if any groups were removed
        chrome.storage.local.set({ owl_watch_session: session });

        let matchedGroup = null;
        let matchingPattern = null;

        // Loop through the filtered session groups to find a matching pattern for the tab URL
        for (let sessionGroup of session.groups) {
          if (sessionGroup.patterns && sessionGroup.patterns.length > 0) {
            matchingPattern = sessionGroup.patterns.find((pattern) =>
              tab.url.includes(pattern)
            );
            if (matchingPattern) {
              matchedGroup = sessionGroup;
              break;
            }
          }
        }

        if (matchedGroup) {
          const existingGroup = chromeGroups.find(
            (group) => group.id === matchedGroup.id
          );

          if (existingGroup) {
            chrome.tabs.group(
              { groupId: existingGroup.id, tabIds: [tabId] },
              () => {
                updateSessionGroup(tabId, matchedGroup.id);
              }
            );
          } else {
            chrome.tabs.group({ tabIds: [tabId] }, (newGroupId) => {
              matchedGroup.id = newGroupId;
              updateSessionGroup(tabId, newGroupId);
            });
          }
        } else {
          chrome.tabs.get(tabId, (tab) => {
            // Check if tab is in a group already(check for opening new tab to group)
            if (tab.groupId !== -1) {
              return;
            }
            // If no group matches, ungroup the tab and remove it from session groups
            chrome.tabs.ungroup(tabId, () => {
              removeTabFromSessionGroup(tabId);
            });
          });
        }
      });
    });
  }
};

// Update session with group data for a specific tab
const updateSessionGroup = (tabId, groupId) => {
  chrome.storage.local.get("owl_watch_session", (result) => {
    let session = result.owl_watch_session || { groups: [] };
    let group = session.groups.find((g) => g.id === groupId);

    if (group) {
      // Ensure tabId is added to the group if not already present
      if (!group.tabIds) group.tabIds = [];
      if (!group.tabIds.includes(tabId)) group.tabIds.push(tabId);

      // Update the session with the new group data
      chrome.storage.local.set({ owl_watch_session: session }, () => {});
    }
  });
};

// Remove a tab from its session group when ungrouped
const removeTabFromSessionGroup = (tabId) => {
  chrome.storage.local.get("owl_watch_session", (result) => {
    let session = result.owl_watch_session || { groups: [] };

    // Remove the tab from all groups it might be associated with
    session.groups.forEach((group) => {
      if (group.tabIds) {
        group.tabIds = group.tabIds.filter((id) => id !== tabId);
      }
    });

    // Update the session with the tab removed
    chrome.storage.local.set({ owl_watch_session: session });
  });
};

const CreateOrUpdateGroupCache = () => {
  // Query all existing tab groups
  chrome.tabGroups.query({}, (chromeGroups) => {
    // Retrieve the session object from storage (or create a default one)
    chrome.storage.local.get("owl_watch_session", (result) => {
      let session = result.owl_watch_session || { groups: [] };

      if (!Array.isArray(session.groups)) {
        session.groups = [];
      }

      // Map Chrome groups while preserving existing groups and patterns in session
      chromeGroups.forEach((chromeGroup) => {
        // Find if the Chrome group already exists in the session
        let existingGroup = session.groups.find((g) => g.id === chromeGroup.id);

        if (!existingGroup) {
          // If the group doesn't exist, add it with a new empty pattern array
          session.groups.push({
            id: chromeGroup.id,
            name: chromeGroup.title || "Unnamed Group",
            collapsed: chromeGroup.collapsed,
            color: chromeGroup.color,
            patterns: [], // Initialize new groups with an empty patterns array
          });
        }
      });

      // Save the updated session object back into chrome.storage.local
      chrome.storage.local.set({ owl_watch_session: session }, () => {
        if (session.autoGrouping) {
          autoGroupingEnabled = true;
          chrome.tabs.onUpdated.addListener(handleTabGrouping);
        }
      });
    });
  });
};

// Event listener to initialize session on extension install
chrome.runtime.onInstalled.addListener(() => {
  CreateOrUpdateGroupCache();
});

chrome.tabGroups.onRemoved.addListener((groupId) => {
  chrome.storage.local.get(["owl_watch_session"], (result) => {
    let session = result.owl_watch_session || { groups: [] };
    // Remove the group from the session state
    session.groups = session.groups.filter((group) => group.id !== groupId);
    chrome.storage.local.set({ owl_watch_session: session });
  });
});

chrome.tabGroups.onUpdated.addListener((group) => {
  chrome.storage.local.get(["owl_watch_session"], (result) => {
    let session = result.owl_watch_session || { groups: [] };
    const groupIndex = session.groups.findIndex((g) => g.id === group.id);

    if (groupIndex !== -1) {
      // Update the group properties in the session
      session.groups[groupIndex].name = group.title;
      session.groups[groupIndex].color = group.color;
      session.groups[groupIndex].collapsed = group.collapsed;

      chrome.storage.local.set({ owl_watch_session: session });
    }
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) return; // Ignore tabs closed due to window closing

  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return; // If tab doesn't exist, return early

    const groupId = tab.groupId;
    if (groupId !== -1) {
      // Update the session to remove the tab if it's part of a group
      chrome.storage.local.get(["owl_watch_session"], (result) => {
        let session = result.owl_watch_session || { groups: [] };
        const groupIndex = session.groups.findIndex(
          (group) => group.id === groupId
        );

        if (groupIndex !== -1) {
          // Remove the tab ID from the group if tracking individual tabs (optional)
          session.groups[groupIndex].tabs = session.groups[
            groupIndex
          ].tabs.filter((id) => id !== tabId);
          chrome.storage.local.set({ owl_watch_session: session });
        }
      });
    }
  });
});

chrome.tabGroups.onCreated.addListener((group) => {
  chrome.storage.local.get(["owl_watch_session"], (result) => {
    let session = result.owl_watch_session || { groups: [] };
    // Add the new group to the session if not already tracked
    session.groups.push({
      id: group.id,
      name: group.title || "Untitled",
      color: group.color,
      collapsed: group.collapsed,
      tabs: [], // Optional: Track tab IDs within this group
    });

    chrome.storage.local.set({ owl_watch_session: session });
  });
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.groupId !== -1) {
      // Handle tab being added to a group
      chrome.storage.local.get(["owl_watch_session"], (result) => {
        let session = result.owl_watch_session || { groups: [] };
        const group = session.groups.find((group) => group.id === tab.groupId);

        if (group) {
          group.tabs.push(tabId);
          chrome.storage.local.set({ owl_watch_session: session });
        }
      });
    }
  });
});

chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.groupId === -1) {
      // Handle tab being removed from a group
      chrome.storage.local.get(["owl_watch_session"], (result) => {
        let session = result.owl_watch_session || { groups: [] };
        session.groups = session.groups.map((group) => ({
          ...group,
          tabs: group.tabs.filter((id) => id !== tabId),
        }));
        chrome.storage.local.set({ owl_watch_session: session });
      });
    }
  });
});

// Retrieve session
chrome.storage.local.get(["owl_watch_session"], (result) => {
  console.log("Retrieved session from storage:", result);
});

// Function to move a group to a new window
const moveGroupToNewWindow = (groupId) => {
  try {
    // Retrieve all tabs in the specified group
    chrome.tabs.query({ groupId }, (tabsInGroup) => {
      if (tabsInGroup.length === 0) {
        return;
      }

      // Retrieve group information from chrome.tabGroups
      chrome.tabGroups.get(groupId, (groupInfo) => {
        const tabIds = tabsInGroup.map((tab) => tab.id);

        // Retrieve the owl_watch_session before making any changes
        chrome.storage.local.get("owl_watch_session", (result) => {
          let session = result.owl_watch_session || { groups: [] };

          // Find the group in the session to copy
          const sessionGroupIndex = session.groups.findIndex(
            (group) => group.id === groupId
          );
          const sessionGroup =
            sessionGroupIndex !== -1 ? session.groups[sessionGroupIndex] : null;

          if (sessionGroup) {
            // Copy the group data to preserve its patterns and settings
            const copiedGroup = { ...sessionGroup };

            // Create a new window with the first tab in the group
            chrome.windows.create(
              { tabId: tabIds[0], focused: true },
              (newWindow) => {
                // Move the remaining tabs to the new window
                const moveTabs = tabIds.slice(1).map((tabId) => {
                  return chrome.tabs.move(tabId, {
                    windowId: newWindow.id,
                    index: -1,
                  });
                });

                Promise.all(moveTabs) // Ensure all tabs are moved before continuing
                  .then(() => {
                    // Create a new group in the new window and group all the moved tabs
                    chrome.tabs.group({ tabIds: tabIds }, (newGroupId) => {
                      // Update the new group to match the original group’s title and color
                      chrome.tabGroups.update(newGroupId, {
                        title: groupInfo.title,
                        color: groupInfo.color,
                      });

                      // Remove the old group from the session
                      session.groups = session.groups.filter(
                        (group) => group.id !== groupId
                      );

                      // Add the copied group with the new groupId
                      copiedGroup.id = newGroupId; // Assign the new groupId
                      session.groups.push(copiedGroup);

                      // Save the updated session back to storage
                      chrome.storage.local.set(
                        { owl_watch_session: session },
                        () => {
                          console.log(
                            `Group moved successfully, updated session with new group info.`
                          );
                        }
                      );
                    });
                  })
                  .catch((error) => {
                    console.error("Error while moving tabs:", error);
                  });
              }
            );
          }
        });
      });
    });
  } catch (error) {
    console.error("Error moving group to new window:", error);
  }
};

//open new tab in group
const openNewTabInGroup = (groupId) => {
  chrome.tabs.create({ active: true }, (newTab) => {
    chrome.tabs.group({ tabIds: [newTab.id], groupId });
  });
};
