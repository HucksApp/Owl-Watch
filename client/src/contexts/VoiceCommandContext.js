// src/contexts/VoiceCommandContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useCommandStructure } from "./CommandStructureContext";

/**
 * VoiceCommandProvider Component
 *
 * A context provider for managing voice command functionalities within a Chrome extension.
 * This component utilizes the Web Speech API to recognize speech and execute commands
 * related to browser tab and session management.
 *
 * @component
 * @example
 * // Usage example:
 * import { VoiceCommandProvider } from './contexts/VoiceCommandContext';
 *
 * const App = () => (
 *   <VoiceCommandProvider>
 *     <YourComponent />
 *   </VoiceCommandProvider>
 * );
 *
 * @returns {JSX.Element} A context provider for managing voice commands.
 *
 * @description
 * The VoiceCommandProvider component utilizes React's Context API to provide functionalities
 * for voice command recognition to its children components. It listens for specific voice
 * commands and performs actions such as closing tabs, saving sessions, restoring sessions,
 * and deleting sessions based on user input.
 *
 * ## Key Features:
 * - Listens for voice commands and executes associated actions using the Chrome extension APIs.
 * - Supports continuous voice recognition for an enhanced user experience.
 * - Handles microphone access permissions and errors gracefully.
 *
 * ### State:
 * - `listening`: A boolean indicating whether the voice command recognition is active.
 * - `recognition`: An instance of `webkitSpeechRecognition` used for speech recognition.
 *
 * ### Methods:
 * - `startListening()`: Initiates the voice command recognition process.
 * - `stopListening()`: Stops the voice command recognition.
 *
 * ### Commands Supported:
 * - **"close non-active tabs"**: Closes all tabs that are not currently active.
 * - **"close all tabs"**: Closes all open tabs.
 * - **"close [tab title or URL]"**: Closes a specific tab by matching the title or URL.
 * - **"save session [session name]"**: Saves the current tabs into a session with the provided name. Defaults to "session by VoiceCommand" if no name is specified.
 * - **"restore session"**: Restores the last saved session.
 * - **"delete session"**: Deletes the last saved session.
 */

const VoiceCommandContext = createContext();

export const VoiceCommandProvider = ({ children }) => {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const {
    closeTab,
    closeNonActiveTabs,
    closeAllTabs,
    closeTabByMatch,
    saveSession,
    restoreSession,
    deleteSession,
    sessions,
  } = useCommandStructure();

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const newRecognition = new window.webkitSpeechRecognition();
      newRecognition.lang = "en-US";
      newRecognition.continuous = true;
      newRecognition.interimResults = false;

      newRecognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log("Voice Command Received:", command);

        // Execute commands based on recognized speech
        if (command.includes("close non-active tabs")) {
          closeNonActiveTabs();
        } else if (command.includes("close all tabs")) {
          closeAllTabs();
        } else if (command.startsWith("close ")) {
          const match = command.replace("close ", "").trim();
          closeTabByMatch(match);
        } else if (command.includes("save session")) {
          const commandParts = command.split(" ");
          if (commandParts.length > 2) {
            const sessionName = commandParts.slice(2).join(" ");
            saveSession(sessionName);
          } else saveSession("session by VoiceCommand");
        } else if (command.includes("restore session")) {
          const sessionToRestore = sessions[sessions.length - 1];
          restoreSession(sessionToRestore);
        } else if (command.includes("delete session")) {
          const sessionToDelete = sessions[sessions.length - 1];
          deleteSession(sessionToDelete._id);
        }
      };

      newRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };

      newRecognition.onend = () => {
        if (listening) {
          startRecognition(newRecognition);
        }
      };

      setRecognition(newRecognition);
    } else {
      console.warn("webkitSpeechRecognition is not supported in this browser.");
    }
  }, [
    closeNonActiveTabs,
    closeAllTabs,
    closeTabByMatch,
    saveSession,
    restoreSession,
    deleteSession,
  ]);

  const startRecognition = (newRecognition) => {
    try {
      newRecognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setListening(false);
    }
  };

  useEffect(() => {
    if (recognition) {
      if (listening) {
        console.log("Recognition is starting...");
        startRecognition(recognition); // Start only when listening is true
      } else {
        console.log("Recognition stopped.");
        recognition.stop();
      }
    }
  }, [listening, recognition]);

  const startListening = async () => {
    if (listening) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setListening(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Microphone access is required to use voice commands.");
    }
  };

  const stopListening = () => {
    setListening(false);
  };

  return (
    <VoiceCommandContext.Provider
      value={{ listening, startListening, stopListening }}
    >
      {children}
    </VoiceCommandContext.Provider>
  );
};

export const useVoiceCommand = () => {
  return useContext(VoiceCommandContext);
};
