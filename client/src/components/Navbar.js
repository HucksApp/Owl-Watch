// components/Navbar.js or your desired component
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
  Slide,
} from "@mui/material";

import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContrastIcon from "@mui/icons-material/Contrast";
//import SettingsIcon from "@mui/icons-material/Settings";
import CookieIcon from "@mui/icons-material/Cookie";
import TabIcon from '@mui/icons-material/Tab';
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { useNavigate /*, createSearchParams*/ } from "react-router-dom";
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import VoiceCommand from "./VoiceCommand";
import { motion } from "framer-motion";

import logoImage from "../assets/logo.png";
import "../styles/Nav.css";


const Navbar = ({
  handleLogout,
  isDarkMode,
  toggleTheme,
  showAppBar,
  toggleAppBar,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }} // Starting state
      animate={{ opacity: 1, y: 0 }} // End state
      transition={{ duration: 0.5 }} // Animation duration
    >
      <Slide direction="left" in={showAppBar} mountOnEnter unmountOnExit>
        <AppBar position="relative">
          <Toolbar sx={{ flexWrap: "wrap" }}>
            <div className="nav_band">
            <div className="logo">
              <img
                src={logoImage}
                alt="Logo"
                style={{ height: "40px", marginRight: "10px" }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontFamily: "Updock",
                  fontSize: "20px",
                  fontWeight: "1000",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                Owl Watch
              </Typography>
            </div>
            <Tooltip
                title="Close ToolBar"
                sx={{ marginRight: 1, marginLeft: 1 }}
              >
                <IconButton color="inherit" onClick={toggleAppBar}>
                  <CancelIcon sx={{ fontWeight: "1000", color:"#c43232" }} />
                </IconButton>
              </Tooltip>
              
            </div>
            <div className="midtool">

            <Tooltip
                title="Watcher"
                sx={{ marginRight: 1, marginLeft: 1 }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/dashboard/watcher")}
                >
                  <MonitorHeartIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>

              <Tooltip
                title="Session Manager"
                sx={{ marginRight: 1, marginLeft: 1 }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/dashboard/save")}
                >
                  <CookieIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>

              <Tooltip
                title="Tab Manager"
                sx={{ marginRight: 1, marginLeft: 1 }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/dashboard/tabs")}
                >
                  <TabIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>

              <Tooltip
                title="Quick Actions"
                sx={{ marginRight: 1, marginLeft: 1 }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/dashboard/quick_actions")}
                >
                  <LowPriorityIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>

              <Tooltip
                title="Tab Suggestions"
                sx={{ marginRight: 1, marginLeft: 1 }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/dashboard/AI_suggest")}
                >
                  <PsychologyIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>
              <VoiceCommand/>
              {/*<Tooltip
                title="Voice Command"
                sx={{ marginRight: 1, marginLeft: 1 }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/dashboard/voice_command")}
                >
                  <KeyboardVoiceIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Settings" sx={{ marginRight: 1, marginLeft: 1 }}>
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/dashboard/settings")}
                >
                  <SettingsIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>*/}

              <Tooltip title="Theme" sx={{ marginRight: 1, marginLeft: 1 }}>
                <IconButton color="inherit" onClick={toggleTheme}>
                  {isDarkMode ? (
                    <ContrastIcon sx={{ fontWeight: "1000" }} />
                  ) : (
                    <DarkModeIcon sx={{ fontWeight: "1000" }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Logout" sx={{ marginRight: 1, marginLeft: 1 }}>
                <IconButton color="inherit" onClick={handleLogout}>
                  <LogoutIcon sx={{ fontWeight: "1000" }} />
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
        </AppBar>
      </Slide>
    </motion.div>
  );
};

export default Navbar;
