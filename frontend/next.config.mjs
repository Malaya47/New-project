const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/invoice/:id",
        destination: `${backendUrl}/invoice/:id`,
      },
      {
        source: "/invoice-text/:id",
        destination: `${backendUrl}/invoice-text/:id`,
      },
    ];
  },
};

export default nextConfig;
