/* global chrome */

/**
 * Expiration duration in milliseconds (2 days)
 * @constant {number}
 */
const EXPIRATION_DURATION = 2 * 24 * 60 * 60 * 1000;

/**
 * Save data to Chrome's local storage with an expiration time.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {*} value - The value to be stored. Can be of any type.
 * @returns {void}
 */

export const saveToLocalStorage = (key, value) => {
  const data = {
    value,
    expiry: Date.now() + EXPIRATION_DURATION,
  };
  chrome.storage.local.set({ [key]: data }, () => {
    console.log(`Data saved for key: ${key}`);
  });
};
/**
 * Retrieve data from Chrome's local storage with an expiration check.
 *
 * If the data has expired, it will be removed from storage and null will be returned.
 *
 * @param {string} key - The key of the data to retrieve.
 * @returns {Promise<*>} A promise that resolves to the stored value or null if not found or expired.
 */

export const getFromLocalStorage = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      const data = result[key];
      if (data) {
        const { value, expiry } = data;
        if (Date.now() > expiry) {
          removeFromLocalStorage(key);
          resolve(null);
        } else {
          resolve(value);
        }
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Remove data from Chrome's local storage.
 *
 * @param {string} key - The key of the data to be removed.
 * @returns {void}
 */

export const removeFromLocalStorage = (key) => {
  chrome.storage.local.remove([key], () => {
    console.log(`Data removed for key: ${key}`);
  });
};

/**
 * Clear all data from Chrome's local storage.
 *
 * @returns {void}
 */
export const clearLocalStorage = () => {
  chrome.storage.local.clear(() => {
    console.log("All data cleared from local storage.");
  });
};
