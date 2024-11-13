/* global chrome */

const useGroupFunctions = ({ tabs, fetchTabs }) => {
  // Helper function to create a new tab group
  const createTabGroup = (groupName, tabIds, groupColor, callback) => {
    chrome.tabs.group({ tabIds }, (groupId) => {
      // Set group properties (name and color)
      chrome.tabGroups.update(
        groupId,
        {
          title: groupName,
          color: groupColor,
        },
        () => {
          // Pass the groupId to the callback for further processing
          if (callback) callback(groupId);
        }
      );
    });
  };

  // Function to ungroup all tabs in a specific group by group ID
  const ungroupTabs = (groupId) => {
    chrome.tabs.query({}, (tabs) => {
      const groupTabs = tabs.filter((tab) => tab.groupId === groupId);
      if (groupTabs.length === 0) {
        return;
      }

      const tabIds = groupTabs.map((tab) => tab.id);
      chrome.tabs.ungroup(tabIds, () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Error ungrouping tabs in group ID: ${groupId}. Error: ${chrome.runtime.lastError.message}`
          );
        } else {
          // Remove group from session storage
          chrome.storage.local.get(["owl_watch_session"], (result) => {
            let session = result.owl_watch_session || { groups: [] };
            session.groups = session.groups.filter(
              (group) => group.id !== groupId
            ); // Remove group

            chrome.storage.local.set({ owl_watch_session: session }, () => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error updating session storage:",
                  chrome.runtime.lastError
                );
              } else {
                console.log(
                  `Group ID ${groupId} removed from session storage.`
                );
              }
            });
          });
        }
      });
    });
  };

  const getAllTabsInGroup = (groupId) => {
    chrome.tabGroups.get(groupId, function (group) {
      chrome.tabs.get(group.tabIds, function (tabs) {
        console.log("Tabs in group:", tabs);
      });
    });
  };

  const closeTabsInGroup = (groupId) => {
    chrome.tabs.query({}, (tabs) => {
      const groupTabs = tabs.filter((tab) => tab.groupId === groupId);
      if (groupTabs.length === 0) {
        return;
      }

      const tabIds = groupTabs.map((tab) => tab.id);
      chrome.tabs.remove(tabIds, () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Error closing tabs in group ID: ${groupId}. Error: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.log(`Closed all tabs in group ID: ${groupId}`);
          fetchTabs();

          // Remove group from session storage
          chrome.storage.local.get(["owl_watch_session"], (result) => {
            let session = result.owl_watch_session || { groups: [] };
            session.groups = session.groups.filter(
              (group) => group.id !== groupId
            ); // Remove group

            chrome.storage.local.set({ owl_watch_session: session }, () => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error updating session storage:",
                  chrome.runtime.lastError
                );
              } else {
                console.log(
                  `Group ID ${groupId} removed from session storage.`
                );
              }
            });
          });
        }
      });
    });
  };
  const toggleTabGroupCollapse = (groupId, collapse = true) => {
    chrome.tabGroups.update(groupId, { collapsed: collapse }, (group) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error toggling collapse for group ID: ${groupId}. Error: ${chrome.runtime.lastError.message}`
        );
      } else {
        console.log(
          `Group ID: ${groupId} is now ${collapse ? "collapsed" : "expanded"}`
        );
      }
    });
  };

  const groupTabsByUrlPattern = (urlpatterns, groupName, groupColor) => {
    // Split and clean the patterns
    const patterns = urlpatterns
      .split(/\s+/)
      .map((url) => url.trim())
      .filter(Boolean);

    // Query all open tabs
    chrome.tabs.query({}, (tabs) => {
      // Retrieve the current session from local storage
      chrome.storage.local.get(["owl_watch_session"], (result) => {
        let session = result.owl_watch_session || { groups: [] };

        // Filter tabs that match any of the patterns and are not yet grouped (groupId = -1)
        const matchingTabs = tabs.filter(
          (tab) =>
            tab.groupId === -1 &&
            patterns.some((pattern) => tab.url.includes(pattern))
        );
        const matchingTabIds = matchingTabs.map((tab) => tab.id);

        if (matchingTabIds.length > 0) {
          // Create a new tab group if there are matching tabs
          createTabGroup(groupName, matchingTabIds, groupColor, (groupId) => {
            // Once the group is created, update the session with the new group details
            session.groups.push({
              id: groupId,
              name: groupName,
              collapsed: false,
              patterns: patterns, // Save patterns as an array
              color: groupColor,
            });

            // Save the updated session back to local storage
            chrome.storage.local.set({ owl_watch_session: session }, () => {
              console.log(
                `Session updated with new group: ${groupName}, patterns: ${patterns.join(
                  ", "
                )}`
              );
            });
          });
        }
      });
    });
  };

  const updateAutoGroupingToggle = (setAutoGroupingToggle) => {
    chrome.storage.local.get(["owl_watch_session"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error fetching session:", chrome.runtime.lastError);
        return;
      }

      let session = result.owl_watch_session || { autoGrouping: false };

      // Check if callback is defined before calling
      if (
        setAutoGroupingToggle &&
        typeof setAutoGroupingToggle === "function"
      ) {
        setAutoGroupingToggle(session.autoGrouping);
      } else {
        console.warn("setAutoGroupingToggle is not a function");
      }
    });
  };

  const toggleAutoGrouping = (enabled) => {
    chrome.runtime.sendMessage(
      {
        type: "Toggle_Auto_Grouping",
        enabled: enabled,
      },
      (response) => {
        if (response.status === "success") {
          chrome.storage.local.get(["owl_watch_session"], (result) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error fetching session:",
                chrome.runtime.lastError
              );
              return;
            }

            let session = result.owl_watch_session || { autoGrouping: false };
            session.autoGrouping = enabled;

            chrome.storage.local.set({ owl_watch_session: session }, () => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error saving session:",
                  chrome.runtime.lastError
                );
                return;
              }
              console.log("Auto grouping setting saved successfully.");
            });
          });

          console.log(
            `Auto grouping is now ${enabled ? "enabled" : "disabled"}`
          );
        } else {
          console.log("Failed to toggle auto grouping.");
        }
      }
    );
  };

  const pinGroup = (groupId) => {
    // Get all tabs in the group
    chrome.tabs.query({ groupId: groupId }, (tabs) => {
      // Iterate over the tabs and pin each one
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { pinned: true });
      });
    });
  };

  const unpinGroup = (groupId) => {
    // Get all tabs in the group
    chrome.tabs.query({ groupId: groupId }, (tabs) => {
      // Iterate over the tabs and unpin each one
      tabs.forEach((tab) => {
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
        const matchingTabs = tabs.filter(
          (tab) => selectedTabIds.includes(tab.id) && tab.groupId === -1
        );

        // If there are any matching tabs, create a new group
        if (matchingTabs.length > 0) {
          const matchingTabIds = matchingTabs.map((tab) => tab.id);

          // Create a new tab group with the selected tabs
          createTabGroup(groupName, matchingTabIds, groupColor, (groupId) => {
            // Once the group is created, update the session with the new group details
            session.groups.push({
              id: groupId,
              name: groupName,
              patterns: [], // No patterns since this is based on selection
              color: groupColor,
            });

            // Save the updated session back to local storage
            chrome.storage.local.set({ owl_watch_session: session }, () => {
              console.log(
                `Session updated with new group: ${groupName}, from selected tabs.`
              );
            });
          });
        }
      });
    });
  };

  const moveUngroupedTabToGroup = (tabId, targetGroupId) => {
    // Update the specified tab's group
    const groupIdInt = parseInt(targetGroupId, 10);
    chrome.tabs.group({ tabIds: tabId, groupId: groupIdInt }, () => {
      console.log(`Tab with ID ${tabId} moved to group ID: ${groupIdInt}`);
    });
  };

  const moveGroupedTabToAnotherGroup = (tabId, targetGroupId) => {
    // Query the tab to ensure it is currently grouped
    chrome.tabs.get(tabId, (tab) => {
      if (tab.groupId !== -1) {
        // Move the tab to the target group
        const groupIdInt = parseInt(targetGroupId, 10);
        chrome.tabs.group({ tabIds: [tabId], groupId: groupIdInt }, () => {});
      } else {
        console.log(`Tab with ID ${tabId} is not grouped and cannot be moved.`);
      }
    });
  };

  const fetchTabsInCategories = async () => {
    const fetchedGroups = await chrome.tabGroups.query({}); // Fetch tab groups

    // Process tabs and groups
    const ungrouped = [];
    const pinned = [];
    const grouped = [];

    // Loop through fetched tabs
    tabs.forEach((tab) => {
      if (tab.pinned) {
        pinned.push(tab); // Collect pinned tabs
      } else if (tab.groupId === -1) {
        ungrouped.push(tab); // Collect ungrouped tabs
      } else {
        // Find the group by its ID
        const group = fetchedGroups.find((g) => g.id === tab.groupId);
        if (group) {
          // Ensure the group exists in the grouped array
          let existingGroup = grouped.find((g) => g.id === group.id);
          if (!existingGroup) {
            existingGroup = {
              id: group.id,
              name: group.title,
              color: group.color,
              collapsed: group.collapsed,
              tabs: [],
            };
            grouped.push(existingGroup);
          }
          existingGroup.tabs.push(tab); // Add tab to its group
        }
      }
    });

    return { ungrouped, pinned, grouped };
  };

  const reorderTabsWithinGroup = (
    groupedTabs,
    setGroupedTabs,
    groupId,
    startIndex,
    endIndex
  ) => {
    const groupIdInt = parseInt(groupId, 10);

    // Rearranging tabs in the local group state (UI)
    const updatedGroups = groupedTabs.map((group) => {
      if (group.id === groupIdInt) {
        const reorderedTabs = Array.from(group.tabs);
        const [movedTab] = reorderedTabs.splice(startIndex, 1); // Remove tab from original position
        reorderedTabs.splice(endIndex, 0, movedTab); // Insert tab into new position within group
        return { ...group, tabs: reorderedTabs };
      }
      return group;
    });

    setGroupedTabs(updatedGroups);
    const updatedGroup = updatedGroups.find((group) => group.id == groupIdInt);
    const movedTabId = updatedGroup.tabs[endIndex].id;
    // Get the moved tab and calculate its new global index
    const originalGlobalIndex = tabs.findIndex((tab) => tab.id === movedTabId);

    // Calculate the new global index
    const globalTabsBeforeMovedGroup = tabs.slice(0, originalGlobalIndex); // Tabs before the moved tab

    // New global index is the count of all tabs before the current group and the new endIndex
    let newGlobalIndex;
    if (startIndex < endIndex) {
      // Moving down in the group
      newGlobalIndex = globalTabsBeforeMovedGroup.length + endIndex;
    } else {
      // Moving up in the group
      newGlobalIndex = globalTabsBeforeMovedGroup.length - startIndex;
    }
    // Move the tab in the Chrome tab strip
    chrome.tabs.move(movedTabId, { index: newGlobalIndex });
    fetchTabs();
  };

  const ungroupTab = (tabId) => {
    const tab = tabs.find((tabp) => tabp.id === tabId);
    if (tab.groupId !== -1) {
      // The tab is in a group, so ungroup it
      chrome.tabs.ungroup(tabId, () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Failed to ungroup tab with ID ${tabId}: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.log(`Tab with ID ${tabId} has been ungrouped`);
        }
      });
    } else {
      console.log(`Tab with ID ${tabId} is not in a group.`);
    }
  };

  const reorderGroupedTabs = (startIndex, endIndex, tabList, setTabList) => {
    const reorderedTabs = Array.from(tabList);
    const [movedTab] = reorderedTabs.splice(startIndex, 1);
    reorderedTabs.splice(endIndex, 0, movedTab);
    setTabList(reorderedTabs);

    // Update the tab order in Chrome
    chrome.tabs.move(movedTab.id, { index: endIndex });
    fetchTabs();
  };

  // Wrapper function to move a group to a new window
function moveGroupToNewWindow(groupId) {
  console.log(groupId, "HEREEEE")
    chrome.runtime.sendMessage(
      { action: "moveGroupToNewWindow", groupId },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            `Error toggling collapse for group ID: ${groupId}. Error: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.log(response)
        }
      }
    );
}

// Wrapper function to open a new tab in an existing group
function openNewTabInGroup(groupId) {
    chrome.runtime.sendMessage(
      { action: "openNewTabInGroup", groupId },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            `Error toggling collapse for group ID: ${groupId}. Error: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.log(response)
        }
      }
    );
}


  return {
    ungroupTabs,
    ungroupTab,
    getAllTabsInGroup,
    closeTabsInGroup,
    toggleAutoGrouping,
    toggleTabGroupCollapse,
    groupTabsByUrlPattern,
    pinGroup,
    unpinGroup,
    handleGroupBySelection,
    moveGroupedTabToAnotherGroup,
    updateAutoGroupingToggle,
    moveUngroupedTabToGroup,
    fetchTabsInCategories,
    reorderGroupedTabs,
    reorderTabsWithinGroup,
    moveGroupToNewWindow,
    openNewTabInGroup,
  };
};

export default useGroupFunctions;
