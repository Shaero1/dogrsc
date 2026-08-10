import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const monorepoRoot = path.join(__dirname, '..');

const nextConfig: NextConfig = {
  output: 'standalone',
  // Standalone Docker build traces deps from monorepo root.
  outputFileTracingRoot: monorepoRoot,
  // Report forms upload photos via Server Actions (backend allows up to 5 MB).
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
};

export default withNextIntl(nextConfig);
