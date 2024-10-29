import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';

/* global chrome */ // Chrome extension API

const LazyLoader = () => {
  const [lazyMode, setLazyMode] = useState('all'); // Lazy load mode
  const [matchUrls, setMatchUrls] = useState(''); // Matched URLs
  const [excludeUrls, setExcludeUrls] = useState(''); // Excluded URLs
  const [isLazyLoading, setIsLazyLoading] = useState(false); // Lazy loading state

  useEffect(() => {
    chrome.storage.local.get(['owl_lazyload'], (result) => {
      const owlLazyload = result.owl_lazyload || {};
      setIsLazyLoading(owlLazyload.enabled || false);
      if (owlLazyload.settings) {
        const { lazyMode, matchUrls, excludeUrls } = owlLazyload.settings;
        setLazyMode(lazyMode || 'all');
        setMatchUrls(matchUrls?.join('\n') || '');
        setExcludeUrls(excludeUrls?.join('\n') || '');
      }
    });
  }, []);

  const handleLazySettings = () => {
    const settings = {
      lazyMode,
      matchUrls:
        lazyMode === 'urls'
          ? matchUrls.split(/\s+/).map((url) => url.trim()).filter(Boolean)
          : [],
      excludeUrls:
        lazyMode === 'exclude'
          ? excludeUrls.split(/\s+/).map((url) => url.trim()).filter(Boolean)
          : [],
    };

    chrome.storage.local.set({
      owl_lazyload: {
        enabled: true,
        settings,
      },
    });
    setIsLazyLoading(true);
  };

  const handleStopLazyLoading = () => {
    chrome.storage.local.set({ owl_lazyload: { enabled: false } });
    setIsLazyLoading(false);
  };

  return (
    <Container sx={{ marginBottom: '10px', paddingBottom: '30px' }}>
      <Typography variant="h5">Lazy Loading Settings</Typography>

      {/* Lazy Loading Mode Selection */}
      <FormControl component="fieldset" style={{ marginTop: '16px' }}>
        <Typography>Lazy Load Mode:</Typography>
        <RadioGroup
          value={lazyMode}
          onChange={(e) => setLazyMode(e.target.value)}
        >
          <FormControlLabel
            value="all"
            control={<Radio />}
            label="Lazy Load All Tabs"
          />
          <FormControlLabel
            value="urls"
            control={<Radio />}
            label="Lazy Load Specific URLs"
          />
          <FormControlLabel
            value="exclude"
            control={<Radio />}
            label="Lazy Load All Except Specific URLs"
          />
        </RadioGroup>
      </FormControl>

      {/* Conditional Input Fields for URL Input */}
      {lazyMode === 'urls' && (
        <TextField
          label="Enter URLs to Lazy Load (space-separated)"
          value={matchUrls}
          onChange={(e) => setMatchUrls(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
      )}
      {lazyMode === 'exclude' && (
        <TextField
          label="Enter URLs to Exclude (space-separated)"
          value={excludeUrls}
          onChange={(e) => setExcludeUrls(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
      )}

      {/* Current Settings Display */}
      {isLazyLoading && (
        <Container
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: 'rgba(241, 241, 241, 0.7)',
            overflow: 'scroll',
          }}
        >
          <Typography variant="h6">Current Lazy Load Settings</Typography>
          <Typography variant="body1">
            <strong>Lazy Load Mode:</strong> {lazyMode}
          </Typography>
          {lazyMode === 'urls' && (
            <Typography variant="body1">
              <strong>URLs to Lazy Load:</strong>
              <div style={{ whiteSpace: 'pre-line' }}>{matchUrls}</div>
            </Typography>
          )}
          {lazyMode === 'exclude' && (
            <Typography variant="body1">
              <strong>URLs to Exclude:</strong>
              <div style={{ whiteSpace: 'pre-line' }}>{excludeUrls}</div>
            </Typography>
          )}
        </Container>
      )}

      {/* Lazy Loading Button */}
      <motion.div whileHover={{ scale: 1.05 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={isLazyLoading ? handleStopLazyLoading : handleLazySettings}
          startIcon={
            isLazyLoading ? <HourglassEmptyIcon /> : <HourglassDisabledIcon />
          }
          style={{ marginTop: '16px' }}
        >
          {isLazyLoading ? 'Stop Lazy Loading' : 'Start Lazy Loading'}
        </Button>
      </motion.div>
    </Container>
  );
};

export default LazyLoader;
