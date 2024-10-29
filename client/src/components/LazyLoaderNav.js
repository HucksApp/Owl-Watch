import React, { useState, useEffect } from 'react';
import { IconButton,  Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";

// Icons
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';


/* global chrome */ // Chrome extension API

const LazyLoaderNav = () => {
  const [iconIndex, setIconIndex] = useState(0);
  const [lazyloaderisEnabled, setLazyloaderisEnabled] = useState(false);
  const navigate = useNavigate();

  


  const getLazyloaderState = () => {
    chrome.storage.local.get('owl_lazyload', (result) => {
        const lazyLoadSettings = result.owl_lazyload;
        if (lazyLoadSettings.enabled) {
        setLazyloaderisEnabled(true); // Set lazyloader to true if the value is found
      } else {
        setLazyloaderisEnabled(false); // Set lazyloader to false otherwise
      }
    });
  };

  
  useEffect(() => {
    getLazyloaderState();

    // Optionally, you could poll for changes to owl_lazyload
    const interval = setInterval(() => {
      getLazyloaderState();
    }, 1000); // Polling every second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);


  

  // Loop through the icons when lazyloader is true
  useEffect(() => {
    let interval;
    if (lazyloaderisEnabled) {
      interval = setInterval(() => {
        setIconIndex((prevIndex) => (prevIndex + 1) % 5); // 5 icons to loop over
      }, 500); // Adjust time for smoother/faster animation
    } else {
      setIconIndex(0); // Reset to initial icon when lazyloader is false
    }

    return () => clearInterval(interval);
  }, [lazyloaderisEnabled]);

  // Array of icons to animate through
  const hourglassIcons = [
    <HourglassTopIcon sx={{ color: "#7209b7", fontWeight: "1000" }}  key="top" />,
    <HourglassFullIcon sx={{ color: "#7209b7", fontWeight: "1000" }}  key="full" />,
    <HourglassEmptyIcon sx={{ color: "#7209b7", fontWeight: "1000" }}  key="empty" />,
    <HourglassBottomIcon sx={{ color: "#7209b7", fontWeight: "1000" }}  key="bottom" />,
    <HourglassFullIcon sx={{ color: "#7209b7", fontWeight: "1000" }}  key="full2" />,
  ];

  return (
    <Tooltip title={lazyloaderisEnabled ? "Lazy Loading On" : "Lazy Loading Off"} sx={{ marginRight: 1, marginLeft: 1 }}>
    <IconButton
    color="inherit"
    onClick={() => navigate("/dashboard/lazyloader")}
    >
      {lazyloaderisEnabled  ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, loop: Infinity }}
        >
          {hourglassIcons[iconIndex]}
        </motion.div>
      ) : (
        <HourglassDisabledIcon sx={{ fontWeight: "1000" }} /> // Static icon when lazyloader is false
      )}
    </IconButton>
    </Tooltip>
  );
};

export default LazyLoaderNav;
