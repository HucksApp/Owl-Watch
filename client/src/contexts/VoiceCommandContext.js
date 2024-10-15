// src/contexts/VoiceCommandContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCommandStructure } from './CommandStructureContext';

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
        if ('webkitSpeechRecognition' in window) {
            const newRecognition = new window.webkitSpeechRecognition();
            newRecognition.lang = 'en-US';
            newRecognition.continuous = true;
            newRecognition.interimResults = false;

            newRecognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                console.log('Voice Command Received:', command);

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
                    }else
                    saveSession("session by VoiceCommand");
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
    }, [closeNonActiveTabs, closeAllTabs, closeTabByMatch, saveSession, restoreSession, deleteSession]);

    const startRecognition = (newRecognition) => {
        try {
            newRecognition.start();
        } catch (error) {
            console.error("Error starting recognition:", error);
            setListening(false);
        }
    };

    useEffect(() => {
        if (recognition && listening) {
            startRecognition(recognition);
        } else if (recognition) {
            recognition.stop();
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
        <VoiceCommandContext.Provider value={{ listening, startListening, stopListening }}>
            {children}
        </VoiceCommandContext.Provider>
    );
};

export const useVoiceCommand = () => {
    return useContext(VoiceCommandContext);
};
