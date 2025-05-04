// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add any customizations here if needed
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs'
];

// Enhance server configuration for better stability
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Increase timeout for slow connections
      req.setTimeout(30000);
      return middleware(req, res, next);
    };
  },
};

// Optimize caching
config.cacheStores = [];

// Set higher timeout values
config.resolver.resolveRequest = {
  ...config.resolver.resolveRequest,
  timeout: 60000,
};

module.exports = config; 