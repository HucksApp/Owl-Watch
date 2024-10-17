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
  const [sessions, setSessions] = useState([]);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchTabs = () => {
    chrome.tabs.query({}, (tabsArray) => {
      chrome.storage.local.get(["owl_watch_session"], (result) => {
        const cachedSession = result.owl_watch_session || { tabs: [] };
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
      active: tab.active,
      lastAccessed: new Date(),
    }));
    try {
      await axios.post(`${BASE_URL}/api/session/save`, {
        name: sessionName,
        tabs: formattedTabs,
      });
      setSessions([...sessions, { name: sessionName }]);
    } catch (error) {
      console.error("Error saving session:", error);
    }
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
        active: tab.active,
        lastAccessed: new Date(),
      }));
      try {
        await axios.post(`${BASE_URL}/api/session/save`, {
          name: sessionName,
          tabs: formattedTabs,
        });
        setSessions([...sessions, { name: sessionName }]);
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
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

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
        closeTab,
        closeNonActiveTabs,
        closeAllTabs,
        closeTabByMatch,
        saveSession,
        restoreSession,
        deleteSession,
        highlightedTabs,
        toggleTabHighlight,
        reorderTabs,
        moveHighlightedTabsToNewWindow,
        saveHighlightedTabsAsSession,
      }}
    >
      {children}
    </CommandStructureContext.Provider>
  );
};

export const useCommandStructure = () => {
  return useContext(CommandStructureContext);
};
