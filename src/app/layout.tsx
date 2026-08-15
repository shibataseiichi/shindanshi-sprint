import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: { default: "診断士 Sprint", template: "%s | 診断士 Sprint" },
  description: "演習から弱点復習までを最短化する、診断士試験向けオフライン学習PWA",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: { icon: `${basePath}/icon.svg` },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "診断士Sprint" },
};

export const viewport: Viewport = { themeColor: "#153a32", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
