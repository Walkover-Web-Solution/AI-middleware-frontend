const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  {
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
    reactStrictMode: true, // It's better to keep strict mode enabled
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (process.env.NEXT_PUBLIC_ENV !== 'local') {
        if (process.env.NEXT_PUBLIC_SENTRY_DSN_URL) {
          // Ensure the Sentry DSN is set and defined in the environment
          config.plugins.push(
            new webpack.DefinePlugin({
              'process.env.SENTRY_DSN': JSON.stringify(process.env.NEXT_PUBLIC_SENTRY_DSN_URL),
            })
          );
        } else {
          console.warn("SENTRY_DSN is not defined in environment variables.");
        }
      }
      return config;
    },
    env: {
      // Exporting environment variables to be available throughout the app
      NEXT_PUBLIC_SENTRY_DSN_URL: process.env.NEXT_PUBLIC_SENTRY_DSN_URL, // Server-side access
      NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,         // Client-side access
    },
  },
  {
    // Sentry configuration options
    org: "walkover-gz",
    project: "ai-middleware",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
