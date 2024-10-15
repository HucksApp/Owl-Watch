// src/contexts/CommandStructureContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../services/api";
//import { format } from 'date-fns';

/* global chrome */

const CommandStructureContext = createContext();

export const CommandStructureProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
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
        closeTabByMatch, // Added for close <match> functionality
        saveSession,
        restoreSession,
        deleteSession,
      }}
    >
      {children}
    </CommandStructureContext.Provider>
  );
};

export const useCommandStructure = () => {
  return useContext(CommandStructureContext);
};
