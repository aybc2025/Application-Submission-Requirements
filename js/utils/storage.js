/* ============================================
   STORAGE.JS - localStorage Wrapper
   CD-1 Rezoning Application Checker
   ============================================ */

export class StorageManager {
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  static has(key) {
    return localStorage.getItem(key) !== null;
  }

  static getSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // Return size in KB
  }

  static getAllKeys() {
    return Object.keys(localStorage);
  }

  static exportAll() {
    const data = {};
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        data[key] = localStorage[key];
      }
    }
    return data;
  }

  static importAll(data) {
    try {
      for (let key in data) {
        localStorage.setItem(key, data[key]);
      }
      return true;
    } catch (error) {
      console.error('Error importing to localStorage:', error);
      return false;
    }
  }
}
