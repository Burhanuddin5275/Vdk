const { withAndroidManifest } = require('@expo/config-plugins');

const withNetworkSecurityConfig = (config) => {
  return withAndroidManifest(config, async (config) => {
    const { manifest } = config.modResults;
    
    // Ensure the application tag exists
    if (!Array.isArray(manifest['application'])) {
      console.warn('withNetworkSecurityConfig: No application array in manifest');
      return config;
    }

    // Add network security config
    manifest['application'][0]['$']['android:usesCleartextTraffic'] = 'true';
    
    return config;
  });
};

module.exports = withNetworkSecurityConfig;
