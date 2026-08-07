import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  // Report forms upload photos via Server Actions (backend allows up to 5 MB).
  serverActions: {
    bodySizeLimit: '6mb',
  },
};

export default withNextIntl(nextConfig);
