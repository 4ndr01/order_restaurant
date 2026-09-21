import type { NextConfig } from "next";

// `frame-ancestors 'none'` empêche d'enfermer le site dans une iframe : sans
// ça, un tiers peut superposer une page invisible par-dessus l'espace de
// gestion pour faire cliquer un restaurateur sur des actions à son insu
// (clickjacking). X-Frame-Options couvre les navigateurs plus anciens.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
