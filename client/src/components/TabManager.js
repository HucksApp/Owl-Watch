










import React, { Fragment, useState } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  Checkbox,
  Box,
  Container,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useCommandStructure } from "../contexts/CommandStructureContext";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
    closeTab,
    highlightedTabs,
    toggleTabHighlight,
    reorderTabs,
    moveHighlightedTabsToNewWindow,
    saveHighlightedTabsAsSession,
  } = useCommandStructure();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSessionInput, setShowSessionInput] = useState(false);
  const [sessionName, setSessionName] = useState("");

  // Function to filter tabs based on search input
  const filteredTabs = tabs.filter(
    (tab) =>
      tab.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tab.title && tab.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handler for drag-and-drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    reorderTabs(result.source.index, result.destination.index);
  };

  // Save highlighted tabs session with custom session name
  const handleSaveSession = () => {
    if (sessionName.trim()) {
      saveHighlightedTabsAsSession(sessionName);
      setShowSessionInput(false);
      setSessionName(""); 
    }
  };

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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        mb={2}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<CancelIcon />}
          onClick={closeNonActiveTabs}
          sx={{ mb: 1 }}
        >
          Close Non-Active Tabs
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<CancelIcon />}
          onClick={closeAllTabs}
        >
          Close All Tabs
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={moveHighlightedTabsToNewWindow}
          sx={{ mt: 2 }}
        >
          Move Highlighted Tabs to New Window
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowSessionInput(!showSessionInput)}
          sx={{ mt: 1 }}
        >
          Save Highlighted Tabs as Session
        </Button>
        {showSessionInput && (
          <Box mt={2} display="flex" alignItems="center">
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
            >
              Save
            </Button>
          </Box>
        )}
      </Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tabs-list">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {filteredTabs.map((tab, index) => (
                <Draggable
                  key={tab.id}
                  draggableId={tab.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <Fragment>
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          backgroundColor: highlightedTabs.some(
                            (highlightedTab) => highlightedTab.id === tab.id
                          )
                            ? "rgba(255, 223, 0, 0.7)" // Highlighted Tab (Yellowish)
                            : tab.isActive
                            ? "rgba(26, 104, 26, 0.7)" // Active Tab (Greenish)
                            : "rgba(196, 50, 50, 0.7)", // Inactive Tab (Reddish)
                          ...provided.draggableProps.style,
                        }}
                      >
                        <Checkbox
                          checked={highlightedTabs.some(
                            (highlightedTab) => highlightedTab.id === tab.id
                          )}
                          onChange={() => toggleTabHighlight(tab.id)}
                        />

                        <ListItemText
                          primary={`${tab.title || tab.url} - ${
                            tab.isActive ? "Active" : "Inactive"
                          }`}
                          secondary={`Last Accessed: ${
                            tab.lastAccessed !== "Recent"
                              ? format(new Date(tab.lastAccessed), "PPPpp")
                              : "Recent"
                          }`}
                        />

                        {!tab.isActive && (
                          <Tooltip title="Close Tab">
                            <IconButton onClick={() => closeTab(tab.id)}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItem>
                      <Divider component="li" />
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
