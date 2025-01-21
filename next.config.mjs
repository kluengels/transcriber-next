/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["crypr"],

  // needed for docker export
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "1000mb",
    },
  },
};

export default nextConfig;
