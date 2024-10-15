// src/components/Settings.js
import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Checkbox, FormControlLabel } from '@mui/material';

const Settings = () => {
  const [whitelist, setWhitelist] = useState('');
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [cleanupThreshold, setCleanupThreshold] = useState(7); // Default to 7 days

  const handleSaveSettings = () => {
    // Save whitelist and cleanup settings to the backend or localStorage
    const settings = {
      whitelist: whitelist.split(',').map(url => url.trim()), // Split and trim URLs
      autoCleanup,
      cleanupThreshold,
    };
    console.log('Settings saved:', settings); // For demonstration
    // Here you can send `settings` to your backend
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      <TextField 
        label="Whitelist URLs (comma-separated)" 
        value={whitelist}
        onChange={(e) => setWhitelist(e.target.value)}
        fullWidth
        margin="normal"
      />
      
      <FormControlLabel
        control={
          <Checkbox 
            checked={autoCleanup} 
            onChange={() => setAutoCleanup(!autoCleanup)} 
          />
        }
        label="Enable Auto Cleanup"
      />

      <div>
        <label>Cleanup Threshold (days): </label>
        <TextField 
          type="number" 
          value={cleanupThreshold} 
          onChange={(e) => setCleanupThreshold(e.target.value)} 
          margin="normal"
        />
      </div>

      <Button onClick={handleSaveSettings} variant="contained" color="primary" style={{ marginTop: '16px' }}>
        Save Settings
      </Button>
    </Container>
  );
};

export default Settings;
