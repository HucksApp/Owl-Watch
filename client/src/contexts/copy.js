import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../services/api";

/* global chrome */

/**
 * CommandStructureProvider Component
 *
 * A context provider for managing browser tab and session operations within a Chrome extension.
 * This component provides functionalities to fetch, close, and manage tabs and sessions
 * using the Chrome extension APIs and a backend service for session storage.
 *
 * @component
 * @example
 * // Usage example:
 * import { CommandStructureProvider } from './contexts/CommandStructureContext';
 *
 * const App = () => (
 *   <CommandStructureProvider>
 *     <YourComponent />
 *   </CommandStructureProvider>
 * );
 *
 * @returns {JSX.Element} A context provider for managing tabs and sessions.
 *
 * @description
 * The CommandStructureProvider component utilizes React's Context API to provide functions
 * related to tab and session management to its children components. It allows users to
 * close tabs, save and restore sessions, and fetch current tab information using the Chrome
 * extension APIs.
 *
 * ## Key Features:
 * - Fetches current tabs and cached sessions from Chrome's local storage.
 * - Closes tabs by title or URL, closes all non-active tabs, or closes all tabs.
 * - Saves user-defined tab sessions to a backend API for persistence.
 * - Restores tab sessions from saved data.
 * - Deletes saved sessions and fetches existing sessions from the backend.
 *
 * ### State:
 * - `tabs`: An array of tab objects containing properties like title, URL, and last accessed time.
 * - `sessions`: An array of saved session objects with names and associated tab data.
 *
 * ### Methods:
 * - `fetchTabs()`: Fetches the current tabs from the browser and enriches them with session data.
 * - `closeTab(tabId)`: Closes a specific tab identified by its ID.
 * - `closeNonActiveTabs()`: Closes all tabs that are not currently active.
 * - `closeAllTabs()`: Closes all open tabs.
 * - `saveSession(sessionName)`: Saves the current tabs into a session on the backend.
 * - `restoreSession(session)`: Restores tabs from a previously saved session.
 * - `deleteSession(sessionId)`: Deletes a saved session from the backend.
 * - `fetchSessions()`: Retrieves all saved sessions from the backend.
 */

const CommandStructureContext = createContext();

