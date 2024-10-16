import React from "react";
import { Button, Box, Container, Typography } from "@mui/material";
import { useCommandStructure } from "../contexts/CommandStructureContext";
import {
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  AddCircle,
  Cancel as CancelIcon,
} from "@mui/icons-material";

/**
 * QuickActions Component
 *
 * A component that provides a set of quick action buttons for managing browser sessions and tabs.
 * It allows users to close non-active or all tabs, save the current session, delete the last saved session,
 * and restore the last saved session. All commands are integrated with the session management system.
 *
 * @component
 * @example
 * // Usage example:
 * <QuickActions />
 *
 * @returns {JSX.Element} A set of buttons for performing session and tab management tasks.
 */

const QuickActions = () => {
  const {
    sessions,
    saveSession,
    deleteSession,
    restoreSession,
    closeNonActiveTabs,
    closeAllTabs,
  } = useCommandStructure();
  return (
    <Container>
      <Typography variant="h5">Quick Actions</Typography>
      <Box
        display="flex"
        alignItems="space-around"
        flexDirection="column"
        justifyContent="flex-start"
        mt={2}
      >
        <Button
          variant="contained"
          onClick={closeNonActiveTabs}
          startIcon={<CancelIcon />}
          sx={{ marginBottom: "5px", justifyContent: "flex-start" }}
        >
          Close Non-Active Tabs
        </Button>

        <Button
          variant="contained"
          onClick={closeAllTabs}
          startIcon={<CancelIcon />}
          sx={{ marginBottom: "5px", justifyContent: "flex-start" }}
        >
          Close All Tabs
        </Button>

        <Button
          variant="contained"
          onClick={() => deleteSession(sessions[sessions.length - 1]._id)}
          startIcon={<DeleteIcon />}
          sx={{ marginBottom: "5px", justifyContent: "flex-start" }}
        >
          delete last saved session
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            console.log(sessions[sessions.length - 1]);
            restoreSession(sessions[sessions.length - 1]);
          }}
          startIcon={<RestoreIcon />}
          sx={{ marginBottom: "5px", justifyContent: "flex-start" }}
        >
          restore last saved session
        </Button>

        <Button
          variant="contained"
          onClick={() => saveSession("Session by QuickAcess")}
          startIcon={<AddCircle />}
          sx={{ justifyContent: "flex-start" }}
        >
          save current session
        </Button>
      </Box>
    </Container>
  );
};

export default QuickActions;
