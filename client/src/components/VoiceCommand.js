import React from "react";
import { useVoiceCommand } from "../contexts/VoiceCommandContext";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { Tooltip, IconButton } from "@mui/material";

/**
 * VoiceCommand Component
 *
 * A component that allows users to toggle a voice command feature on and off.
 * The microphone icon changes based on whether the voice command is actively listening.
 *
 * @component
 * @example
 * // Usage example:
 * <VoiceCommand />
 *
 * @returns {JSX.Element} A toggleable microphone button to enable or disable voice commands.
 *
 * @description
 * This component utilizes the `useVoiceCommand` context to manage the state of the voice command feature.
 * When the voice command is active, the button displays a microphone icon (`MicIcon`), otherwise it displays
 * a muted microphone icon (`MicOffIcon`). Clicking the button toggles the listening state.
 */

const VoiceCommand = () => {
  const { listening, startListening, stopListening } = useVoiceCommand();

  const handleButtonClick = () => {
    if (listening) stopListening();
    else startListening();
  };

  return (
    <Tooltip
      title={listening ? "Voice Command ON" : " Voice Command OFF"}
      sx={{ marginRight: 1, marginLeft: 1 }}
    >
      <IconButton color="inherit" onClick={handleButtonClick}>
        {listening ? (
          <MicIcon sx={{ color: "#7209b7", fontWeight: "1000" }} />
        ) : (
          <MicOffIcon sx={{ fontWeight: "1000" }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default VoiceCommand;
