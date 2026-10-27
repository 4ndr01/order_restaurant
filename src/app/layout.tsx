import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { publicSiteUrl } from "@/lib/base-url";
import { BRAND_NAME } from "@/lib/brand";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const defaultTitle = `${BRAND_NAME} : commande à table, payée sur votre compte`;
const defaultDescription =
  "Vos clients scannent le QR code de leur table, commandent et suivent la préparation en direct.";

export const metadata: Metadata = {
  metadataBase: publicSiteUrl(),
  applicationName: BRAND_NAME,
  title: {
    default: defaultTitle,
    template: `%s | ${BRAND_NAME}`,
  },
  description: defaultDescription,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: BRAND_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: BRAND_NAME },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1F4D36",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
