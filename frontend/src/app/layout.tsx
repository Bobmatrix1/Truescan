import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueScan | Media Authenticity & Deepfake Detector",
  description: "High-precision media authenticity analyzer for photos, videos, and voice recordings.",
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
