import React, { createContext, useContext, useEffect, useState } from "react";
import useTabFunctions from "../hooks/useTabFunctions.js";
import useSessionFunctions from "../hooks/useSessionFunctions.js";
import useGroupFunctions from "../hooks/useGroupFunctions.js";

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
  const BASE_URL =
    process.env.REACT_APP_STAGE === "production"
      ? process.env.REACT_APP_API_BASE_URL_PROD
      : process.env.REACT_APP_API_BASE_URL_DEV;

 


  const {
    fetchSessions,
    saveSession,
    restoreSession,
    deleteSession,
    reorderSessionTabs,
    reorderSessions,
    removeTabFromSession,
    moveTabBetweenSessions,
    saveSessionOrderToStorage
  } = useSessionFunctions({
    sessions,
    setSessions,
    BASE_URL
  });


  const {
    fetchTabs,
    reorderTabs,
    saveHighlightedTabsAsSession,
    moveHighlightedTabsToNewWindow,
    removeHighlightedTabs,
    toggleTabHighlight,
    closeTabByMatch,
    closeNonActiveTabs,
    closeAllTabs,
    makeTabDormant,
    muteUnmuteTab,
    pinUnpinTab,
    switchToTab,
    closeTab
  } = useTabFunctions({
    tabs,
    setTabs,
    highlightedTabs,
    setHighlightedTabs,
    setSessions,
    saveSessionOrderToStorage,
    BASE_URL
  });

  
  const {
    ungroupTabs,
    ungroupTab,
    getAllTabsInGroup,
    closeTabsInGroup,
    toggleAutoGrouping,
    toggleTabGroupCollapse,
    groupTabsByUrlPattern,
    reorderGroupedTabs,
    pinGroup,
    unpinGroup,
    handleGroupBySelection,
    moveGroupedTabToAnotherGroup,
    updateAutoGroupingToggle,
    moveUngroupedTabToGroup,
    fetchTabsInCategories,
    reorderTabsWithinGroup,
    moveGroupToNewWindow,
    openNewTabInGroup,
  } = useGroupFunctions({tabs, fetchTabs});


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
        ungroupTab,
        getAllTabsInGroup,
        closeTabsInGroup,
        pinGroup,
        unpinGroup,
        groupTabsByUrlPattern,
        moveUngroupedTabToGroup,
        moveGroupedTabToAnotherGroup,
        fetchTabsInCategories,
        handleGroupBySelection,
        switchToTab,
        reorderTabsWithinGroup,
        updateAutoGroupingToggle,
        reorderGroupedTabs,
        moveGroupToNewWindow,
        openNewTabInGroup,
      }}
    >
      {children}
    </CommandStructureContext.Provider>
  );
};

export const useCommandStructure = () => {
  return useContext(CommandStructureContext);
};
