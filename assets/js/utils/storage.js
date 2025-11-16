/**
 * LocalStorage Utilities
 * Safe wrapper for browser storage with error handling
 */

const STORAGE_PREFIX = 'birthday_';

/**
 * Check if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key (prefix added automatically)
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export function saveToStorage(key, value) {
  if (!isStorageAvailable()) {
    console.warn('localStorage not available');
    return false;
  }
  
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    localStorage.setItem(prefixedKey, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Failed to save to storage:', e);
    return false;
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Fallback value if key doesn't exist
 * @returns {*} Stored value or default
 */
export function loadFromStorage(key, defaultValue = null) {
  if (!isStorageAvailable()) {
    return defaultValue;
  }
  
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    const item = localStorage.getItem(prefixedKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Failed to load from storage:', e);
    return defaultValue;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export function removeFromStorage(key) {
  if (!isStorageAvailable()) return;
  
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    localStorage.removeItem(prefixedKey);
  } catch (e) {
    console.error('Failed to remove from storage:', e);
  }
}

/**
 * Clear all birthday website data
 */
export function clearAllStorage() {
  if (!isStorageAvailable()) return;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
}

/**
 * Save user preferences
 */
export function savePreferences(prefs) {
  return saveToStorage('preferences', prefs);
}

/**
 * Load user preferences
 */
export function loadPreferences() {
  return loadFromStorage('preferences', {
    hasVisitedSplash: false,
    preferredCharacter: null,
    chatHistory: {},
    viewedMessages: [],
    viewedPuns: []
  });
}
