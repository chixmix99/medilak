// Environment configuration for local development
// Import this file at the top of your index.js or App.js

if (process.env.NODE_ENV !== 'production') {
  process.env.EXPO_DEVTOOLS_LISTEN_ADDRESS = '0.0.0.0';
  process.env.EXPO_PUBLIC_LOCAL_ADDRESS = 'true';
  process.env.EXPO_USE_TUNNEL = 'true';
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = 'localhost';
}

export default {
  EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
  EXPO_PUBLIC_LOCAL_ADDRESS: true,
  EXPO_USE_TUNNEL: true,
  REACT_NATIVE_PACKAGER_HOSTNAME: 'localhost'
}; 