const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reset cache to fix InternalBytecode.js issues
config.resetCache = true;

// Add resolver configuration for better module resolution
config.resolver = {
  ...config.resolver,
  alias: {
    '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage',
  },
};

module.exports = config;