const lifecycle = process.env.npm_lifecycle_event;
const isVercelBuild = process.env.VERCEL === '1';
const defaultDistDir = lifecycle === 'build' || lifecycle === 'start'
  ? '.next-build-check'
  : '.next';

const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Keep production builds separate from the cache used by a running dev server.
  distDir: process.env.NEXT_BUILD_DIR || (isVercelBuild ? '.next' : defaultDistDir),
};

export default nextConfig;
