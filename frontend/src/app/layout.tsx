import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://truescan-weld.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TrueScan | AI Deepfake & Media Authenticity Detector",
  description: "Multi-modal AI forensics engine detecting AI-generated images, synthetic voice clones, and deepfake videos with neural vision transformers and cryptographic C2PA provenance.",
  keywords: [
    "deepfake detector",
    "ai image detector",
    "voice clone detector",
    "video deepfake analysis",
    "c2pa provenance",
    "media forensics",
    "truescan"
  ],
  authors: [{ name: "TrueScan Forensics" }],
  creator: "TrueScan",
  publisher: "TrueScan",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" }
    ],
    apple: [
      { url: "/icon.png" },
      { url: "/logo.png" }
    ],
  },
  openGraph: {
    title: "TrueScan | AI Deepfake & Media Authenticity Detector",
    description: "Multi-modal AI forensics engine detecting AI-generated images, synthetic voice clones, and deepfake videos.",
    url: siteUrl,
    siteName: "TrueScan",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TrueScan Deepfake Forensics Banner",
      },
      {
        url: "/logo.png",
        width: 1254,
        height: 1254,
        alt: "TrueScan Logo",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueScan | AI Deepfake & Media Authenticity Detector",
    description: "Multi-modal AI forensics engine detecting AI-generated images, synthetic voice clones, and deepfake videos.",
    images: ["/og-image.png", "/logo.png"],
    creator: "@truescan",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#070B14] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
