// src/components/TabSuggestions.js
import React, { useState } from "react";
import { getTabSuggestions } from "../services/aiService.js"; // Import the AI service

/**
 * TabSuggestions Component
 *
 * A component that uses AI to provide suggestions for managing browser tabs based on various factors
 * such as time spent, CPU usage, and memory usage. The AI service fetches recommendations,
 * which are then displayed to the user.
 *
 * @component
 * @example
 * // Usage example:
 * <TabSuggestions />
 *
 * @returns {JSX.Element} A list of AI-powered suggestions for managing browser tabs.
 */

const TabSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async () => {
    const tabData = [
      { timeSpent: 120, cpuUsage: 10, memoryUsage: 50, tabType: "work" },
      { timeSpent: 10, cpuUsage: 5, memoryUsage: 100, tabType: "social" },
      // data stimulation <component imcomplete>
    ];

    try {
      const response = await getTabSuggestions(tabData);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  return (
    <div>
      <h3>AI-Powered Tab Suggestions</h3>
      <button onClick={fetchSuggestions}>Get Suggestions</button>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>
            Suggestion: {suggestion.action} tab {suggestion.tabId} (
            {suggestion.reason})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabSuggestions;
