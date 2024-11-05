import React, { Fragment, useState, useEffect } from "react";
import {
  Button,
  List,
  ListItem,
  Typography,
  TextField,
  Box,
  Container,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import { useCommandStructure } from "../contexts/CommandStructureContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Tab from "./Tab";
import "../styles/list.css";

/**
 * TabManager Component
 *
 * A component that manages browser tabs, allowing users to close non-active or all tabs.
 * It displays a list of currently open tabs, highlighting active ones, and allows users
 * to close individual inactive tabs. Tab details include the title or URL and the last accessed time.
 *
 * @component
 * @example
 * // Usage example:
 * <TabManager />
 *
 * @returns {JSX.Element} A tab management interface for displaying and managing browser tabs.
 */

const TabManager = () => {
  const {
    tabs,
    closeNonActiveTabs,
    closeAllTabs,
    highlightedTabs,
    toggleTabHighlight,
    reorderTabs,
    moveHighlightedTabsToNewWindow,
    saveHighlightedTabsAsSession,
    removeHighlightedTabs,
  } = useCommandStructure();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSessionInput, setShowSessionInput] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const filteredTabs = tabs.filter(
    (tab) =>
      tab.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tab.title && tab.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    reorderTabs(result.source.index, result.destination.index);
  };

  const handleSaveSession = () => {
    if (sessionName.trim()) {
      saveHighlightedTabsAsSession(sessionName);
      setShowSessionInput(false);
      setSessionName("");
    }
  };

  const handleChange = (tab) => {
    toggleTabHighlight(tab.id);
  };

  const handleChecked = (tab) => {
    return highlightedTabs.some(
      (highlightedTab) => highlightedTab.id === tab.id
    );
  };

  useEffect(() => {
    if (highlightedTabs.length < 1) setShowSessionInput(false);
  }, [highlightedTabs]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Tab Manager
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search Tabs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-start" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CancelIcon />}
          onClick={closeNonActiveTabs}
          sx={{
            marginBottom: "5px",
            justifyContent: "flex-start",
            padding: "10px",
            paddingLeft: "20px",
          }}
        >
          Close Non-Active Tabs
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<CancelIcon />}
          onClick={closeAllTabs}
          sx={{
            marginBottom: "5px",
            justifyContent: "flex-start",
            padding: "10px",
            paddingLeft: "20px",
          }}
        >
          Close All Tabs
        </Button>

        {/* Only show these buttons if at least one tab is highlighted */}
        {highlightedTabs.length > 0 && (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<OpenInBrowserIcon />}
              onClick={moveHighlightedTabsToNewWindow}
              sx={{
                marginBottom: "5px",
                justifyContent: "flex-start",
                padding: "10px",
                paddingLeft: "20px",
              }}
            >
              Move to New Window
            </Button>

            {/* Remove Highlighted Tabs Button */}
            <Button
              variant="contained"
              color="error"
              onClick={removeHighlightedTabs}
              startIcon={<PlaylistRemoveIcon />}
              sx={{
                marginBottom: "5px",
                justifyContent: "flex-start",
                padding: "10px",
                paddingLeft: "20px",
              }}
            >
              Remove Selected Tabs
            </Button>

            {!showSessionInput && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowSessionInput(!showSessionInput)}
                startIcon={<SaveAltIcon />}
                sx={{
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                  padding: "10px",
                  paddingLeft: "20px",
                }}
              >
                Save as Session
              </Button>
            )}

            {showSessionInput && (
              <Box mt={2} display="flex" alignItems="center" sx={{}}>
                <TextField
                  variant="outlined"
                  label="Session Name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  sx={{ marginRight: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveSession}
                  startIcon={<SaveAltIcon />}
                  sx={{
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  Save
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tabs-list">
          {(provided) => (
            <List
              sx={{ boxSizing: "border-box" }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {filteredTabs.map((tab, index) => (
                <Draggable
                  key={tab.id}
                  draggableId={tab.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Fragment>
                      <ListItem
                        divider
                        dense
                        alignItems="flex-start"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          flexWrap: "wrap",
                          boxSizing: "border-box",

                          // Ensure that the dragged element stays with the cursor
                          transform: snapshot.isDragging
                            ? provided.draggableProps.style.transform
                            : "none",
                          transition: snapshot.isDragging
                            ? "none"
                            : "transform 0.2s ease",
                          zIndex: snapshot.isDragging ? 1000 : "auto",
                          backgroundColor: highlightedTabs.some(
                            (highlightedTab) => highlightedTab.id === tab.id
                          )
                            ? "rgba(255,193,7, 0.7)" // Highlighted Tab (Yellowish)
                            : tab.isActive
                            ? "rgba(40,167,69, 0.7)" // Active Tab (Greenish)
                            : "rgba(220,53,69, 0.7)", // Inactive Tab (Reddish)
                          ...provided.draggableProps.style, // Retain the provided draggable styles
                        }}
                      >
                        <Tab
                          tab={tab}
                          checkeable={true}
                          handleChecked={handleChecked}
                          handleChange={handleChange}
                        />
                      </ListItem>
                    </Fragment>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

export default TabManager;
