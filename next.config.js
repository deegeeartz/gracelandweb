/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'bcryptjs',
    'mysql2',
    'sharp'
  ]
};

module.exports = nextConfig;
