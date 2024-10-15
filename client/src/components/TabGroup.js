import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from '../services/api';

const TabManager = () => {
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const fetchTabs = async () => {
      const response = await axios.get('/api/session');
      setTabs(response.data.tabs);
    };
    fetchTabs();
  }, []);

  const closeTab = async (tabId) => {
    await axios.delete(`/api/session/${tabId}`);
    setTabs(tabs.filter(tab => tab.id !== tabId));
  };

  return (
    <Container>
      <Typography variant="h5">Manage Tabs</Typography>
      <List>
        {tabs.map(tab => (
          <ListItem key={tab.id}>
            <ListItemText primary={tab.title} secondary={tab.url} />
            <Button color="secondary" onClick={() => closeTab(tab.id)}>Close</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default TabManager;
