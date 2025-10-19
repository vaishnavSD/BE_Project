import { Platform, Alert } from 'react-native';

// Cross-platform alert function
export const showAlert = (title: string, message?: string, buttons?: Array<{text: string, onPress?: () => void, style?: 'default' | 'cancel' | 'destructive'}>) => {
  if (Platform.OS === 'web') {
    // For web, use native browser alerts
    if (buttons && buttons.length > 1) {
      // For confirmation dialogs
      const confirmed = window.confirm(message || title);
      if (confirmed && buttons.find(b => b.style !== 'cancel')?.onPress) {
        buttons.find(b => b.style !== 'cancel')?.onPress?.();
      } else if (!confirmed && buttons.find(b => b.style === 'cancel')?.onPress) {
        buttons.find(b => b.style === 'cancel')?.onPress?.();
      }
    } else {
      // For simple alerts
      window.alert(message ? `${title}: ${message}` : title);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    // For mobile, use React Native Alert
    Alert.alert(title, message, buttons);
  }
};

// Cross-platform URL parameter handling
export const getURLParams = () => {
  if (Platform.OS === 'web') {
    return new URLSearchParams(window.location.search);
  }
  // For mobile, you might need to use a different approach
  // This is a placeholder - in real apps you'd use expo-linking or similar
  return new URLSearchParams();
};

// Cross-platform URL manipulation
export const replaceURL = (path: string) => {
  if (Platform.OS === 'web') {
    window.history.replaceState({}, document.title, path);
  }
  // For mobile, this might not be needed or handled differently
};

// Cross-platform event listeners
export const addFocusListener = (callback: () => void) => {
  if (Platform.OS === 'web') {
    window.addEventListener('focus', callback);
    return () => window.removeEventListener('focus', callback);
  }
  // For mobile, you might use AppState or navigation focus events
  return () => {};
};

// Cross-platform form validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMobile = (mobile: string): boolean => {
  return mobile.length === 10 && /^\d+$/.test(mobile);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
}

// Safe string conversion for search operations
export const safeString = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value);
}

// Safe search function that handles any data type
export const safeIncludes = (haystack: any, needle: string, caseSensitive: boolean = false): boolean => {
  const haystackStr = safeString(haystack);
  const needleStr = safeString(needle);
  
  if (!caseSensitive) {
    return haystackStr.toLowerCase().includes(needleStr.toLowerCase());
  }
  
  return haystackStr.includes(needleStr);
};