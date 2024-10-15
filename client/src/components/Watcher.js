// src/components/Watch.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  CssBaseline,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";

/* global chrome */ // Required for Chrome extension API

const Watch = () => {
  const [watchMode, setWatchMode] = useState("all"); // "all", "urls", "exclude"
  const [gapTime, setGapTime] = useState("5h"); // Default gap time (5 hours)
  const [urls, setUrls] = useState(""); // To store comma-separated URLs
  const [excludeUrls, setExcludeUrls] = useState(""); // To store exclude comma-separated URLs
  const [isWatching, setIsWatching] = useState(false); // Track watch state

  // Effect to check the watch state and load saved settings on component mount
  useEffect(() => {
    chrome.storage.local.get(["watchActive", "watchSettings"], (result) => {
      setIsWatching(result.watchActive || false);
      if (result.watchSettings) {
        const { gapTime, watchMode, urls, excludeUrls } = result.watchSettings;
        setGapTime(gapTime);
        setWatchMode(watchMode);
        setUrls(urls.join(", ")); // Convert array back to comma-separated string
        setExcludeUrls(excludeUrls.join(", ")); // Convert array back to comma-separated string
      }
    });
  }, []);

  // Handle Watch Settings
  const handleWatchSettings = () => {
    const settings = {
      gapTime,
      watchMode,
      urls:
        watchMode === "urls" ? urls.split(",").map((url) => url.trim()) : [],
      excludeUrls:
        watchMode === "exclude"
          ? excludeUrls.split(",").map((url) => url.trim())
          : [],
    };

    // Send the watch settings to background.js
    chrome.runtime.sendMessage(
      { action: "startWatch", settings },
      (response) => {
        console.log(response.status); // Log status returned from background.js
        setIsWatching(true); // Update state to watching
      }
    );
  };

  // Handle Stop Watching
  const handleStopWatch = () => {
    chrome.runtime.sendMessage({ action: "stopWatch" }, (response) => {
      console.log(response.status); // Log status returned from background.js
      setIsWatching(false); // Update state to not watching
      chrome.storage.local.set({ watchActive: false });
    });
  };

  // Animation properties
  const animationProps = {
    initial: { opacity: 0, translateY: -20 },
    animate: { opacity: 1, translateY: 0 },
    exit: { opacity: 0, translateY: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <Container>
      <Typography variant="h5">Tab Watch Settings</Typography>

      {/* Gap Time Input */}
      <TextField
        label="Gap Time (e.g., 10m, 5h or 2d)"
        value={gapTime}
        onChange={(e) => setGapTime(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Watch Mode Selection */}
      <FormControl component="fieldset" style={{ marginTop: "16px" }}>
        <Typography>Watch Mode:</Typography>
        <RadioGroup
          value={watchMode}
          onChange={(e) => setWatchMode(e.target.value)}
        >
          <FormControlLabel
            value="all"
            control={<Radio />}
            label="Watch All Tabs"
          />
          <FormControlLabel
            value="urls"
            control={<Radio />}
            label="Watch Specific URLs"
          />
          <FormControlLabel
            value="exclude"
            control={<Radio />}
            label="Watch All Except Specific URLs"
          />
        </RadioGroup>
      </FormControl>

      {/* Conditional URL Input Fields */}
      {watchMode === "urls" && (
        <TextField
          label="Enter URLs to Watch (comma-separated)"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          fullWidth
          margin="normal"
        />
      )}
      {watchMode === "exclude" && (
        <TextField
          label="Enter URLs to Exclude (comma-separated)"
          value={excludeUrls}
          onChange={(e) => setExcludeUrls(e.target.value)}
          fullWidth
          margin="normal"
        />
      )}

      {/* Current Settings Display with Animation */}
      {isWatching && (
        <>
            <motion.div
              key="watch-settings"
              {...animationProps} // Spread animation properties
            >
              <Container
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "rgba(241, 241, 241, 0.7)",
                  overflow: "scroll",
                }}
              >
                <Typography variant="h6">Current Settings</Typography>
                <Typography variant="body1">
                  <strong>Watch Mode:</strong> {watchMode}
                </Typography>
                <Typography variant="body1">
                  <strong>Gap Time:</strong> {gapTime}
                </Typography>
                {watchMode === "urls" && (
                  <Typography variant="body1">
                    <strong>URLs to Watch:</strong> {urls}
                  </Typography>
                )}
                {watchMode === "exclude" && (
                  <Typography variant="body1">
                    <strong>URLs to Exclude:</strong> {excludeUrls}
                  </Typography>
                )}
              </Container>
            </motion.div>
        </>
      )}

      {/* Watch Button */}
      <motion.div whileHover={{ scale: 1.05 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={isWatching ? handleStopWatch : handleWatchSettings}
          startIcon={isWatching ? <VisibilityIcon /> : <VisibilityOffIcon />}
          style={{ marginTop: "16px" }}
        >
          {isWatching ? "Stop Watching" : "Start Watching"}
        </Button>
      </motion.div>
    </Container>
  );
};

export default Watch;