export const CommandStructureProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const [highlightedTabs, setHighlightedTabs] = useState([]);
  const [tabMetrics, setTabMetrics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchTabs = () => {
    chrome.tabs.query({}, (tabsArray) => {
      chrome.storage.local.get(["owl_watch_session"], (result) => {
        const cachedSession = result.owl_watch_session || { tabs: [] };
        if (!Array.isArray(cachedSession.tabs)) {
          cachedSession.tabs = [];
        }
        const enrichedTabs = tabsArray.map((tab) => {
          const cachedTab = cachedSession.tabs.find((t) => t.id === tab.id);
          console.log(tab);
          return {
            ...tab,
            lastAccessed:
              cachedTab && cachedTab.lastAccessed
                ? cachedTab.lastAccessed
                : tab.lastAccessed
                ? tab.lastAccessed
                : "Recent",
            isActive: tab.active,
          };
        });
        setTabs(enrichedTabs);
        console.log("before metrics")
        fetchTabMetrics(enrichedTabs);
      });
    });
  };

  // Function to rearrange tabs within the same window based on dragging
  const reorderTabs = (startIndex, endIndex) => {
    const reorderedTabs = Array.from(tabs);
    const [movedTab] = reorderedTabs.splice(startIndex, 1);
    reorderedTabs.splice(endIndex, 0, movedTab);
    setTabs(reorderedTabs);

    // Update the tab order in Chrome
    chrome.tabs.move(movedTab.id, { index: endIndex });
  };

  // Function to move highlighted tabs to a new window
  const moveHighlightedTabsToNewWindow = () => {
    if (highlightedTabs.length) {
      chrome.windows.create({ tabId: highlightedTabs[0].id }, (newWindow) => {
        highlightedTabs.slice(1).forEach((tab) => {
          chrome.tabs.move(tab.id, { windowId: newWindow.id, index: -1 });
        });
      });
    }
  };

  
// Function to save highlighted tabs as a session
const saveHighlightedTabsAsSession = async (sessionName) => {
  const formattedTabs = highlightedTabs.map((tab) => ({
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
    active: tab.active,
    lastAccessed: new Date(),
  }));

  try {
    // Make the API call to save the session
    const response = await axios.post(`${BASE_URL}/api/session/save`, {
      name: sessionName,
      tabs: formattedTabs,
    });

    // Update the sessions state with the newly saved session
    setSessions((prevSessions) => {
      const newSession = {
        _id: response.data._id, // Assuming your API returns the saved session's ID
        name: sessionName,
        tabs: formattedTabs,
        createdAt: response.data.createdAt, // Assuming your API returns the creation date
        updatedAt: response.data.updatedAt, // Assuming your API returns the update date
      };

      const updatedSessions = [...prevSessions, newSession];

      // Update session order in local storage after adding the new session
      const newSessionOrder = updatedSessions.map((session) => session._id);
      saveSessionOrderToStorage(newSessionOrder); // Update local storage

      return updatedSessions; // Update state
    });
  } catch (error) {
    console.error("Error saving highlighted session:", error);
  }
};



  // New function to remove highlighted tabs
  const removeHighlightedTabs = async () => {
    await Promise.all(highlightedTabs.map((tab) => closeTab(tab.id)));
    setHighlightedTabs([]); // Clear highlighted tabs after closing
    fetchTabs(); // Refresh the tabs list
  };

  // Function to handle highlighting tabs
  const toggleTabHighlight = (tabId) => {
    setHighlightedTabs((prev) => {
      if (prev.some((tab) => tab.id === tabId)) {
        return prev.filter((tab) => tab.id !== tabId);
      }
      return [...prev, tabs.find((tab) => tab.id === tabId)];
    });
  };

  // Function to close tab by matching title or URL
  const closeTabByMatch = (match) => {
    const tabToClose = tabs.find(
      (tab) =>
        tab.title.toLowerCase().includes(match.toLowerCase()) ||
        tab.url.toLowerCase().includes(match.toLowerCase())
    );
    if (tabToClose) {
      closeTab(tabToClose.id);
    }
  };

  // Close a particular tab by ID
  const closeTab = async (tabId) => {
    await new Promise((resolve) => {
      chrome.tabs.remove(tabId, () => {
        console.log(`Tab ${tabId} closed`);
        fetchTabs();
        resolve();
      });
    });
  };

  // Close all non-active tabs
  const closeNonActiveTabs = async () => {
    const nonActiveTabs = tabs.filter((tab) => !tab.isActive);
    await Promise.all(nonActiveTabs.map((tab) => closeTab(tab.id)));
    fetchTabs();
  };

  // Close all tabs
  const closeAllTabs = async () => {
    await Promise.all(tabs.map((tab) => closeTab(tab.id)));
    fetchTabs();
  };

  // Save session with tabs
  const saveSession = async (sessionName) => {
    chrome.tabs.query({}, async (tabs) => {
      const formattedTabs = tabs.map((tab) => ({
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl,
        active: tab.active,
        lastAccessed: new Date(),
      }));
  
      try {
        // Make the API call to save the session
        const response = await axios.post(`${BASE_URL}/api/session/save`, {
          name: sessionName,
          tabs: formattedTabs,
        });
  
        // Update the sessions state with the newly saved session
        setSessions((prevSessions) => {
          const newSession = {
            _id: response.data._id, // Assuming your API returns the saved session's ID
            name: sessionName,
            tabs: formattedTabs,
            createdAt: response.data.createdAt, // Assuming your API returns the creation date
            updatedAt: response.data.updatedAt, // Assuming your API returns the update date
          };
  
          const updatedSessions = [...prevSessions, newSession];
  
          // Update session order in local storage after adding the new session
          const newSessionOrder = updatedSessions.map((session) => session._id);
          saveSessionOrderToStorage(newSessionOrder); // Update local storage
  
          return updatedSessions; // Update state
        });
      } catch (error) {
        console.error("Error saving session:", error);
      }
    });
  };
  
  // Restore session
  const restoreSession = async (session) => {
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      session.tabs.forEach((tab) => {
        chrome.tabs.create({
          url: tab.url,
          windowId: currentWindow.id,
        });
      });
    });
  };

  // Delete session
  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`${BASE_URL}/api/session/${sessionId}`);
      setSessions(sessions.filter((session) => session._id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Fetch saved sessions
  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/session`);
      let fetchedSessions = response.data;

      // Load session order from storage and reorder fetched sessions
      const storedSessionOrder = await loadSessionOrderFromStorage();
      if (storedSessionOrder.length) {
        fetchedSessions = reorderSessionsByStoredOrder(
          fetchedSessions,
          storedSessionOrder
        );
      }

      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // Helper function to save session order to chrome storage
  const saveSessionOrderToStorage = (sessionOrder) => {
    chrome.storage.local.set({ sessionOrder }, () => {
      console.log("Session order saved to local storage:", sessionOrder);
    });
  };

  // Helper function to load session order from chrome storage
  const loadSessionOrderFromStorage = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get("sessionOrder", (result) => {
        resolve(result.sessionOrder || []);
      });
    });
  };

  // Helper function to reorder sessions based on stored session order
  const reorderSessionsByStoredOrder = (fetchedSessions, storedOrder) => {
    return storedOrder
      .map((id) => fetchedSessions.find((session) => session._id === id))
      .filter((session) => session); // Filter out nulls in case some sessions have been deleted
  };

  // Function to reorder sessions within the UI and persist the new order
  const reorderSessions = (reorderedSessions) => {
    setSessions(reorderedSessions);

    // Save the new session order to chrome local storage
    const newSessionOrder = reorderedSessions.map((session) => session._id);
    saveSessionOrderToStorage(newSessionOrder);
  };

  // Move a tab from one session to another
  const moveTabBetweenSessions = async (tab, sourceSessionId, targetSessionId) => {
    if (sourceSessionId && targetSessionId && tab) {
      try {
        await axios.put(`${BASE_URL}/api/session/move-tab`, {
          sourceSessionId,
          targetSessionId,
          tab,
        });
  
        // Update local state
        setSessions((prevSessions) => {
          const sourceSession = prevSessions.find(s => s._id === sourceSessionId);
          const targetSession = prevSessions.find(s => s._id === targetSessionId);
  
          // Remove tab from source session based on tab id instead of url
          const updatedSourceTabs = sourceSession.tabs.filter(t => t.id !== tab.id);
  
          // Ensure the target session doesn't already have a tab with the same id
          const updatedTargetTabs = targetSession.tabs.some(t => t.id === tab.id)
            ? targetSession.tabs // If the tab already exists, don't add it again
            : [...targetSession.tabs, tab];
  
          return prevSessions.map(s => {
            if (s._id === sourceSessionId) return { ...s, tabs: updatedSourceTabs };
            if (s._id === targetSessionId) return { ...s, tabs: updatedTargetTabs };
            return s;
          });
        });
  
        fetchSessions(); // Refresh sessions to ensure UI consistency
      } catch (error) {
        console.error("Error moving tab between sessions:", error);
      }
    }
  };
  

  // Reorder tabs within a session
  const reorderSessionTabs = async (sessionId, reorderedTabs) => {
    try {
      await axios.put(`${BASE_URL}/api/session/reorder-tabs`, {
        sessionId,
        reorderedTabs,
      });

      // Update local state
      setSessions((prevSessions) => {
        return prevSessions.map((s) =>
          s._id === sessionId ? { ...s, tabs: reorderedTabs } : s
        );
      });

      fetchSessions();
    } catch (error) {
      console.error("Error reordering session tabs:", error);
    }
  };

  // Remove a tab from a session
  const removeTabFromSession = async (sessionId, tabId) => {
    try {
      // Update the session in the backend
      await axios.put(`${BASE_URL}/api/session/remove-tab`, {
        sessionId,
        tabId,
      });

      // Update the session state locally
      setSessions((prevSessions) => {
        return prevSessions.map((session) => {
          if (session._id === sessionId) {
            // Filter out the tab to remove
            const updatedTabs = session.tabs.filter((tab) => tab.id !== tabId);
            return { ...session, tabs: updatedTabs };
          }
          return session;
        });
      });

      fetchSessions(); // Refresh sessions after removing the tab
    } catch (error) {
      console.error("Error removing tab from session:", error);
    }
  };


  

   // Make a tab dormant (discard)
   const makeTabDormant = (tabId) => {
    chrome.tabs.discard(tabId, () => {
      console.log(`Tab ${tabId} discarded`);
      fetchTabs(); // Refresh the tabs list after discarding
    });
  };


    // Function to mute or unmute a tab
    const muteUnmuteTab = async (tabId, mute) => {
      await chrome.tabs.update(tabId, { muted: mute });
      fetchTabs(); // To update the tab list with the new mute status
    };
  
    // Function to pin or unpin a tab
    const pinUnpinTab = async (tabId, pin) => {
      console.log("in pin", tabId,    pin)
      await chrome.tabs.update(tabId, { pinned: pin });
      fetchTabs(); // To update the tab list with the new pin status
    };



  // Helper function to create a new tab group
const createTabGroup = (groupName, tabIds, groupColor, callback) => {
  chrome.tabs.group({ tabIds }, (groupId) => {
    // Set group properties (name and color)
    chrome.tabGroups.update(groupId, {
      title: groupName,
      color: groupColor
    }, () => {
      // Pass the groupId to the callback for further processing
      if (callback) callback(groupId);
    });
  });
};


  //   function createTabGroup(groupTitle, tabIds, groupColor = 'blue', collapsed = false) {
  //     chrome.tabGroups.create({
  //         title: groupTitle,
  //         tabIds: tabIds,
  //         color: groupColor,
  //         collapsed: collapsed
  //     }, function(tabGroup) {
  //         console.log('Tab group created:', tabGroup);
  //     });
  // }

  
// Function to ungroup all tabs in a specific group by group ID
const ungroupTabs = (groupId) => {
  chrome.tabGroups.get(groupId, (group) => {
    const tabIds = group.tabIds;
    if (tabIds.length > 0) {
      // Ungroup all tabs, which will remove the group
      chrome.tabs.ungroup(tabIds, () => {
        console.log(`Ungrouped all tabs in group ID: ${groupId}`);
      });
    }
  });
}


function getAllTabsInGroup(groupId) {
  chrome.tabGroups.get(groupId, function(group) {
      chrome.tabs.get(group.tabIds, function(tabs) {
          console.log('Tabs in group:', tabs);
      });
  });
}

function closeTabsInGroup(groupId) {
  chrome.tabGroups.get(groupId, (group) => {
    const tabIds = group.tabIds;
    if (tabIds.length > 0) {
      // Close all tabs in the group
      chrome.tabs.remove(tabIds, () => {
        console.log(`Closed all tabs in group ID: ${groupId}`);
      });
    }
  });
}


const  toggleTabGroupCollapse = (groupId, collapse = true) => {
  chrome.tabGroups.update(groupId, { collapsed: collapse }, function(updatedGroup) {
      console.log('Tab group collapse state updated:', updatedGroup);
  });
}

const groupTabsByUrlPattern = (urlpatterns, groupName, groupColor) => {
  // Split and clean the patterns
  const patterns = urlpatterns.split(/\s+/).map((url) => url.trim()).filter(Boolean);

  // Query all open tabs
  chrome.tabs.query({}, (tabs) => {
    
    // Retrieve the current session from local storage
    chrome.storage.local.get(["owl_watch_session"], (result) => {
      let session = result.owl_watch_session || { groups: [] };
      
      // Filter tabs that match any of the patterns and are not yet grouped (groupId = -1)
      const matchingTabs = tabs.filter(tab => tab.groupId === -1 && patterns.some(pattern => tab.url.includes(pattern)));
      const matchingTabIds = matchingTabs.map(tab => tab.id);

      if (matchingTabIds.length > 0) {
        // Create a new tab group if there are matching tabs
        createTabGroup(groupName, matchingTabIds, groupColor, (groupId) => {
          // Once the group is created, update the session with the new group details
          session.groups.push({
            id: groupId,
            name: groupName,
            patterns: patterns, // Save patterns as an array
            color: groupColor
          });

          // Save the updated session back to local storage
          chrome.storage.local.set({ owl_watch_session: session }, () => {
            console.log(`Session updated with new group: ${groupName}, patterns: ${patterns.join(', ')}`);
          });
        });
      }
    });
  });
};

const  toggleAutoGrouping = (enabled)  => {
  chrome.runtime.sendMessage({
    type: 'Toggle_Auto_Grouping',
    enabled: enabled
  }, (response) => {
    if (response.status === 'success') {
      console.log(`Auto grouping is now ${enabled ? 'enabled' : 'disabled'}`);
    } else {
      console.log('Failed to toggle auto grouping.');
    }
  });
}

const pinGroup = (groupId) => {
  // Get all tabs in the group
  chrome.tabs.query({ groupId: groupId }, (tabs) => {
    // Iterate over the tabs and pin each one
    tabs.forEach(tab => {
      chrome.tabs.update(tab.id, { pinned: true });
    });
  });
};

const unpinGroup = (groupId) => {
  // Get all tabs in the group
  chrome.tabs.query({ groupId: groupId }, (tabs) => {
    // Iterate over the tabs and unpin each one
    tabs.forEach(tab => {
      chrome.tabs.update(tab.id, { pinned: false });
    });
  });
};



const handleGroupBySelection = (selectedTabIds, groupName, groupColor) => {
  // Query all open tabs
  chrome.tabs.query({}, (tabs) => {
    // Retrieve the current session from local storage
    chrome.storage.local.get(["owl_watch_session"], (result) => {
      let session = result.owl_watch_session || { groups: [] };

      // Filter out the tabs that are selected (by checking if their IDs are in selectedTabIds)
      const matchingTabs = tabs.filter(tab => selectedTabIds.includes(tab.id) && tab.groupId === -1);

      // If there are any matching tabs, create a new group
      if (matchingTabs.length > 0) {
        const matchingTabIds = matchingTabs.map(tab => tab.id);

        // Create a new tab group with the selected tabs
        createTabGroup(groupName, matchingTabIds, groupColor, (groupId) => {
          // Once the group is created, update the session with the new group details
          session.groups.push({
            id: groupId,
            name: groupName,
            patterns: [], // No patterns since this is based on selection
            color: groupColor
          });

          // Save the updated session back to local storage
          chrome.storage.local.set({ owl_watch_session: session }, () => {
            console.log(`Session updated with new group: ${groupName}, from selected tabs.`);
          });
        });
      }
    });
  });
};




    // const toggleGroupCollapse = (groupName) => {
    //   chrome.storage.local.get("groupedTabs", (result) => {
    //     const groups = result.groupedTabs || [];
    //     const group = groups.find(group => group.name === groupName);
    //     if (group) {
    //       group.collapsed = !group.collapsed;
    //       chrome.storage.local.set({ groupedTabs: groups });
    //     }
    //   });
    // };


    // const groupTabs = (tabs, groupName, groupColor) => {
    //   chrome.storage.local.get("groupedTabs", (result) => {
    //     const groups = result.groupedTabs || [];
    //     groups.push({
    //       name: groupName,
    //       color: groupColor,
    //       dateGrouped: new Date().toISOString(),
    //       tabs: tabs,
    //     });
    //     chrome.storage.local.set({ groupedTabs: groups });
    //   });
    // };

    // const toggleAutoGrouping = (enabled) =>{
    //   chrome.runtime.sendMessage({ type: 'Toggle_Auto_Grouping', enabled: enabled }, (response) => {
    //     if (response.status === 'success') {
    //       console.log(`Auto grouping is now ${response.autoGroupingEnabled ? 'enabled' : 'disabled'}.`);
    //     }
    //   });
    // }
    

//     // Ungroup tabs function
// const ungroupTabs = (tabId)=> {
//   chrome.storage.local.get("groupedTabs", (result) => {
//     const groups = result.groupedTabs || [];
    
//     groups.forEach(group => {
//       const tabIndex = group.tabs.findIndex(existingTab => existingTab.id === tabId);
//       if (tabIndex !== -1) {
//         group.tabs.splice(tabIndex, 1); // Remove the tab from the group
//       }
//     });

//     // Update the storage with modified groups
//     chrome.storage.local.set({ groupedTabs: groups });
//   });
// }

// // Delete group function
// const  deleteGroup = (urlPattern) => {
//   chrome.storage.local.get("groupedTabs", (result) => {
//     const groups = result.groupedTabs || [];

//     // Remove the group based on the provided URL pattern
//     const updatedGroups = groups.filter(group => group.urlPattern !== urlPattern);

//     // Update the storage with the remaining groups
//     chrome.storage.local.set({ groupedTabs: updatedGroups });
//   });
// }



//   // Pin group function
// function pinGroup(urlPattern) {
//   chrome.storage.local.get("groupedTabs", (result) => {
//     const groups = result.groupedTabs || [];

//     // Find the group to pin
//     const groupToPin = groups.find(group => group.urlPattern === urlPattern);
//     if (groupToPin) {
//       groupToPin.pinned = true; // Set the pinned property
//       chrome.storage.local.set({ groupedTabs: groups });
//     }
//   });
// }




// // Unpin group function
// function unpinGroup(urlPattern) {
//   chrome.storage.local.get("groupedTabs", (result) => {
//     const groups = result.groupedTabs || [];

//     // Find the group to unpin
//     const groupToUnpin = groups.find(group => group.urlPattern === urlPattern);
//     if (groupToUnpin) {
//       groupToUnpin.pinned = false; // Remove the pinned property
//       chrome.storage.local.set({ groupedTabs: groups });
//     }
//   });
// }
  

 


  // Function to fetch tab metrics (CPU, memory, network)
  const fetchTabMetrics = async (tabs) => {
    
    const tabMetricsPromises = tabs.map(async (tab) => {
      const networkUsage = await getNetworkUsageForTab(tab.id);  // Fetch network usage for the tab
      console.log("in metrics")
  
      // You can fetch CPU and Memory usage as needed
      const cpuUsage = await getCpuUsageForTab(tab.id);  
      const memoryUsage = await getMemoryUsageForTab(tab.id);
      console.log(cpuUsage, networkUsage, memoryUsage,  "before metrics")  
      console.log("before return  metrics")
      return {
        ...tab,
        metrics: {
          cpu: cpuUsage || 0,
          memory: memoryUsage || 0,
          network: networkUsage,  // Include network usage metrics
        },
      };
    });
  
    const tabMetrics = await Promise.all(tabMetricsPromises);
    setTabMetrics(tabMetrics);
  };


    

  const getNetworkUsageForTab = (tabId) => {
   
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "getNetworkUsage", tabId },
        (response) => {
          console.log("in network response")
          if (response && response.usage) {
            console.log("in network response", response.usage)
            resolve(response.usage); // Network usage in KB/s
          } else {
            console.warn(`No network usage data found for tabId ${tabId}`);
            resolve('N/A');
          }
        }
      );
    });
  };
  
  const getCpuUsageForTab = async (tabId) => {
    return new Promise((resolve, reject) => {
      chrome.processes.getProcessInfo([], true, (processes) => {
        if (!processes) {
          console.error('Processes data unavailable');
          resolve('N/A');
          return;
        }
        
        const tabProcess = Object.values(processes).find((proc) =>
          proc.tabs && proc.tabs.includes(tabId)
        );
  
        if (tabProcess && tabProcess.cpu) {
          resolve(tabProcess.cpu);
        } else {
          console.warn(`No CPU data found for tabId ${tabId}`);
          resolve('N/A');
        }
      });
    });
  };


  const getMemoryUsageForTab = async (tabId) => {
    return new Promise((resolve, reject) => {
      chrome.processes.getProcessInfo([], true, (processes) => {
        if (!processes) {
          console.error('Processes data unavailable');
          resolve('N/A');
          return;
        }
        const tabProcess = Object.values(processes).find((proc) =>
          proc.tabs && proc.tabs.includes(tabId)
        );
  
        if (tabProcess && tabProcess.privateMemory) {
          resolve(tabProcess.privateMemory); // Memory used by the process (in bytes)
        } else {
          console.warn(`No memory data found for tabId ${tabId}`);
        resolve('N/A');
        }
      });
    });
  };







  const moveUngroupedTabToGroup = (tabId, targetGroupId) => {
    // Update the specified tab's group
    chrome.tabs.group({ tabIds: [tabId], groupId: targetGroupId }, () => {
      console.log(`Tab with ID ${tabId} moved to group ID: ${targetGroupId}`);
    });
  };

  const moveGroupedTabToAnotherGroup = (tabId, targetGroupId) => {
    // Query the tab to ensure it is currently grouped
    chrome.tabs.get(tabId, (tab) => {
      if (tab.groupId !== -1) {
        // Move the tab to the target group
        chrome.tabs.group({ tabIds: [tabId], groupId: targetGroupId }, () => {
          console.log(`Tab with ID ${tabId} moved from group ID ${tab.groupId} to group ID: ${targetGroupId}`);
        });
      } else {
        console.log(`Tab with ID ${tabId} is not grouped and cannot be moved.`);
      }
    });
  };

  const fetchTabsInCategories = async () => {
    // Example of fetching tabs (replace with your logic)
    const fetchedTabs = await chrome.tabs.query({});
    const fetchedGroups = await chrome.tabGroups.query({}); // Fetch tab groups if your API supports it

    // Process tabs and groups
    const ungrouped = [];
    const pinned = [];
    const grouped = [];

    // Loop through fetched tabs
    fetchedTabs.forEach(tab => {
      if (tab.pinned) {
        pinned.push(tab); // Collect pinned tabs
      } else if (tab.groupId === -1) {
        ungrouped.push(tab); // Collect ungrouped tabs
      } else {
        // Find the group by its ID
        const group = fetchedGroups.find(g => g.id === tab.groupId);
        if (group) {
          // Ensure the group exists in the grouped array
          let existingGroup = grouped.find(g => g.id === group.id);
          if (!existingGroup) {
            existingGroup = {
              id: group.id,
              name: group.title,
              color: group.color,
              tabs: []
            };
            grouped.push(existingGroup);
          }
          existingGroup.tabs.push(tab); // Add tab to its group
        }
      }
    });

    return { ungrouped, pinned, grouped };
  };
  
const switchToTab = (tabId)  => {
  chrome.tabs.update(tabId, { active: true });
}

  
  useEffect(() => {
    fetchTabs();
    fetchSessions();

    chrome.tabs.onUpdated.addListener(fetchTabs);
    chrome.tabs.onRemoved.addListener(fetchTabs);
    chrome.tabs.onCreated.addListener(fetchTabs);

    return () => {
      chrome.tabs.onUpdated.removeListener(fetchTabs);
      chrome.tabs.onRemoved.removeListener(fetchTabs);
      chrome.tabs.onCreated.removeListener(fetchTabs);
    };
  }, []);

  return (
    <CommandStructureContext.Provider
      value={{
        tabs,
        sessions,
        highlightedTabs,
        tabMetrics,
        closeTab,
        closeNonActiveTabs,
        closeAllTabs,
        closeTabByMatch,
        saveSession,
        setSessions,
        restoreSession,
        deleteSession,
        toggleTabHighlight,
        reorderTabs,
        moveHighlightedTabsToNewWindow,
        saveHighlightedTabsAsSession,
        removeHighlightedTabs,
        reorderSessions,
        moveTabBetweenSessions,
        reorderSessionTabs,
        removeTabFromSession,
        makeTabDormant,
        muteUnmuteTab,
        pinUnpinTab,
        toggleTabGroupCollapse,
        toggleAutoGrouping,
        ungroupTabs,
        getAllTabsInGroup,
        closeTabsInGroup,
        pinGroup,
        unpinGroup,
        groupTabsByUrlPattern,
        moveUngroupedTabToGroup,
        moveGroupedTabToAnotherGroup,
        fetchTabsInCategories,
        handleGroupBySelection,
        switchToTab
        
      }}
    >
      {children}
    </CommandStructureContext.Provider>
  );
};

export const useCommandStructure = () => {
  return useContext(CommandStructureContext);
};
