import React, { useState } from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  List,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Typography,
  TextField,
  Divider,
  Collapse,
  ListItemButton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  ExpandMore,
  ExpandLess,
  Close as CancelIcon,
  SaveAlt,
} from "@mui/icons-material";

import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCommandStructure } from "../contexts/CommandStructureContext";

const SessionManager = () => {
  const {
    sessions,
    saveSession,
    deleteSession,
    restoreSession,
    moveTabBetweenSessions,
    removeTabFromSession,
    reorderSessionTabs,
    reorderSessions,
  } = useCommandStructure();

  const [sessionName, setSessionName] = useState("");
  const [expandedSessions, setExpandedSessions] = useState([]);

  // Toggle session expansion
  const toggleExpand = (sessionId) => {
    if (expandedSessions.includes(sessionId)) {
      setExpandedSessions(expandedSessions.filter((id) => id !== sessionId));
    } else {
      setExpandedSessions([...expandedSessions, sessionId]);
    }
  };

  const handleOpenTab = (url) => {
    window.open(url, "_blank"); // Opens in a new tab
  };

  // Save a new session
  const handleSaveSession = () => {
    if (sessionName.trim()) {
      saveSession(sessionName);
      setSessionName("");
    }
  };

  // Handle drag-and-drop events
  const handleOnDragEnd = async (result) => {
    const { destination, source, type } = result;
    if (!destination) return; // If dropped outside a droppable

    if (type === "tab") {
      const sourceSessionId = source.droppableId;
      const destinationSessionId = destination.droppableId;

      if (sourceSessionId !== destinationSessionId) {
        // Move tab between sessions
        const tab = sessions.find((s) => s._id === sourceSessionId).tabs[
          source.index
        ];
        await moveTabBetweenSessions(
          tab,
          sourceSessionId,
          destinationSessionId
        );
      } else {
        // Reorder tabs within the same session
        const reorderedTabs = Array.from(
          sessions.find((s) => s._id === sourceSessionId).tabs
        );
        const [movedTab] = reorderedTabs.splice(source.index, 1);
        reorderedTabs.splice(destination.index, 0, movedTab);
        await reorderSessionTabs(sourceSessionId, reorderedTabs);
      }
    } else if (type === "session") {
      if (source.index !== destination.index) {
        const reorderedSessions = Array.from(sessions);
        const [movedSession] = reorderedSessions.splice(source.index, 1);
        reorderedSessions.splice(destination.index, 0, movedSession);

        await reorderSessions(reorderedSessions);
      }
    }
  };

  return (
    <div style={{ marginBottom: "10px", paddingBottom: "30px" }}>
      <Typography variant="h4" gutterBottom>
        Session Manager
      </Typography>

      {/* Input to save a new session */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Session Name"
            variant="outlined"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid sx={{ paddingBottom: "8px" }} item xs={12} md={3}>
          <Button
            variant="contained"
            onClick={handleSaveSession}
            startIcon={<SaveAlt />}
            sx={{ padding: "10px" }}
            fullWidth
          >
            Save Session
          </Button>
        </Grid>
      </Grid>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        {/* Droppable for all sessions */}
        <Droppable droppableId="all-sessions" type="session">
          {(provided) => (
            <Grid
              container
              spacing={3}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sessions.map((session, index) => (
                <Draggable
                  key={session._id}
                  draggableId={session._id}
                  index={index}
                >
                  {(provided) => (
                    <Grid
                      item
                      xs={12}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Paper
                        elevation={3}
                        style={{ padding: "16px", position: "relative" }}
                      >
                        <Grid
                          container
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Grid item>
                            <Typography sx={{ fontWeight: 1000 }}>
                              {session.name || "Unnamed Session"}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "8px",
                                color: "#1976d2",
                                fontWeight: "bold",
                              }}
                              variant="body5"
                            >
                              {session.updatedAt &&
                              !isNaN(new Date(session.updatedAt).getTime())
                                ? `${format(
                                    new Date(session.updatedAt),
                                    "PPPpp"
                                  )}`
                                : session.createdAt &&
                                  !isNaN(new Date(session.createdAt).getTime())
                                ? `${format(
                                    new Date(session.createdAt),
                                    "PPPpp"
                                  )}`
                                : "Recent"}
                            </Typography>
                          </Grid>
                          <Grid sx={{ justifySelf: "flex-end" }} item>
                            <Tooltip title="Restore Session">
                              <IconButton
                                onClick={() => restoreSession(session)}
                                aria-label="restore"
                              >
                                <RestoreIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Session">
                              <IconButton
                                onClick={() => deleteSession(session._id)}
                                aria-label="delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              onClick={() => toggleExpand(session._id)}
                            >
                              {expandedSessions.includes(session._id) ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </IconButton>
                          </Grid>
                        </Grid>

                        <Collapse
                          in={expandedSessions.includes(session._id)}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Divider style={{ margin: "16px 0" }} />
                          {/* Droppable for session's tabs */}
                          <Droppable droppableId={session._id} type="tab">
                            {(provided) => (
                              <List
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {session.tabs.map((tab, tabIndex) => (
                                  <Draggable
                                    key={tab.url}
                                    draggableId={tab.url}
                                    index={tabIndex}
                                  >
                                    {(provided) => (
                                      <Paper
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          padding: "8px 16px",
                                          marginBottom: "8px",
                                          display: "flex",
                                          justifyContent: "space-around",
                                          alignItems: "center",
                                          transition: "transform 0.2s ease",
                                          ...provided.draggableProps.style,
                                        }}
                                        elevation={1}
                                      >
                                        <ListItemAvatar>
                                          {/* Display the tab icon */}
                                          {tab.favIconUrl ? (
                                            <Avatar
                                              sx={{ width: 24, height: 24 }}
                                              alt={tab.title}
                                              src={tab.favIconUrl}
                                            />
                                          ) : (
                                            <Avatar
                                              sx={{ width: 24, height: 24 }}
                                            >
                                              OWL
                                            </Avatar>
                                          )}
                                        </ListItemAvatar>
                                        <ListItemButton
                                          onClick={() => handleOpenTab(tab.url)}
                                          title="Open Url in Window"
                                        >
                                          <ListItemText
                                            primary={
                                              tab.title || "Untitled Tab"
                                            }
                                            secondary={tab.url}
                                          />
                                        </ListItemButton>
                                        <div
                                          style={{ justifySelf: "flex-end" }}
                                        >
                                          <Tooltip title="Delete Tab">
                                            <IconButton
                                              onClick={() =>
                                                removeTabFromSession(
                                                  session._id,
                                                  tab._id
                                                )
                                              }
                                            >
                                              <CancelIcon
                                                sx={{
                                                  fontWeight: 1000,
                                                  color: "rgb(196, 50, 50)",
                                                }}
                                              />
                                            </IconButton>
                                          </Tooltip>
                                        </div>
                                      </Paper>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </List>
                            )}
                          </Droppable>
                        </Collapse>
                      </Paper>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SessionManager;
