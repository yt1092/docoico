import { join } from 'path';

const nextConfig = {
  experimental: {
    appDir: true
  },
  eslint: {
    dirs: ['src']
  }
};

export default nextConfig;
