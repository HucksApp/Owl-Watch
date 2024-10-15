import React from "react";
import { useVoiceCommand } from "../contexts/VoiceCommandContext";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import {
    Tooltip,
    IconButton,
  } from "@mui/material";
const VoiceCommand = () => {
  const { listening, startListening, stopListening } = useVoiceCommand();

  const handleButtonClick = () => {
    console.log("Button clicked");
    if (listening) stopListening();
    else startListening(); // Ensure this is tied to a user action
  };

  return (
      <Tooltip title={listening?"Voice Command ON" : " Voice Command OFF"} sx={{ marginRight: 1, marginLeft: 1 }}>
        <IconButton
          color="inherit"
          onClick={handleButtonClick}
        >
         {listening ? <MicIcon sx={{color:"#7209b7", fontWeight: "1000"}} /> :  <MicOffIcon sx={{ fontWeight: "1000" }} />  }
        </IconButton>
      </Tooltip>
  );
};

export default VoiceCommand;
