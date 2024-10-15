import React, { useContext, useState, useEffect } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { Container, Typography } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import Floating from "../components/Floating.js";
import Navbar from "../components/Navbar.js";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CssBaseline } from "@mui/material";
import { pageVariants, pageTransition } from "../styles/theme.js";

const Dashboard = ({ toggleTheme, isDarkMode }) => {
  const [showAppBar, setShowAppBar] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();



  const toggleAppBar = () => {
    setShowAppBar((prev) => !prev);
  };

  // const handleWebSocketMessage = (data) => {
  //   console.log("Real-time update:", data);
  //   // Handle real-time updates for tabs
  // };

  //useWebSocket("ws://localhost:5000", handleWebSocketMessage);

  if (!user) {
    return (
      <Typography variant="h6">Please log in to manage your tabs.</Typography>
    );
  }

  return (
    <Container sx={{width:"100%"}}>
      <CssBaseline />
      <Navbar
        handleLogout={logout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        showAppBar={showAppBar}
        toggleAppBar={toggleAppBar}
      />
      <div>
        <Typography variant="h4">Welcome, {user.displayName}</Typography>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // Key ensures that Framer Motion detects route changes
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition} // Optional transition settings
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
        <Floating toggleAppBar={toggleAppBar} showAppBar={showAppBar} />
    </Container>
  );
};

export default Dashboard;
