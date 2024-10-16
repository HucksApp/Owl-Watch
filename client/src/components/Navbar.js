import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
  Slide,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContrastIcon from "@mui/icons-material/Contrast";
import CookieIcon from "@mui/icons-material/Cookie";
import TabIcon from "@mui/icons-material/Tab";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { useNavigate } from "react-router-dom";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import VoiceCommand from "./VoiceCommand";
import { motion } from "framer-motion";
import logoImage from "../assets/logo.png";
import "../styles/Nav.css";

/**
 * Navbar Component
 * A responsive navigation bar that provides quick access to various dashboard features,
 * including monitoring, session management, quick actions, and theming.
 * It also allows the user to toggle between dark and light themes and logout.
 *
 * @component
 * @example
 * // Usage example:
 * <Navbar
 *   handleLogout={handleLogout}
 *   isDarkMode={true}
 *   toggleTheme={toggleTheme}
 *   showAppBar={true}
 *   toggleAppBar={toggleAppBar}
 * />
 *
 * @param {Object} props - The component props
 * @param {function} props.handleLogout - Function to log the user out when the logout icon is clicked
 * @param {boolean} props.isDarkMode - A boolean indicating if the dark mode theme is active
 * @param {function} props.toggleTheme - Function to toggle between dark mode and light mode
 * @param {boolean} props.showAppBar - Boolean indicating whether the AppBar is visible
 * @param {function} props.toggleAppBar - Function to toggle the AppBar's visibility
 *
 * @returns {JSX.Element} A responsive navigation bar with various action icons
 */

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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
                  <CancelIcon sx={{ fontWeight: "1000", color: "#c43232" }} />
                </IconButton>
              </Tooltip>
            </div>
            <div className="midtool">
              <Tooltip title="Watcher" sx={{ marginRight: 1, marginLeft: 1 }}>
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
              <VoiceCommand />
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
