/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["your-domain.de", "app.your-domain.de"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zdpbibnixeydfncoraga.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/profile-images/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Host",
            value: ":authority",
          },
        ],
      },
    ];
  },
  // Hier können wir später Redirects konfigurieren falls nötig
  async redirects() {
    return [];
  },
  // Rewrites für spezielle URL-Pfade
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
    ppr: "incremental",
  },
};

export default nextConfig;
