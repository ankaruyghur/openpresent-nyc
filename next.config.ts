import type { NextConfig } from "next";

const nextConfig = {
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
