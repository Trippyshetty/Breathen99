/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // static export → works with Netlify via GitHub
  trailingSlash: true,
  images: {
    unoptimized: true,   // required for static export
  },
};

module.exports = nextConfig;
