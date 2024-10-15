// /components/QuickActions.js
import React from 'react';
import {
    Button,
    Box,
    Container,
    Typography
  } from "@mui/material";
  import { useCommandStructure } from '../contexts/CommandStructureContext';
  import {
    Delete as DeleteIcon,
    Restore as RestoreIcon,
    AddCircle, 
    Cancel as CancelIcon
  } from "@mui/icons-material";


const QuickActions = () => {
    const { sessions, saveSession, deleteSession, restoreSession, closeNonActiveTabs, closeAllTabs} = useCommandStructure();
    return (
        <Container>
         <Typography variant="h5">Quick Actions</Typography>
        <Box display="flex" alignItems="space-around" flexDirection="column" justifyContent="flex-start" mt={2}>
          
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
          sx={{marginBottom: "5px", justifyContent: "flex-start" }}
        >
         Close All Tabs
        </Button>
       
        <Button
          variant="contained"
          onClick={()=> deleteSession(sessions[sessions.length - 1]._id)}
          startIcon={<DeleteIcon />}
          sx={{ marginBottom: "5px", justifyContent: "flex-start" }}
        >
         delete last saved session
        </Button>

        <Button
          variant="contained"
          onClick={()=> restoreSession(sessions[sessions.length - 1])}
          startIcon={<RestoreIcon />}
          sx={{ marginBottom: "5px", justifyContent: "flex-start" }}
        >
        restore last saved session
        </Button>

        <Button
          variant="contained"
          onClick={()=> saveSession("Session by QuickAcess")}
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
