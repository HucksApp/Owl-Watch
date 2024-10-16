import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Restore as RestoreIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useCommandStructure } from "../contexts/CommandStructureContext";
/* global chrome */ // Add this line to inform ESLint

/**
 * SessionManager Component
 *
 * A component for managing browser sessions. It allows users to save, restore, and delete sessions,
 * with the session list being dynamically updated
 *
 * @component
 * @example
 * // Usage example:
 * <SessionManager />
 *
 * @returns {JSX.Element} A session management interface with options to save, restore, and delete sessions.
 */

const SessionManager = () => {
  const { sessions, saveSession, deleteSession, restoreSession } =
    useCommandStructure();
  const [sessionName, setSessionName] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [sessions]);

  const handleSaveSession = () => {
    if (sessionName) {
      saveSession(sessionName);
      setSessionName("");
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  };

  return (
    <div>
      <Typography variant="h5">Session Manager</Typography>
      <TextField
        label="Session Name"
        variant="outlined"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={handleSaveSession}>
        Save Session
      </Button>
      <List>
        {sessions.map((session) => (
          <>
            <ListItem
              key={session._id}
              secondaryAction={
                <>
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
                </>
              }
            >
              <ListItemText
                primary={session.name ? session.name : "No Name"}
                secondary={
                  session.updatedAt &&
                  !isNaN(new Date(session.updatedAt).getTime())
                    ? `${format(new Date(session.updatedAt), "PPPpp")}`
                    : session.createdAt &&
                      !isNaN(new Date(session.createdAt).getTime())
                    ? `${format(new Date(session.createdAt), "PPPpp")}`
                    : "Recent"
                }
              />
            </ListItem>
            <Divider component="li" />
          </>
        ))}
      </List>
    </div>
  );
};

export default SessionManager;
