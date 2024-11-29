module.exports = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        ...config.node,
        fs: 'empty',  // Mock the 'fs' module
        net: 'empty',  // Mock the 'net' module
        tls: 'empty',  // Mock the 'tls' module
        async_hooks: 'empty',  // Mock the 'async_hooks' module
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false, // Mock async_hooks for the browser
      };
    }
    return config;
  },
};
