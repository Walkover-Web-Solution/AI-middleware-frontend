module.exports = {
  reactStrictMode: false,
  output: {
    outputFileTracingRoot: __dirname,
  },
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
};
