/** @type {import('next').NextConfig} */

// GitHub Pages serves project sites from a subpath (/rcv-simulator-va), so the
// production build needs basePath/assetPrefix to point assets at that prefix.
// Local dev (NODE_ENV !== 'production') stays at the root so localhost works.
const repo = 'rcv-simulator-va';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
};

export default nextConfig;
