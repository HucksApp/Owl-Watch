/* global chrome */ 

// Expiration duration in milliseconds (2 days)
const EXPIRATION_DURATION = 2 * 24 * 60 * 60 * 1000;

// Save data to local storage with expiration
export const saveToLocalStorage = (key, value) => {
    const data = {
        value,
        expiry: Date.now() + EXPIRATION_DURATION, // Set expiration time
    };
    // Use chrome.storage.local to save the data
    chrome.storage.local.set({ [key]: data }, () => {
        console.log(`Data saved for key: ${key}`);
    });
};

// Retrieve data from local storage with expiration check
export const getFromLocalStorage = (key) => {
    return new Promise((resolve) => {
        // Use chrome.storage.local to get the data
        chrome.storage.local.get([key], (result) => {
            const data = result[key];
            if (data) {
                const { value, expiry } = data;
                // Check if the current time is past the expiration time
                if (Date.now() > expiry) {
                    removeFromLocalStorage(key); // Remove expired data
                    resolve(null); // Return null for expired data
                } else {
                    resolve(value); // Return the valid value
                }
            } else {
                resolve(null); // Return null if data doesn't exist
            }
        });
    });
};

// Remove data from local storage
export const removeFromLocalStorage = (key) => {
    chrome.storage.local.remove([key], () => {
        console.log(`Data removed for key: ${key}`);
    });
};

// Clear all local storage
export const clearLocalStorage = () => {
    chrome.storage.local.clear(() => {
        console.log('All data cleared from local storage.');
    });
};