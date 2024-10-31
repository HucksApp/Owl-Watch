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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";
/* global chrome */ // Chrome extension API

/**
 * Watch Component
 *
 * A component for managing "Tab Watch" settings. Allows users to monitor and control browser tab activity
 * based on specified modes such as watching all tabs, specific URLs, or excluding specific URLs.
 * It also provides gap time settings to determine the frequency of checks.
 *
 * @component
 * @example
 * // Usage example:
 * <Watch />
 *
 * @returns {JSX.Element} A form for configuring and toggling tab watch settings.
 *
 * @description
 * This component interacts with Chrome's extension APIs to send and manage watch settings,
 * including gap time (e.g., 10m, 5h, or 2d), specific URLs to watch or exclude, and updates
 * the watch status accordingly. It also displays current settings and offers a button to start or stop watching.
 * The component includes animated transitions using the Framer Motion library.
 */

const Watch = () => {
  const [watchMode, setWatchMode] = useState("all");
  const [gapTime, setGapTime] = useState("5h");
  const [urls, setUrls] = useState("");
  const [excludeUrls, setExcludeUrls] = useState("");
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["watchActive", "watchSettings"], (result) => {
      setIsWatching(result.watchActive || false);
      if (result.watchSettings) {
        const { gapTime, watchMode, urls, excludeUrls } = result.watchSettings;
        setGapTime(gapTime);
        setWatchMode(watchMode);
        setUrls(urls.join("\n "));
        setExcludeUrls(excludeUrls.join("\n "));
      }
    });
  }, []);

  // Handle Watch Settings
  const handleWatchSettings = () => {
    const settings = {
      gapTime,
      watchMode,
      urls:
        watchMode === "urls"
          ? urls.split(/\s+/).map((url) => url.trim()).filter(Boolean)
          : [],
      excludeUrls:
        watchMode === "exclude"
          ? excludeUrls.split(/\s+/).map((url) => url.trim()).filter(Boolean)
          : [],
    };

    chrome.runtime.sendMessage(
      { action: "startWatch", settings },
      (response) => {
        setIsWatching(true);
      }
    );
  };

  const handleStopWatch = () => {
    chrome.runtime.sendMessage({ action: "stopWatch" }, (response) => {
      setIsWatching(false);
      chrome.storage.local.set({ watchActive: false });
    });
  };


  return (
    <Container sx={{marginBottom: "10px", paddingBottom: "30px" }}>
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
      <FormControl component="fieldset" style={{ marginTop: "16px", fontWeight:"bolder" }}>
        <Typography>Watch Mode:</Typography>
        <RadioGroup
          value={watchMode}
          onChange={(e) => setWatchMode(e.target.value)}
        >
          <FormControlLabel
            value="all"
            style={{ fontWeight: "bolder" }}
            control={<Radio />}
            label="Watch All Tabs"
          />
          <FormControlLabel
            value="urls"
            style={{ fontWeight: "bolder" }}
            control={<Radio />}
            label="Watch Specific URLs"
          />
          <FormControlLabel
            value="exclude"
            style={{ fontWeight: "bolder" }}
            control={<Radio />}
            label="Watch All Except Specific URLs"
          />
        </RadioGroup>
      </FormControl>

      {/* Conditional URL Input Fields */}
      {watchMode === "urls" && (
        <TextField
          label="Enter URLs to Watch (space-separated)"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
      )}
      {watchMode === "exclude" && (
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

      {/* Current Settings Display with Animation */}
      {isWatching && (
        <Container
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
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
              <strong>URLs to Watch:</strong> 
              <div style={{ whiteSpace: "pre-line" }}>{urls}</div> 
            </Typography>
          )}
          {watchMode === "exclude" && (
            <Typography variant="body1">
              <strong>URLs to Exclude:</strong> 
              <div style={{ whiteSpace: "pre-line" }}>{excludeUrls}</div>
            </Typography>
          )}
        </Container>
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
