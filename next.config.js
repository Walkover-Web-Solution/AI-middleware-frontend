module.exports = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  reactStrictMode: false,
  webpack(config, { isServer }) {
    // Exclude async_hooks from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
      };
    }
    return config;
  },
};
