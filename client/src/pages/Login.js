import React, { useContext, useEffect } from "react";
import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContrastIcon from "@mui/icons-material/Contrast";
import GoogleIcon from '@mui/icons-material/Google';
import "../styles/login.css";

const Login = ({ toggleTheme, isDarkMode }) => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(()=>{
    if(user){
      navigate('/dashboard/watcher')
    }
  },[user])

  return (
    <Container sx={{width:"100%"}}>
      <Typography variant="h4" gutterBottom>
        Login to Owl Watch
      </Typography>
      <Button
          variant="contained"
          onClick={toggleTheme}
          startIcon={isDarkMode ? (
            <ContrastIcon sx={{ fontWeight: "1000" }} />
          ) : (
            <DarkModeIcon sx={{ fontWeight: "1000" }} />
          )}
          sx={{ marginBottom: "5px"}}
        >
         Switch to {isDarkMode ? "Light" : "Dark"} Mode
        </Button>

      <Button 
      variant="contained"
       onClick={login}
       startIcon={<GoogleIcon />}
       >
        Login with Google
      </Button>
    </Container>
  );
};

export default Login;
