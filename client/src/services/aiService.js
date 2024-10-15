// src/services/aiService.js
import api from './api';

// Function to get tab suggestions
export const getTabSuggestions = async (tabData) => {
    try {
        const response = await api.post('/api/suggestions', { tabData });
        return response.data; // Assuming the response contains suggestions
    } catch (error) {
        console.error('Error fetching tab suggestions:', error);
        throw error;
    }
};
