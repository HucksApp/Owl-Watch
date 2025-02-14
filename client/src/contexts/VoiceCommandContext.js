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
    closeNonActiveTabs,
    closeAllTabs,
    closeTabByMatch,
    saveSession,
    restoreSession,
    deleteSession,
    sessions,
  } = useCommandStructure();

  useEffect(() => {
    // Initialize the recognition instance once on mount
    if ("webkitSpeechRecognition" in window) {
      const newRecognition = new window.webkitSpeechRecognition();
      newRecognition.lang = "en-US";
      newRecognition.continuous = true;
      newRecognition.interimResults = false;
      setRecognition(newRecognition);
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  const handleResult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript
      .trim()
      .toLowerCase();
    if (event.results[event.resultIndex].isFinal) {
      // Execute commands based on recognized speech
      if (transcript.includes("close non-active tabs")) {
        closeNonActiveTabs();
      } else if (transcript.includes("close all tabs")) {
        closeAllTabs();
      } else if (transcript.startsWith("close ")) {
        const match = transcript.replace("close ", "").trim();
        closeTabByMatch(match);
      } else if (transcript.includes("save session")) {
        const commandParts = transcript.split(" ");
        const sessionName =
          commandParts.length > 2
            ? commandParts.slice(2).join(" ")
            : `vm ${Date.now()}`;
        saveSession(sessionName);
      } else if (transcript.includes("restore session")) {
        const sessionToRestore = sessions[sessions.length - 1];
        restoreSession(sessionToRestore);
      } else if (transcript.includes("delete session")) {
        const sessionToDelete = sessions[sessions.length - 1];
        deleteSession(sessionToDelete._id);
      }
    }
  };

  const handleError = (event) => {
    console.error("Speech recognition error:", event.error);
    setListening(false);
    recognition?.stop();
  };

  const startListening = async () => {
    if (listening || !recognition) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop the stream after permission is granted
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = () => {
        if (listening) recognition.start(); // Restart if still listening
      };

      recognition.start(); // Start recognition
      setListening(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Microphone access is required to use voice commands.");
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null; // Detach all listeners
      recognition.stop(); // Stop recognition
    }
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
