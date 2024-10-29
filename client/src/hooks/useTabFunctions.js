import axios from "../services/api";
/* global chrome */

const useTabFunctions = ({
  tabs,
  setTabs,
  highlightedTabs,
  setHighlightedTabs,
  setSessions,
  saveSessionOrderToStorage,
  BASE_URL,
}) => {
  const fetchTabs = () => {
    chrome.tabs.query({}, (tabsArray) => {
      chrome.storage.local.get(["owl_watch_session"], (result) => {
        const cachedSession = result.owl_watch_session || { tabs: [] };
        if (!Array.isArray(cachedSession.tabs)) {
          cachedSession.tabs = [];
        }
        const enrichedTabs = tabsArray.map((tab) => {
          const cachedTab = cachedSession.tabs.find((t) => t.id === tab.id);
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

  // function to remove highlighted tabs
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

  // Make a tab dormant (discard)
  const makeTabDormant = (tabId) => {
    chrome.tabs.discard(tabId, () => {
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
    await chrome.tabs.update(tabId, { pinned: pin });
    fetchTabs(); // To update the tab list with the new pin status
  };

  const switchToTab = (tabId) => {
    chrome.tabs.update(tabId, { active: true });
  };



  return {
    fetchTabs,
    reorderTabs,
    saveHighlightedTabsAsSession,
    moveHighlightedTabsToNewWindow,
    removeHighlightedTabs,
    toggleTabHighlight,
    closeTabByMatch,
    closeNonActiveTabs,
    closeAllTabs,
    closeTab,
    makeTabDormant,
    muteUnmuteTab,
    pinUnpinTab,
    switchToTab,
  };
};


export default useTabFunctions