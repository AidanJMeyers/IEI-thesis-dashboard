/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  // Static export is used for the GitHub Pages deployment. On Vercel the app
  // builds normally (server routes available for the Supabase-backed mode).
  ...(isStaticExport ? { output: 'export', images: { unoptimized: true } } : {}),
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: isStaticExport,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
