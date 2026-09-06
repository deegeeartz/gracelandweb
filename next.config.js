/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'jsonwebtoken',
    'semver',
    'bcrypt',
    'bcryptjs',
    'mysql2',
    'sharp'
  ]
};

module.exports = nextConfig;
