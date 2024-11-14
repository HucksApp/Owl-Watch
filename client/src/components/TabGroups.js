import React, { useState, useEffect } from "react";
import { useCommandStructure } from "../contexts/CommandStructureContext";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  FormGroup,
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Switch,
} from "@mui/material";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ColorPicker from "./ColorPicker";
import RepartitionIcon from "@mui/icons-material/Repartition";
import ExpandIcon from "@mui/icons-material/Expand";
import CompressIcon from "@mui/icons-material/Compress";
import WindowIcon from "@mui/icons-material/Window";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";

import "../styles/list.css";
import Tab from "./Tab";

const TabGroups = () => {
  const [ungroupedTabs, setUngroupedTabs] = useState([]);
  const [pinnedTabs, setPinnedTabs] = useState([]);
  const [groupedTabs, setGroupedTabs] = useState([]);
  const [autoGrouping, setAutoGrouping] = useState(false);
  const [groupBy, setGroupBy] = useState("selection"); // 'selection', 'urlPattern'
  const [groupName, setGroupName] = useState("");
  const [groupColor, setGroupColor] = useState("grey"); // Default color
  const [urlPattern, setUrlPattern] = useState("");
  const [selectedTabIds, setSelectedTabIds] = useState([]);
  const {
    fetchTabsInCategories,
    tabs,
    pinUnpinTab,
    ungroupTabs,
    ungroupTab,
    toggleAutoGrouping,
    updateAutoGroupingToggle,
    toggleTabGroupCollapse,
    groupTabsByUrlPattern,
    moveUngroupedTabToGroup,
    moveGroupedTabToAnotherGroup,
    closeTabsInGroup,
    reorderGroupedTabs,
    reorderTabsWithinGroup,
    handleGroupBySelection,
    moveGroupToNewWindow,
    openNewTabInGroup,
  } = useCommandStructure();

  useEffect(() => {
    const getTabs = async () => {
      try {
        const { ungrouped, pinned, grouped } = await fetchTabsInCategories();
        setUngroupedTabs(ungrouped);
        setPinnedTabs(pinned);
        setGroupedTabs(grouped);
      } catch (error) {
        console.error("Error fetching tabs:", error);
      }
    };

    getTabs();

    return;
  }, [tabs, groupedTabs, pinUnpinTab]);

  const handleGroupByUrlPattern = () => {
    groupTabsByUrlPattern(urlPattern, groupName, groupColor);
  };

  const toggleTabGroupCollapseUpdate = (groupId, collapsed) => {
    // Call the function to toggle the collapse state
    toggleTabGroupCollapse(groupId, collapsed);
    // Update the local state of groupedTabs
    setGroupedTabs((prevGroupedTabs) =>
      prevGroupedTabs.map((group) =>
        group.id === groupId ? { ...group, collapsed } : group
      )
    );
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return; // Dropped outside the list
    }

    // Moving from ungrouped to pinned or vice versa
    if (
      (source.droppableId === "ungroupedTabs" &&
        destination.droppableId === "pinnedTabs") ||
      (source.droppableId === "pinnedTabs" &&
        destination.droppableId === "ungroupedTabs")
    ) {
      const tabId =
        source.droppableId === "ungroupedTabs"
          ? ungroupedTabs[source.index].id
          : pinnedTabs[source.index].id;

      const shouldPin = destination.droppableId === "pinnedTabs";
      pinUnpinTab(tabId, shouldPin); // Pin or unpin the tab based on destination
      return;
    }

    // Moving ungrouped tab to a group
    if (
      source.droppableId === "ungroupedTabs" &&
      destination.droppableId.startsWith("group-")
    ) {
      const tabId = ungroupedTabs[source.index].id;
      const destinationGroupId = destination.droppableId.split("-")[1];
      moveUngroupedTabToGroup(tabId, destinationGroupId);
      return;
    }

    // Moving tab from one group to another
    if (
      source.droppableId.startsWith("group-") &&
      destination.droppableId.startsWith("group-")
    ) {
      const sourceGroupId = source.droppableId.split("-")[1];
      const destinationGroupId = destination.droppableId.split("-")[1];
      // Check if source and destination are the same group
      if (sourceGroupId === destinationGroupId) {
        reorderTabsWithinGroup(
          groupedTabs,
          setGroupedTabs,
          sourceGroupId,
          source.index,
          destination.index
        );
        return;
      }
      const tabId = groupedTabs.find((group) => group.id == sourceGroupId).tabs[
        source.index
      ].id;
      moveGroupedTabToAnotherGroup(tabId, destinationGroupId);
      return;
    }

    // Moving grouped tab back to ungrouped
    if (
      source.droppableId.startsWith("group-") &&
      destination.droppableId === "ungroupedTabs"
    ) {
      const sourceGroupId = source.droppableId.split("-")[1];
      const tabId = groupedTabs.find((group) => group.id == sourceGroupId).tabs[
        source.index
      ].id;
      ungroupTab(tabId);
      return;
    }

    // Moving tab within the same list (rearranging)
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "ungroupedTabs") {
        // Rearrange ungrouped tabs
        reorderGroupedTabs(
          source.index,
          destination.index,
          ungroupedTabs,
          setUngroupedTabs
        );
      } else if (source.droppableId === "pinnedTabs") {
        // Rearrange pinned tabs
        reorderGroupedTabs(
          source.index,
          destination.index,
          pinnedTabs,
          setPinnedTabs
        );
      }
    }
  };

  const handleUngroupChecked = (tab) => {
    return selectedTabIds.includes(tab.id);
  };

  const handleUngroupChange = (tab) => {
    handleSelectionChange(tab.id);
  };

  // Handle selection change
  const handleSelectionChange = (tabId) => {
    setSelectedTabIds(
      (prev) =>
        prev.includes(tabId)
          ? prev.filter((id) => id !== tabId) // Remove the tabId if already selected
          : [...prev, tabId] // Add the tabId if not selected
    );
  };

  useEffect(() => {
    updateAutoGroupingToggle(setAutoGrouping);
  }, []);

  const handleAutoGrouping = (e) => {
    const enabled = e.target.checked;
    setAutoGrouping(enabled);
    toggleAutoGrouping(enabled);
  };

  const refinedColors = {
    grey: "#E0E0E0",
    blue: "#ADD8E6", // Light Blue
    red: "#F28B82", // Soft Red
    yellow: "#FFF475", // Soft Yellow
    green: "#CCFF90", // Light Green
    pink: "#FDCFE8", // Soft Pink
    purple: "#D7AEFB", // Light Purple
    cyan: "#A7FFEB", // Light Cyan
    orange: "#FFAB40", // Soft Orange
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box className="tab-groups" sx={{ padding: 2 }}>
        <Box className="grouping-controls" sx={{ marginBottom: 5 }}>
          <FormGroup sx={{ marginBottom: 1 }}>
            <Typography variant="h6">
              {`Auto Grouping ${autoGrouping ? "On" : "Off"}`}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "flex-start" }}
            >
              <Typography>Off</Typography>
              <Switch
                checked={autoGrouping}
                onChange={handleAutoGrouping}
                size="small"
                color="warning"
              />
              <Typography>On</Typography>
            </Stack>
          </FormGroup>
          <Select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            sx={{ marginRight: 1, padding: "5px 0px", marginBottom: 1 }}
          >
            <MenuItem value="selection">Group by Selection</MenuItem>
            <MenuItem value="urlPattern">Group by URL Pattern</MenuItem>
          </Select>
          <TextField
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ marginRight: 1 }}
          />
          <ColorPicker
            selectedColor={groupColor}
            onColorChange={setGroupColor}
            refinedColors={refinedColors}
          />{" "}
          {/* Use the ColorPicker */}
          {groupBy === "urlPattern" ? (
            <>
              <TextField
                label="Enter URL patterns"
                value={urlPattern}
                onChange={(e) => setUrlPattern(e.target.value)}
                multiline
                sx={{ marginRight: 1, marginBottom: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleGroupByUrlPattern}
              >
                Add Group
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleGroupBySelection(selectedTabIds, groupName, groupColor);
                setSelectedTabIds([]);
              }}
              disabled={selectedTabIds.length === 0} // Disable if no tabs are selected
            >
              Add Group
            </Button>
          )}
        </Box>

        <Droppable droppableId="ungroupedTabs">
          {(provided) => (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{}}
              >
                <Typography sx={{ fontWeight: 1000 }}>
                  Ungrouped Tabs
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  className="tab-section"
                  sx={{ marginBottom: 2 }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <List>
                    {ungroupedTabs.map((tab, index) => (
                      <Draggable
                        key={tab.id}
                        draggableId={tab.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <ListItem divider dense alignItems="flex-start">
                              <Tab
                                key={tab.id}
                                tab={tab}
                                checkeable={true}
                                handleChange={handleUngroupChange}
                                handleChecked={handleUngroupChecked}
                              />
                            </ListItem>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Droppable>

        <Droppable droppableId="pinnedTabs">
          {(provided) => (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{}}
              >
                <Typography sx={{ fontWeight: 1000 }}>Pinned Tabs</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  className="tab-section"
                  sx={{ marginBottom: 2 }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <List>
                    {pinnedTabs.map((tab, index) => (
                      <Draggable
                        key={tab.id}
                        draggableId={tab.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <ListItem divider dense alignItems="flex-start">
                              <Tab tab={tab} checkeable={false} />
                            </ListItem>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Droppable>

        {groupedTabs.map((group, groupIndex) => (
          <Droppable key={group.id} droppableId={`group-${group.id}`}>
            {(provided) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  sx={{
                    backgroundColor: refinedColors[group.color],
                  }}
                >
                  <Typography sx={{ fontWeight: 1000 }}>
                    {group.name.charAt(0).toUpperCase() +  group.name.slice(1)}
                  </Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      marginLeft: "5px",
                      fontWeight: 1000,
                    }}
                  >
                    Group
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: refinedColors[group.color],
                  }}
                >
                  <Paper ref={provided.innerRef} {...provided.droppableProps}>
                    <Box sx={{ padding: "10px 0px" }}>
                      <Tooltip
                        title="Ungroup"
                        sx={{
                          marginRight: 1,
                          marginLeft: 1,
                          backgroundColor: refinedColors[group.color],
                        }}
                      >
                        <IconButton
                          color="inherit"
                          onClick={() => ungroupTabs(group.id)}
                        >
                          <RepartitionIcon
                            fontSize="small"
                            sx={{ fontWeight: "1000" }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title="Close Group"
                        sx={{
                          marginRight: 1,
                          marginLeft: 1,
                          backgroundColor: refinedColors[group.color],
                        }}
                      >
                        <IconButton
                          color="inherit"
                          onClick={() => closeTabsInGroup(group.id)}
                        >
                          <CloseIcon
                            fontSize="small"
                            sx={{ fontWeight: "1000" }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={group.collapsed ? "Expand" : "Collapse"}
                        sx={{
                          marginRight: 1,
                          marginLeft: 1,
                          backgroundColor: refinedColors[group.color],
                        }}
                      >
                        <IconButton
                          color="inherit"
                          onClick={() =>
                            toggleTabGroupCollapseUpdate(
                              group.id,
                              !group.collapsed
                            )
                          }
                        >
                          {group.collapsed ? (
                            <ExpandIcon fontSize="small" />
                          ) : (
                            <CompressIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title="Move Group to New window"
                        sx={{
                          marginRight: 1,
                          marginLeft: 1,
                          backgroundColor: refinedColors[group.color],
                        }}
                      >
                        <IconButton
                          color="inherit"
                          onClick={() => moveGroupToNewWindow(group.id)}
                        >
                          <WindowIcon
                            fontSize="small"
                            sx={{ fontWeight: "1000" }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title="Open New Tab In Group"
                        sx={{
                          marginRight: 1,
                          marginLeft: 1,
                          backgroundColor: refinedColors[group.color],
                        }}
                      >
                        <IconButton
                          color="inherit"
                          onClick={() => openNewTabInGroup(group.id)}
                        >
                          <OpenInBrowserIcon
                            fontSize="small"
                            sx={{ fontWeight: "1000" }}
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <List>
                      {group.tabs.map((tab, index) => (
                        <Draggable
                          key={tab.id}
                          draggableId={tab.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <ListItem divider dense alignItems="flex-start">
                                <Tab tab={tab} checkeable={false} />
                                {/*<ListItemText primary={tab.title} />*/}
                              </ListItem>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default TabGroups;
