import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
      // Negotiate AVIF first, fall back to WebP, then the original.
      formats: ['image/avif', 'image/webp'],
      remotePatterns: [
        // Photographs served through the existing _WEB CloudFront distribution
        // (Jae's portfolio + site videos / web assets). The distribution's
        // Origin path strips `web-assets/` from public URLs, so paths look like
        // /jaecha/... or /videos/... here.
        {
          protocol: 'https',
          hostname: 'd1p8zj8c9e597h.cloudfront.net',
        },
        // Photobooth photos go through a separate distribution.
        {
          protocol: 'https',
          hostname: 'd2vfr1f16q1hyq.cloudfront.net',
        },
      ],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY' // Prevents iframe embedding (clickjacking)
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff' // Prevents MIME sniffing attacks
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin' // Controls referrer info
            }
          ]
        }
      ]
    }
  }

export default nextConfig;
