import React, { Fragment, useEffect } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Box,
  Container,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useCommandStructure } from "../contexts/CommandStructureContext";
import { format } from "date-fns";
/* global chrome */ // Chrome extension API

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
  const { tabs, closeNonActiveTabs, closeAllTabs, closeTab } =
    useCommandStructure();

  useEffect(() => {}, [tabs]);

  return (
    <Container>
      <Typography variant="h4">Tab Manager</Typography>
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
          Non-Active Tabs
        </Button>

        <Button
          variant="contained"
          onClick={closeAllTabs}
          startIcon={<CancelIcon />}
          sx={{ justifyContent: "flex-start" }}
        >
          All Tabs
        </Button>
      </Box>
      <List>
        {tabs.map((tab) => (
          <Fragment key={tab.id}>
            <ListItem
              style={{
                backgroundColor: tab.isActive
                  ? "rgba(26,104,26, 0.7)"
                  : "rgba(196,50,50,0.7)",
              }}
            >
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
        ))}
      </List>
    </Container>
  );
};

export default TabManager;
