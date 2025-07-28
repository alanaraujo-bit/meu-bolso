/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Configurações de timezone para produção
  env: {
    TZ: 'America/Sao_Paulo',
  },
  // Headers para timezone
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'x-timezone',
            value: 'America/Sao_Paulo',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
