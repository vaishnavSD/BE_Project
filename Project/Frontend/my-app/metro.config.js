const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reset cache to fix InternalBytecode.js issues
config.resetCache = true;

module.exports = config;