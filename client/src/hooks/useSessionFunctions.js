import axios from '../services/api';
/* global chrome */



const useSessionFunctions = ({ sessions, setSessions, BASE_URL }) => {


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
        fetchSessions()
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
      fetchSessions()
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
  return {
        fetchSessions,
        saveSession,
        restoreSession,
        deleteSession,
        reorderSessionTabs,
        reorderSessions,
        removeTabFromSession,
        moveTabBetweenSessions,
        saveSessionOrderToStorage
  }

}

export default   useSessionFunctions;