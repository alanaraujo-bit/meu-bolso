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
  
  // Configurações para upload de arquivos
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },
  
  // Configurações de timezone para produção
  env: {
    TZ: 'America/Sao_Paulo',
  },
  
  // Headers para timezone e CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'x-timezone',
            value: 'America/Sao_Paulo',
          },
        ],
      },
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
