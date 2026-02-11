import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Domine } from "next/font/google";
import MetaHeader from "@/components/layout/MetaHeader";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const domine = Domine({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "耐心猎人 — 资产管理",
  description: "耐心猎人资产管理仪表盘",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${dmSans.variable} ${dmMono.variable} ${domine.variable}`}>
        <div className="app-container">
          <MetaHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
